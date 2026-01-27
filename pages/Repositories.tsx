
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, setRepositories, addRepository, updateRepository, removeRepository, Repository, addLog } from '../store';
import { apiService } from '../services/apiService';
import { useEffect } from 'react';

const Repositories: React.FC = () => {
  const { repositories, user } = useSelector((state: RootState) => state.admin);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchRepos = async () => {
      const repos = await apiService.getRepositories();
      console.log(repos);
      if (repos.length > 0) {
        dispatch(setRepositories(repos));
      }
    };
    fetchRepos();
  }, [dispatch]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Repository | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', url: '', category: 'Inquiries', assignedTo: '' });

  const handleSave = async () => {
    if (editForm) {
      try {
        await apiService.updateRepository(editForm);
        dispatch(updateRepository(editForm));
        dispatch(addLog({ activity: `Updated Repository: ${editForm.name}`, admin: user?.name || 'Admin', status: 'info' }));
        setEditingId(null);
      } catch (error) {
        alert("Failed to update repository");
      }
    }
  };

  const handleAddNew = async () => {
    if (newForm.name && newForm.url) {
      const repoData = {
        ...newForm,
        lastSync: 'Never',
        createdAt: new Date().toISOString()
      };

      try {
        const newRepo = await apiService.addRepository(repoData);
        dispatch(addRepository(newRepo));
        dispatch(addLog({ activity: `Created New Repository: ${newRepo.name}`, admin: user?.name || 'Admin', status: 'success' }));
        setShowAdd(false);
        setNewForm({ name: '', url: '', category: 'Inquiries', assignedTo: '' });
      } catch (error) {
        alert("Failed to create repository");
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await apiService.deleteRepository(id);
      dispatch(removeRepository(id));
      dispatch(addLog({ activity: `Deleted Repository: ${name}`, admin: user?.name || 'Admin', status: 'warning' }));
    } catch (error) {
      alert("Failed to delete repository");
    }
  };

  return (
    <div className="p-8 animate-saas max-w-7xl mx-auto pb-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Data Repositories</h2>
          <p className="text-xs text-neutral-500 mt-1">External sheet synchronization nodes</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="ds-button bg-neutral-900 text-white hover:bg-neutral-800"
        >
          Initialize Repository
        </button>
      </div>

      <div className="ds-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="ds-table-header">Node Name</th>
                <th className="ds-table-header">Cloud Link</th>
                <th className="ds-table-header">Category</th>
                <th className="ds-table-header">Custody</th>
                <th className="ds-table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {repositories.map((repo) => (
                <tr key={repo.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="ds-table-cell">
                    {editingId === repo.id ? (
                      <input
                        value={editForm?.name}
                        onChange={(e) => setEditForm({ ...editForm!, name: e.target.value })}
                        className="ds-input h-9"
                      />
                    ) : (
                      <span className="text-[13px] font-bold text-neutral-900">{repo.name}</span>
                    )}
                  </td>
                  <td className="ds-table-cell">
                    {editingId === repo.id ? (
                      <input
                        value={editForm?.url}
                        onChange={(e) => setEditForm({ ...editForm!, url: e.target.value })}
                        className="ds-input h-9"
                      />
                    ) : (
                      <a href={repo.url} target="_blank" className="text-blue-500 hover:underline text-[13px] truncate max-w-[180px] block font-medium">Sheets Interface</a>
                    )}
                  </td>
                  <td className="ds-table-cell">
                    {editingId === repo.id ? (
                      <select
                        value={editForm?.category}
                        onChange={(e) => setEditForm({ ...editForm!, category: e.target.value as any })}
                        className="ds-input h-9"
                      >
                        <option value="Inquiries">Inquiries</option>
                        <option value="Bookings">Bookings</option>
                        <option value="Manual Matches">Manual Matches</option>
                      </select>
                    ) : (
                      <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md uppercase tracking-wider">{repo.category || 'N/A'}</span>
                    )}
                  </td>
                  <td className="ds-table-cell">
                    {editingId === repo.id ? (
                      <input
                        value={editForm?.assignedTo}
                        onChange={(e) => setEditForm({ ...editForm!, assignedTo: e.target.value })}
                        className="ds-input h-9"
                      />
                    ) : (
                      <span className="text-[13px] font-medium text-neutral-600">{repo.assignedTo}</span>
                    )}
                  </td>
                  <td className="ds-table-cell text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === repo.id ? (
                        <button onClick={handleSave} className="px-3 py-1.5 bg-emerald-500 text-white text-[11px] font-bold rounded-lg">Save</button>
                      ) : (
                        <button onClick={() => { setEditingId(repo.id); setEditForm(repo); }} className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-[11px] font-bold rounded-lg hover:bg-neutral-200">Modify</button>
                      )}
                      <button onClick={() => handleDelete(repo.id, repo.name)} className="px-3 py-1.5 bg-rose-50 text-rose-500 text-[11px] font-bold rounded-lg hover:bg-rose-100">Drop</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="ds-modal-overlay">
          <div className="ds-modal-content">
            <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 tracking-tight">Provision Repository</h3>
                <p className="text-xs text-neutral-500 mt-1">Connect new synchronization endpoint</p>
              </div>
              <button
                onClick={() => setShowAdd(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="ds-modal-body space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Internal Reference</label>
                <input
                  placeholder="e.g. Master Admissions Log"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="ds-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Sheets Endpoint URL</label>
                <input
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={newForm.url}
                  onChange={(e) => setNewForm({ ...newForm, url: e.target.value })}
                  className="ds-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Data Category</label>
                <select
                  value={newForm.category}
                  onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                  className="ds-input"
                >
                  <option value="Inquiries">Inquiries</option>
                  <option value="Bookings">Bookings</option>
                  <option value="Manual Matches">Manual Matches</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Accountable Admin</label>
                <input
                  placeholder="Assignee Full Name"
                  value={newForm.assignedTo}
                  onChange={(e) => setNewForm({ ...newForm, assignedTo: e.target.value })}
                  className="ds-input"
                />
              </div>
            </div>

            <div className="px-8 py-6 border-t border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
              <button
                onClick={handleAddNew}
                className="ds-button bg-neutral-900 text-white hover:bg-neutral-800 w-full"
              >
                Provision Link
              </button>
              <p className="text-[10px] text-neutral-400 text-center font-bold tracking-widest uppercase">Encrypted Endpoint Protocol</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repositories;
