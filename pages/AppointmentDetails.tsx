
import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, addAppointment, updateAppointment, removeAppointment, addLog, setAppointments } from '../store';
import { Appointment, Status, Urgency, MatchProfile } from '../types';
import { Icons, getStatusStyles, CLASS_SUBJECT_MAPPING } from '../constants';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';

const AppointmentDetails: React.FC = () => {
  const { appointments, user } = useSelector((state: RootState) => state.admin);
  const dispatch = useDispatch();

  const fetchBookings = async () => {
    const bookings = await apiService.getBookings();
    if (bookings.length > 0) {
      // Map backend data to frontend structure
      const formattedBookings = bookings.map((b: any) => ({
        id: b.id,
        parentName: b.parentName || b.name || 'Unknown',
        childName: b.childName || 'Intake Pending',
        email: b.email || '',
        phone: b.phone || 'N/A',
        date: b.date || '',
        time: b.time || '',
        topic: b.topic || 'General Consultation',
        status: b.status || Status.SCHEDULED,
        matchProfile: b.matchProfile || undefined
      }));
      dispatch(setAppointments(formattedBookings));
    }
  };

  useEffect(() => {
    fetchBookings();

    // Real-time updates
    const socket = socketService.connect();
    socket.on('data_updated', (payload) => {
      if (payload.module === 'bookings') {
        fetchBookings();
      }
    });

    return () => {
      // socket.off('data_updated');
    };
  }, [dispatch]);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState<Appointment | null>(null);

  const [newBooking, setNewBooking] = useState({
    parentName: '',
    phone: '',
    date: '',
    time: ''
  });

  const [editingApt, setEditingApt] = useState<Appointment | null>(null);

  const [profileData, setProfileData] = useState<MatchProfile>({
    selectedClass: '',
    subjects: [],
    isManualSubject: false,
    manualSubjectName: '',
    urgency: Urgency.MEDIUM,
    deadline: '',
    parentBudget: '',
    isFinalized: false
  });

  const handleToggleAttended = async (e: React.ChangeEvent<HTMLInputElement>, apt: Appointment) => {
    e.stopPropagation();
    const isChecked = e.target.checked;

    // Controlled Check: Prevent marking attended if profile isn't finalized unless confirmed
    if (isChecked && !apt.matchProfile?.isFinalized) {
      const proceed = window.confirm("Academic profile is not finalized. Mark as attended anyway?");
      if (!proceed) return; // React will re-render with the old status (unchecked)
    }

    const newStatus = isChecked ? Status.COMPLETED : Status.SCHEDULED;
    const updatedApt = { ...apt, status: newStatus };

    try {
      await apiService.updateBooking(updatedApt);
      dispatch(updateAppointment(updatedApt));
      dispatch(addLog({
        activity: `Marked booking for ${apt.parentName} as ${newStatus}`,
        admin: user?.name || 'Admin',
        status: 'info'
      }));
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleConfirmBooking = async () => {
    if (!newBooking.parentName || !newBooking.phone || !newBooking.date || !newBooking.time) {
      alert("Please fill in all intake fields.");
      return;
    }

    const booking: any = {
      name: newBooking.parentName,
      phone: newBooking.phone,
      date: newBooking.date,
      time: newBooking.time,
    };

    try {
      const savedBooking = await apiService.addBooking(booking);

      const formattedBooking: Appointment = {
        id: savedBooking.id || savedBooking.ref?.id,
        parentName: savedBooking.name,
        childName: 'Intake Pending',
        email: '',
        phone: savedBooking.phone,
        date: savedBooking.date,
        time: savedBooking.time,
        topic: 'General Consultation',
        status: Status.SCHEDULED
      };

      dispatch(addAppointment(formattedBooking));
      setShowBookingModal(false);
      setNewBooking({ parentName: '', phone: '', date: '', time: '' });
    } catch (error) {
      alert("Failed to create booking");
    }
  };

  const handleUpdateSubmit = async () => {
    if (editingApt) {
      if (editingApt.status === Status.COMPLETED && !editingApt.matchProfile?.isFinalized) {
        alert("Operation Restricted: Academic Profile must be finalized before marking a session as Completed.");
        return;
      }
      try {
        await apiService.updateBooking(editingApt);
        dispatch(updateAppointment(editingApt));
        setEditingApt(null);
      } catch (error) {
        alert("Failed to update booking");
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Permanently remove appointment record for ${name}?`)) {
      try {
        await apiService.deleteBooking(id);
        dispatch(removeAppointment(id));
        dispatch(addLog({ activity: `Appointment for ${name} deleted from registry`, admin: user?.name || 'Admin', status: 'warning' }));
      } catch (error) {
        alert("Failed to delete booking");
      }
    }
  };

  const openMatchProfile = (apt: Appointment) => {
    setProfileData(apt.matchProfile || {
      selectedClass: '',
      subjects: [],
      isManualSubject: false,
      manualSubjectName: '',
      urgency: Urgency.MEDIUM,
      deadline: '',
      parentBudget: '',
      isFinalized: false
    });
    setShowProfileModal(apt);
  };

  const saveMatchProfile = async (finalize: boolean = false) => {
    if (showProfileModal) {
      const updatedApt = {
        ...showProfileModal,
        matchProfile: { ...profileData, isFinalized: finalize }
      };
      try {
        await apiService.updateBooking(updatedApt);
        dispatch(updateAppointment(updatedApt));
        setShowProfileModal(null);
      } catch (error) {
        alert("Failed to update profile");
      }
    }
  };

  const isProfileValid = useMemo(() => {
    const hasCategory = !!profileData.selectedClass;
    const hasBudget = !!profileData.parentBudget.trim();
    const hasManualRequirementMet = profileData.isManualSubject ? !!profileData.manualSubjectName?.trim() : true;
    return hasCategory && hasBudget && hasManualRequirementMet;
  }, [profileData.selectedClass, profileData.parentBudget, profileData.isManualSubject, profileData.manualSubjectName]);

  const availableSubjects = useMemo(() => {
    if (!profileData.selectedClass) return [];
    return CLASS_SUBJECT_MAPPING[profileData.selectedClass] || [];
  }, [profileData.selectedClass]);

  const toggleSubject = (sub: string) => {
    setProfileData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(sub)
        ? prev.subjects.filter(s => s !== sub)
        : [...prev.subjects, sub]
    }));
  };

  const handleBudgetInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleanVal = val.replace(/[^0-9/h\s]/g, '');
    setProfileData({ ...profileData, parentBudget: cleanVal });
  };

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
  ];

  return (
    <div className="p-4 lg:p-8 animate-saas max-w-7xl mx-auto pb-24">
      <div className="ds-card">
        <div className="px-6 lg:px-8 py-5 lg:py-6 border-b border-[var(--border-ds)] flex items-center justify-between gap-4">
          <div className="overflow-hidden">
            <h2 className="text-base font-bold text-[var(--text-main)] tracking-tight truncate">Appointments</h2>
            <p className="text-xs text-[var(--text-sub)] mt-0.5 font-medium truncate hidden sm:block">Manage consultation registry</p>
          </div>
          <button
            onClick={() => setShowBookingModal(true)}
            className="ds-button bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm h-10 px-4 min-w-[44px]"
          >
            <Icons.Calendar />
            <span className="hidden sm:inline">Add Booking</span>
          </button>
        </div>

        <div className="ghost-scroll">
          <table className="hidden lg:table w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[var(--bg-input)]">
                <th className="ds-table-header w-12 text-center">Attended</th>
                <th className="ds-table-header">Name</th>
                <th className="ds-table-header">Phone</th>
                <th className="ds-table-header">Date</th>
                <th className="ds-table-header">Time</th>
                <th className="ds-table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-ds)]">
              {appointments.length === 0 ? (
                <tr><td colSpan={6} className="ds-table-cell text-center py-20 text-[var(--text-muted)] italic">No active bookings detected</td></tr>
              ) : appointments.map((apt) => (
                <tr key={apt.id} className={`hover:bg-[var(--bg-input)] transition-colors ${apt.status === Status.COMPLETED ? 'opacity-60' : ''}`}>
                  <td className="ds-table-cell text-center">
                    <input
                      id={`check-apt-${apt.id}`}
                      type="checkbox"
                      checked={apt.status === Status.COMPLETED}
                      onChange={(e) => handleToggleAttended(e, apt)}
                      title="Mark as Attended"
                      className="w-5 h-5 rounded-md border-[var(--border-ds)] accent-[#FF850A] cursor-pointer"
                    />
                  </td>
                  <td className="ds-table-cell">
                    <p className="text-[13px] font-bold text-[var(--text-main)]">{apt.parentName}</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Child: {apt.childName}</p>
                  </td>
                  <td className="ds-table-cell text-[13px] font-medium text-[var(--text-sub)]">{apt.phone}</td>
                  <td className="ds-table-cell text-[13px] font-bold text-[var(--text-main)]">{apt.date}</td>
                  <td className="ds-table-cell text-[13px] font-medium text-[var(--text-sub)]">{apt.time}</td>
                  <td className="ds-table-cell text-right">
                    <div className="flex justify-end gap-2.5">
                      <button
                        onClick={() => openMatchProfile(apt)}
                        className={`p-2 rounded-lg border transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center ${apt.matchProfile?.isFinalized
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}
                      >
                        <Icons.RequirementTracker />
                      </button>
                      <button onClick={() => setEditingApt(apt)} className="min-h-[44px] min-w-[44px] text-[10px] font-bold text-blue-600 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20">Edit</button>
                      <button onClick={() => handleDelete(apt.id, apt.parentName)} className="min-h-[44px] min-w-[44px] text-[10px] font-bold text-rose-500 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="lg:hidden p-4 space-y-4">
            {appointments.length === 0 ? (
              <div className="py-12 text-center text-[var(--text-muted)] italic text-sm">No active bookings</div>
            ) : appointments.map((apt) => (
              <div key={apt.id} className={`ds-card flex flex-col bg-[var(--bg-input)] border border-[var(--border-ds)] transition-colors ${apt.status === Status.COMPLETED ? 'opacity-60' : ''}`}>
                <div className="p-5 space-y-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <input
                        id={`mob-check-apt-${apt.id}`}
                        type="checkbox"
                        checked={apt.status === Status.COMPLETED}
                        onChange={(e) => handleToggleAttended(e, apt)}
                        className="w-5 h-5 mt-0.5 rounded-md border-[var(--border-ds)] accent-[#FF850A] cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-bold text-[var(--text-main)]">{apt.parentName}</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Child: {apt.childName}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${getStatusStyles(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-ds)] pt-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Phone</p>
                      <p className="text-xs font-medium text-[var(--text-sub)]">{apt.phone}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Date</p>
                      <p className="text-xs font-medium text-[var(--text-sub)]">{apt.date}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Time Slot</p>
                    <p className="text-xs font-medium text-[var(--text-main)]">{apt.time}</p>
                  </div>
                </div>

                <div className="border-t border-[var(--border-ds)] flex divide-x divide-[var(--border-ds)] overflow-hidden">
                  <button
                    onClick={() => openMatchProfile(apt)}
                    className={`flex-1 min-h-[56px] flex items-center justify-center transition-colors ${apt.matchProfile?.isFinalized
                      ? 'bg-emerald-500/5 text-emerald-500'
                      : 'bg-amber-500/5 text-amber-500'
                      }`}
                  >
                    <Icons.RequirementTracker />
                  </button>
                  <button
                    onClick={() => setEditingApt(apt)}
                    className="flex-1 min-h-[56px] text-[10px] font-bold text-blue-600 hover:bg-blue-500/5 uppercase tracking-widest"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(apt.id, apt.parentName)}
                    className="flex-1 min-h-[56px] text-[10px] font-bold text-rose-600 hover:bg-rose-500/5 uppercase tracking-widest"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showBookingModal && (
        <div className="ds-modal-overlay">
          <div className="ds-modal-content mx-4">
            <div className="px-6 lg:px-8 py-5 lg:py-6 border-b border-[var(--border-ds)] flex justify-between items-center bg-[var(--bg-card)]">
              <h3 className="font-bold text-[var(--text-main)]">New Consultation Intake</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-[var(--text-muted)] min-h-[44px] min-w-[44px] flex items-center justify-center"><Icons.ArrowRight /></button>
            </div>
            <div className="ds-modal-body space-y-4 p-6 lg:p-8">
              <input placeholder="Parent Name" className="ds-input" value={newBooking.parentName} onChange={e => setNewBooking({ ...newBooking, parentName: e.target.value })} />
              <input placeholder="Phone Number" className="ds-input" value={newBooking.phone} onChange={e => setNewBooking({ ...newBooking, phone: e.target.value })} />
              <input type="date" className="ds-input" value={newBooking.date} onChange={e => setNewBooking({ ...newBooking, date: e.target.value })} />
              <select className="ds-input" value={newBooking.time} onChange={e => setNewBooking({ ...newBooking, time: e.target.value })}>
                <option value="">Select Time Slot</option>
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="px-6 lg:px-8 py-4 border-t border-[var(--border-ds)] flex justify-end gap-3 bg-[var(--bg-input)]">
              <button onClick={handleConfirmBooking} className="ds-button bg-neutral-900 text-white w-full h-12">Confirm Booking</button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="ds-modal-overlay">
          <div className="ds-modal-content max-w-2xl mx-4">
            <div className="px-6 lg:px-8 py-5 lg:py-6 border-b border-[var(--border-ds)] flex justify-between items-center bg-[var(--bg-card)]">
              <div>
                <h3 className="font-bold text-[var(--text-main)]">Academic Requirement Profile</h3>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Assigned to: {showProfileModal.parentName}</p>
              </div>
              <button onClick={() => setShowProfileModal(null)} className="text-[var(--text-muted)] min-h-[44px] min-w-[44px] flex items-center justify-center"><Icons.ArrowRight /></button>
            </div>
            <div className="ds-modal-body space-y-6 p-6 lg:p-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Grade Category</label>
                <select
                  className="ds-input"
                  value={profileData.selectedClass}
                  onChange={e => setProfileData({ ...profileData, selectedClass: e.target.value, subjects: [], isManualSubject: false, manualSubjectName: '' })}
                >
                  <option value="">Select Level</option>
                  {Object.keys(CLASS_SUBJECT_MAPPING).map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>

              {profileData.selectedClass && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Subject Selection</label>
                    <div className="flex flex-wrap gap-2">
                      {availableSubjects.map(sub => (
                        <button
                          key={sub}
                          onClick={() => toggleSubject(sub)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${profileData.subjects.includes(sub)
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-[var(--bg-input)] text-[var(--text-sub)] border-[var(--border-ds)]'
                            }`}
                        >
                          {sub}
                        </button>
                      ))}
                      <button
                        onClick={() => setProfileData(prev => ({ ...prev, isManualSubject: !prev.isManualSubject }))}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 ${profileData.isManualSubject
                          ? 'bg-[#FF850A] text-white border-[#FF850A]'
                          : 'bg-[var(--bg-input)] text-[var(--text-sub)] border-[var(--border-ds)]'
                          }`}
                      >
                        {profileData.isManualSubject ? <Icons.Sparkles /> : '+'} Other
                      </button>
                    </div>
                  </div>

                  {profileData.isManualSubject && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Record Custom Subject</label>
                      <input
                        type="text"
                        placeholder="Enter specialized subject name..."
                        className="ds-input"
                        value={profileData.manualSubjectName || ''}
                        onChange={(e) => setProfileData({ ...profileData, manualSubjectName: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Parent Budget</label>
                  <input
                    type="text"
                    placeholder="e.g. 500/hr"
                    className="ds-input"
                    value={profileData.parentBudget}
                    onChange={handleBudgetInput}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Urgency</label>
                  <select
                    className="ds-input"
                    value={profileData.urgency}
                    onChange={e => setProfileData({ ...profileData, urgency: e.target.value as Urgency })}
                  >
                    {Object.values(Urgency).map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 lg:px-8 py-4 border-t border-[var(--border-ds)] flex gap-3 bg-[var(--bg-input)]">
              <button onClick={() => saveMatchProfile(false)} className="flex-1 px-4 py-3 bg-[var(--bg-input)] text-[var(--text-main)] font-bold rounded-xl border border-[var(--border-ds)]">Save Draft</button>
              <button
                onClick={() => saveMatchProfile(true)}
                disabled={!isProfileValid}
                className="flex-1 px-4 py-3 bg-neutral-900 text-white font-bold rounded-xl disabled:opacity-50"
              >
                Finalize Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {editingApt && (
        <div className="ds-modal-overlay">
          <div className="ds-modal-content mx-4">
            <div className="px-6 lg:px-8 py-5 lg:py-6 border-b border-[var(--border-ds)] flex justify-between items-center bg-[var(--bg-card)]">
              <h3 className="font-bold text-[var(--text-main)]">Edit Appointment</h3>
              <button onClick={() => setEditingApt(null)} className="text-[var(--text-muted)] min-h-[44px] min-w-[44px] flex items-center justify-center"><Icons.ArrowRight /></button>
            </div>
            <div className="ds-modal-body space-y-4 p-6 lg:p-8">
              <div className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-ds)]">
                <p className="text-sm font-bold text-[var(--text-main)]">{editingApt.parentName}</p>
                <p className="text-[11px] text-[var(--text-sub)] mt-1">Current: {editingApt.status}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Status Update</label>
                <select
                  className="ds-input"
                  value={editingApt.status}
                  onChange={e => setEditingApt({ ...editingApt, status: e.target.value as Status })}
                >
                  <option value={Status.SCHEDULED}>Scheduled</option>
                  <option value={Status.COMPLETED}>Completed</option>
                  <option value={Status.CANCELLED}>Cancelled</option>
                </select>
              </div>
            </div>
            <div className="px-6 lg:px-8 py-4 border-t border-[var(--border-ds)] bg-[var(--bg-input)]">
              <button onClick={handleUpdateSubmit} className="ds-button bg-neutral-900 text-white w-full h-12">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetails;
