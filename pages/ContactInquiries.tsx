
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, addInquiry, updateInquiry, removeInquiry, addLog, setInquiries } from '../store';
import { ContactInquiry, Status } from '../types';
import { Icons, getStatusStyles } from '../constants';
import { analyzeInquiry } from '../services/geminiService';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';

const ContactInquiries: React.FC = () => {
  const { inquiries, user } = useSelector((state: RootState) => state.admin);
  const dispatch = useDispatch();

  const fetchContacts = async () => {
    const contacts = await apiService.getContacts();
    if (contacts.length > 0) {
      // Map backend data to frontend structure
      const formattedContacts = contacts.map((c: any) => ({
        id: c.id,
        name: c.name || 'Unknown',
        email: c.email || '',
        phone: c.phone || '',
        subject: c.subject || 'General Inquiry',
        message: c.message || '',
        date: c.date || new Date().toISOString().split('T')[0], // Fallback date
        status: c.status || Status.PENDING
      }));
      dispatch(setInquiries(formattedContacts));
    }
  };

  useEffect(() => {
    fetchContacts();

    // Real-time updates
    const socket = socketService.connect();
    socket.on('data_updated', (payload) => {
      if (payload.module === 'contacts') {
        fetchContacts();
      }
    });

    return () => {
      // socket.off('data_updated');
    };
  }, [dispatch]);

  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newInquiry, setNewInquiry] = useState<Partial<ContactInquiry>>({ status: Status.PENDING });

  const [editingInquiry, setEditingInquiry] = useState<ContactInquiry | null>(null);

  const handleAnalyze = async (msg: string) => {
    setIsAnalyzing(true);
    const result = await analyzeInquiry(msg);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleToggleResolved = async (e: React.ChangeEvent<HTMLInputElement>, iq: ContactInquiry) => {
    e.stopPropagation();
    const isChecked = e.target.checked;
    const newStatus = isChecked ? Status.RESOLVED : Status.PENDING;
    const updatedInquiry = { ...iq, status: newStatus };

    try {
      await apiService.updateContact(updatedInquiry);
      dispatch(updateInquiry(updatedInquiry));
      dispatch(addLog({
        activity: `Marked inquiry from ${iq.name} as ${newStatus}`,
        admin: user?.name || 'Admin',
        status: 'info'
      }));
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleAddSubmit = async () => {
    if (!newInquiry.name || !newInquiry.email) return;
    const entry: any = {
      ...newInquiry,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const savedInquiry = await apiService.addContact(entry);
      // Backend should return the full object with ID
      const formattedInquiry: ContactInquiry = {
        id: savedInquiry.id || savedInquiry._id,
        name: savedInquiry.name,
        email: savedInquiry.email,
        phone: savedInquiry.phone,
        subject: savedInquiry.subject,
        message: savedInquiry.message,
        date: savedInquiry.date,
        status: savedInquiry.status
      };

      dispatch(addInquiry(formattedInquiry));
      dispatch(addLog({ activity: `Manually added inquiry from ${formattedInquiry.name}`, admin: user?.name || 'Admin', status: 'success' }));
      setShowAddModal(false);
      setNewInquiry({ status: Status.PENDING });
    } catch (error) {
      alert("Failed to add inquiry");
    }
  };

  const handleUpdateSubmit = async () => {
    if (editingInquiry) {
      try {
        await apiService.updateContact(editingInquiry);
        dispatch(updateInquiry(editingInquiry));
        dispatch(addLog({ activity: `Updated inquiry state for ${editingInquiry.name}`, admin: user?.name || 'Admin', status: 'info' }));
        setEditingInquiry(null);
      } catch (error) {
        alert("Failed to update inquiry");
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the inquiry from ${name}?`)) {
      try {
        await apiService.deleteContact(id);
        dispatch(removeInquiry(id));
        dispatch(addLog({ activity: `Deleted inquiry record: ${name}`, admin: user?.name || 'Admin', status: 'warning' }));
      } catch (error) {
        alert("Failed to delete inquiry");
      }
    }
  };

  return (
    <div className="p-4 lg:p-8 animate-saas max-w-7xl mx-auto pb-24">
      <div className="ds-card">
        <div className="px-6 lg:px-8 py-5 lg:py-6 border-b border-[var(--border-ds)] flex items-center justify-between gap-4">
          <div className="overflow-hidden">
            <h2 className="text-base font-bold text-[var(--text-main)] tracking-tight truncate">Inquiry Inbox</h2>
            <p className="text-xs text-[var(--text-sub)] mt-0.5 truncate hidden sm:block">Manage communication streams</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="ds-button bg-neutral-900 text-white hover:bg-neutral-800 h-10 px-4 text-xs shrink-0 min-w-[44px]"
          >
            Add Inquiry
          </button>
        </div>

        {/* Responsive Table Logic */}
        <div className="ghost-scroll">
          {/* Desktop View: Above 1024px */}
          <table className="hidden lg:table w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[var(--bg-input)]">
                <th className="ds-table-header w-12 text-center">Done</th>
                <th className="ds-table-header">Phone</th>
                <th className="ds-table-header">Email</th>
                <th className="ds-table-header">Name</th>
                <th className="ds-table-header">Subject</th>
                <th className="ds-table-header">Status</th>
                <th className="ds-table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-ds)]">
              {inquiries.length === 0 ? (
                <tr><td colSpan={7} className="px-8 py-12 text-center text-[var(--text-muted)]">Empty Inbox</td></tr>
              ) : inquiries.map((iq) => (
                <tr key={iq.id} className={`hover:bg-[var(--bg-hover)] group transition-opacity ${iq.status === Status.RESOLVED ? 'opacity-60' : ''}`}>
                  <td className="ds-table-cell text-center">
                    <input
                      id={`check-iq-${iq.id}`}
                      type="checkbox"
                      checked={iq.status === Status.RESOLVED}
                      onChange={(e) => handleToggleResolved(e, iq)}
                      title="Mark as Resolved"
                      className="w-5 h-5 rounded-md border-[var(--border-ds)] text-[#FF850A] focus:ring-[#FF850A] cursor-pointer"
                    />
                  </td>
                  <td className="ds-table-cell text-[12px] font-medium text-[var(--text-sub)]">
                    {iq.phone || 'N/A'}
                  </td>
                  <td className="ds-table-cell text-[12px] font-medium text-[var(--text-sub)]">
                    {iq.email}
                  </td>
                  <td className="ds-table-cell text-[13px] font-bold text-[var(--text-main)]">
                    {iq.name}
                  </td>
                  <td className="ds-table-cell text-[13px] font-medium text-[var(--text-sub)]">
                    {iq.subject}
                  </td>
                  <td className="ds-table-cell">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(iq.status)}`}>
                      {iq.status}
                    </span>
                  </td>
                  <td className="ds-table-cell text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setSelectedInquiry(iq); setAiAnalysis(''); }}
                        className="min-h-[44px] min-w-[44px] text-[10px] font-bold text-[var(--text-main)] bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] px-3 py-1.5 rounded-lg border border-[var(--border-ds)]"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setEditingInquiry(iq)}
                        className="min-h-[44px] min-w-[44px] text-[10px] font-bold text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/20"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(iq.id, iq.name)}
                        className="min-h-[44px] min-w-[44px] text-[10px] font-bold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile View: Row-to-Card Transformation Below 1024px */}
          <div className="lg:hidden p-4 space-y-4">
            {inquiries.length === 0 ? (
              <div className="py-12 text-center text-[var(--text-muted)] italic text-sm">Empty Inbox</div>
            ) : inquiries.map((iq) => (
              <div key={iq.id} className={`ds-card flex flex-col bg-[var(--bg-input)] border border-[var(--border-ds)] transition-opacity ${iq.status === Status.RESOLVED ? 'opacity-60' : ''}`}>
                <div className="p-5 space-y-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <input
                        id={`mob-check-iq-${iq.id}`}
                        type="checkbox"
                        checked={iq.status === Status.RESOLVED}
                        onChange={(e) => handleToggleResolved(e, iq)}
                        className="w-5 h-5 mt-0.5 rounded-md border-[var(--border-ds)] text-[#FF850A] focus:ring-[#FF850A] cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-bold text-[var(--text-main)]">{iq.name}</p>
                        <p className="text-[11px] text-[var(--text-sub)] mt-0.5">{iq.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${getStatusStyles(iq.status)}`}>
                      {iq.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-ds)] pt-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Phone</p>
                      <p className="text-xs font-medium text-[var(--text-sub)]">{iq.phone || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Date</p>
                      <p className="text-xs font-medium text-[var(--text-sub)]">{iq.date}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Subject</p>
                    <p className="text-xs font-medium text-[var(--text-main)]">{iq.subject}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Message</p>
                    <p className="text-xs text-[var(--text-sub)] line-clamp-3">{iq.message}</p>
                  </div>
                </div>

                {/* Actions Button Group at Bottom */}
                <div className="border-t border-[var(--border-ds)] flex divide-x divide-[var(--border-ds)]">
                  <button
                    onClick={() => { setSelectedInquiry(iq); setAiAnalysis(''); }}
                    className="flex-1 min-h-[56px] text-[10px] font-bold text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors uppercase tracking-widest"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setEditingInquiry(iq)}
                    className="flex-1 min-h-[56px] text-[10px] font-bold text-blue-600 hover:bg-blue-500/5 transition-colors uppercase tracking-widest"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(iq.id, iq.name)}
                    className="flex-1 min-h-[56px] text-[10px] font-bold text-rose-600 hover:bg-rose-500/5 transition-colors uppercase tracking-widest"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View/Analyze Modal */}
      {selectedInquiry && (
        <div className="ds-modal-overlay">
          <div className="ds-modal-content max-w-2xl mx-4">
            <div className="px-6 lg:px-8 py-5 lg:py-6 border-b border-[var(--border-ds)] flex justify-between items-start bg-[var(--bg-card)] sticky top-0 z-10">
              <div className="overflow-hidden">
                <h2 className="text-lg lg:text-xl font-bold text-[var(--text-main)] tracking-tight truncate">{selectedInquiry.subject}</h2>
                <p className="text-[10px] text-[var(--text-sub)] mt-1 truncate">Thread from <span className="font-bold text-[var(--text-main)]">{selectedInquiry.name}</span></p>
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="p-2 hover:bg-[var(--bg-hover)] rounded-lg text-[var(--text-muted)] min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Icons.ArrowRight />
              </button>
            </div>
            <div className="ds-modal-body space-y-6 lg:space-y-8 p-6 lg:p-8">
              <div className="bg-[var(--bg-input)] rounded-2xl p-5 lg:p-6 text-[14px] leading-relaxed text-[var(--text-main)] border border-[var(--border-ds)]">{selectedInquiry.message}</div>
              {aiAnalysis ? (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 lg:p-6 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-4 text-amber-500"><Icons.Sparkles /><span className="font-bold text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-500">Suggested Analysis</span></div>
                  <div className="text-sm text-[var(--text-main)] leading-relaxed italic">{aiAnalysis}</div>
                </div>
              ) : (
                <button onClick={() => handleAnalyze(selectedInquiry.message)} disabled={isAnalyzing} className="w-full h-12 bg-neutral-900 text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-neutral-800 dark:bg-[var(--bg-input)] dark:hover:bg-[var(--bg-hover)] disabled:opacity-50 transition-all shadow-sm">
                  {isAnalyzing ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" /> : <Icons.Sparkles />}
                  {isAnalyzing ? 'Processing...' : 'Run Analysis'}
                </button>
              )}
            </div>
            <div className="px-6 lg:px-8 py-4 border-t border-[var(--border-ds)] bg-[var(--bg-input)] flex justify-end gap-3">
              <button onClick={() => setSelectedInquiry(null)} className="px-4 py-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] min-h-[44px]">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="ds-modal-overlay">
          <div className="ds-modal-content mx-4">
            <div className="px-6 lg:px-8 py-5 lg:py-6 border-b border-[var(--border-ds)] flex justify-between items-center bg-[var(--bg-card)]">
              <h3 className="font-bold text-[var(--text-main)]">New Inquiry Intake</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--text-muted)] min-h-[44px] min-w-[44px] flex items-center justify-center"><Icons.ArrowRight /></button>
            </div>
            <div className="ds-modal-body space-y-4 p-6 lg:p-8">
              <input placeholder="Full Name" className="ds-input" onChange={e => setNewInquiry({ ...newInquiry, name: e.target.value })} />
              <input placeholder="Email Address" className="ds-input" onChange={e => setNewInquiry({ ...newInquiry, email: e.target.value })} />
              <input placeholder="Phone Number" className="ds-input" onChange={e => setNewInquiry({ ...newInquiry, phone: e.target.value })} />
              <input placeholder="Subject" className="ds-input" onChange={e => setNewInquiry({ ...newInquiry, subject: e.target.value })} />
              <textarea placeholder="Message Body" className="ds-input h-32 py-3" onChange={e => setNewInquiry({ ...newInquiry, message: e.target.value })} />
            </div>
            <div className="px-6 lg:px-8 py-4 border-t border-[var(--border-ds)] flex justify-end gap-3 bg-[var(--bg-input)]">
              <button onClick={handleAddSubmit} className="ds-button bg-neutral-900 text-white w-full h-12">Add Inquiry</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingInquiry && (
        <div className="ds-modal-overlay">
          <div className="ds-modal-content mx-4">
            <div className="px-6 lg:px-8 py-5 lg:py-6 border-b border-[var(--border-ds)] flex justify-between items-center bg-[var(--bg-card)]">
              <h3 className="font-bold text-[var(--text-main)]">Update Status</h3>
              <button onClick={() => setEditingInquiry(null)} className="text-[var(--text-muted)] min-h-[44px] min-w-[44px] flex items-center justify-center"><Icons.ArrowRight /></button>
            </div>
            <div className="ds-modal-body space-y-4 p-6 lg:p-8">
              <div className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-ds)] overflow-hidden">
                <p className="text-xs font-bold text-[var(--text-main)] truncate">{editingInquiry.name}</p>
                <p className="text-[10px] text-[var(--text-sub)] truncate mt-1">{editingInquiry.subject}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Current Status</label>
                <select
                  className="ds-input appearance-none"
                  value={editingInquiry.status}
                  onChange={e => setEditingInquiry({ ...editingInquiry, status: e.target.value as Status })}
                >
                  <option value={Status.PENDING}>Pending</option>
                  <option value={Status.RESOLVED}>Resolved</option>
                </select>
              </div>
            </div>
            <div className="px-6 lg:px-8 py-4 border-t border-[var(--border-ds)] flex justify-end gap-3 bg-[var(--bg-input)]">
              <button onClick={handleUpdateSubmit} className="ds-button bg-neutral-900 text-white w-full h-12">Save State</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactInquiries;
