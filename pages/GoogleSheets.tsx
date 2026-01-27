
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, addRepository, updateRepository, removeRepository, Repository, addLog, setRepositories } from '../store';
import { apiService } from '../services/apiService';

const GoogleSheets: React.FC = () => {
  const { repositories, user } = useSelector((state: RootState) => state.admin);
  const dispatch = useDispatch();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Repository | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', url: '', assignedTo: '' });

  React.useEffect(() => {
    const fetchRepos = async () => {
      const repos = await apiService.getRepositories();
      if (repos && repos.length > 0) {
        dispatch(setRepositories(repos));
      }
    };
    fetchRepos();
  }, [dispatch]);

  const handleSave = async () => {
    if (editForm) {
      try {
        await apiService.updateRepository(editForm);
        dispatch(updateRepository(editForm));
        dispatch(addLog({ activity: `Updated Google Sheet Link: ${editForm.name}`, admin: user?.name || 'Admin', status: 'info' }));
        setEditingId(null);
      } catch (error) {
        console.error('Failed to update repository:', error);
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
        dispatch(addLog({ activity: `Created New Sheet Entry: ${newRepo.name}`, admin: user?.name || 'Admin', status: 'success' }));
        setShowAdd(false);
        setNewForm({ name: '', url: '', assignedTo: '' });
      } catch (error) {
        console.error('Failed to add repository:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteRepository(id);
      dispatch(removeRepository(id));
    } catch (error) {
      console.error('Failed to delete repository:', error);
    }
  };

  return (
    <div className="p-8 animate-saas max-w-7xl mx-auto pb-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-main)] tracking-tight">Google Sheets Management</h2>
          <p className="text-xs text-[var(--text-sub)] mt-1">Direct access to shared lesson and admission documents</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="ds-button bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-[var(--bg-input)] dark:hover:bg-[var(--bg-hover)] dark:border dark:border-[var(--border-ds)]"
        >
          Add Sheet Link
        </button>
      </div>

      <div className="ds-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-input)]">
                <th className="ds-table-header">Created For</th>
                <th className="ds-table-header">Link</th>
                <th className="ds-table-header">Created By</th>
                <th className="ds-table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-ds)]">
              {repositories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="ds-table-cell text-center text-[var(--text-muted)] py-12">No active sheet links detected.</td>
                </tr>
              ) : repositories.map((repo) => (
                <tr key={repo.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="ds-table-cell">
                    {editingId === repo.id ? (
                      <input
                        value={editForm?.name}
                        onChange={(e) => setEditForm({ ...editForm!, name: e.target.value })}
                        className="ds-input h-9"
                      />
                    ) : (
                      <span className="text-[13px] font-bold text-[var(--text-main)]">{repo.name}</span>
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
                      <a href={repo.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-[13px] truncate max-w-[180px] block font-medium">Open Document</a>
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
                      <span className="text-[13px] font-medium text-[var(--text-sub)]">{repo.assignedTo}</span>
                    )}
                  </td>
                  <td className="ds-table-cell text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === repo.id ? (
                        <button onClick={handleSave} className="px-3 py-1.5 bg-emerald-500 text-white text-[11px] font-bold rounded-lg">Save</button>
                      ) : (
                        <button onClick={() => { setEditingId(repo.id); setEditForm(repo); }} className="px-3 py-1.5 bg-[var(--bg-input)] text-[var(--text-sub)] text-[11px] font-bold rounded-lg border border-[var(--border-ds)] hover:bg-[var(--bg-hover)]">Modify</button>
                      )}
                      <button onClick={() => handleDelete(repo.id)} className="px-3 py-1.5 bg-rose-500/10 text-rose-500 text-[11px] font-bold rounded-lg border border-rose-500/20 hover:bg-rose-500/20">Drop</button>
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
            <div className="px-8 py-6 border-b border-[var(--border-ds)] flex justify-between items-center bg-[var(--bg-card)]">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-main)] tracking-tight">Record Sheet Link</h3>
                <p className="text-xs text-[var(--text-sub)] mt-1">Connect new document endpoint</p>
              </div>
              <button
                onClick={() => setShowAdd(false)}
                className="p-2 hover:bg-[var(--bg-hover)] rounded-lg text-[var(--text-muted)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="ds-modal-body space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Created For (Student/Lesson)</label>
                <input
                  placeholder="e.g. Master Admissions Log"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="ds-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Document Link (URL)</label>
                <input
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={newForm.url}
                  onChange={(e) => setNewForm({ ...newForm, url: e.target.value })}
                  className="ds-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Created By (Admin/Tutor)</label>
                <input
                  placeholder="Assignee Full Name"
                  value={newForm.assignedTo}
                  onChange={(e) => setNewForm({ ...newForm, assignedTo: e.target.value })}
                  className="ds-input"
                />
              </div>
            </div>

            <div className="px-8 py-6 border-t border-[var(--border-ds)] bg-[var(--bg-input)] flex flex-col gap-3">
              <button
                onClick={handleAddNew}
                className="ds-button bg-neutral-900 text-white hover:bg-neutral-800 w-full dark:bg-[var(--bg-input)] dark:hover:bg-[var(--bg-hover)] dark:border dark:border-[var(--border-ds)]"
              >
                Provision Link
              </button>
              <p className="text-[10px] text-[var(--text-muted)] text-center font-bold tracking-widest uppercase">Direct Google Interface Link</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSheets;
