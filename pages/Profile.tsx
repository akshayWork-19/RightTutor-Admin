import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, setUser, logout, setRetention, runManualCleanup, addLog } from '../store';
import { RetentionPeriod } from '../types';

const Profile: React.FC = () => {
  const { user, retentionEnabled, retentionDays } = useSelector((state: RootState) => state.admin);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(user!);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setTimeout(() => {
      dispatch(setUser(formData));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const handleRetentionUpdate = (enabled: boolean, days: RetentionPeriod) => {
    dispatch(setRetention({ enabled, days }));
    dispatch(addLog({ activity: `Updated Data Retention: ${enabled ? `Active (${days} days)` : 'Inactive'}`, admin: user?.name || 'Admin', status: 'info' }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteError('');
    if (confirmPassword === 'admin123' || confirmPassword === user?.password) {
      dispatch(logout());
    } else {
      setDeleteError('Incorrect password. Access denied.');
    }
  };

  const handleManualCleanup = () => {
    if (window.confirm('⚠️ This will permanently delete ALL logs. This action cannot be undone. Continue?')) {
      dispatch(runManualCleanup());
      alert('✓ All logs have been cleared successfully.');
    }
  };

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex items-end justify-between border-b border-[var(--border-ds)] pb-8">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">Administrative Hub</h2>
          <p className="text-[var(--text-sub)] font-medium mt-2">Configure security, visual identity, and data retention policies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-8">
          <div className="ds-card p-10 text-center">
            <div className="relative group mx-auto w-40 h-40 mb-8">
              <div className="w-full h-full rounded-[48px] bg-[var(--bg-input)] overflow-hidden border-4 border-[var(--bg-card)] shadow-lg relative">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] font-black text-4xl">
                    {formData.name.charAt(0)}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#FF850A] rounded-2xl flex items-center justify-center text-white shadow-xl hover:scale-110 transition-all border-4 border-[var(--bg-card)]"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">{formData.name}</h3>
            <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-2">System Administrator</p>
          </div>

          {/* Data Retention Card */}
          <div className="ds-card p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center dark:bg-[var(--bg-input)]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h4 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-widest">Data Retention</h4>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-sub)]">Auto-Cleaning Protocol</span>
                <button
                  onClick={() => handleRetentionUpdate(!retentionEnabled, retentionDays)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${retentionEnabled ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-neutral-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${retentionEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Cleanup Cycle</label>
                <select
                  disabled={!retentionEnabled}
                  value={retentionDays}
                  onChange={(e) => handleRetentionUpdate(retentionEnabled, Number(e.target.value) as RetentionPeriod)}
                  className="ds-input h-10 disabled:opacity-50"
                >
                  <option value={7}>7 Days (High Performance)</option>
                  <option value={14}>14 Days (Balanced)</option>
                  <option value={21}>21 Days (Maximum Retention)</option>
                </select>
              </div>

              <button
                onClick={handleManualCleanup}
                className="w-full py-2.5 bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-[var(--text-sub)] text-[11px] font-bold rounded-xl transition-all border border-[var(--border-ds)]"
              >
                Run Cleanup Manually
              </button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] italic">Self-cleaning task removes logs older than the selected timeframe. Manual cleanup clears all logs immediately.</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit} className="ds-card p-12">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-10">Administrative Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-main)] ml-1">Admin Display Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="ds-input"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-main)] ml-1">Work Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="ds-input"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-main)] ml-1">Secure Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="ds-input"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-10 border-t border-[var(--border-ds)]">
              <button
                type="submit"
                disabled={saveStatus !== 'idle'}
                className={`ds-button ${saveStatus === 'saved' ? 'bg-emerald-500 text-white' : 'bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-[var(--bg-input)] dark:hover:bg-[var(--bg-hover)] dark:border dark:border-[var(--border-ds)]'
                  }`}
              >
                {saveStatus === 'saving' ? 'Processing...' : saveStatus === 'saved' ? 'Identity Updated' : 'Apply System Changes'}
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="text-rose-500 font-bold text-xs hover:underline underline-offset-8"
              >Terminate Account</button>
            </div>
          </form>
        </div>
      </div>

      {showDeleteModal && (
        <div className="ds-modal-overlay">
          <div className="ds-modal-content max-w-sm">
            <div className="p-8">
              <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight mb-4">Confirm Deletion</h3>
              <p className="text-sm text-[var(--text-sub)] mb-8">This action is permanent. To confirm, please enter your administrator password below.</p>

              <input
                type="password"
                placeholder="Enter Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="ds-input mb-4"
              />

              {deleteError && <p className="text-rose-500 text-xs font-bold mb-6 text-center">{deleteError}</p>}

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="py-3 bg-[var(--bg-input)] text-[var(--text-sub)] rounded-xl font-bold text-xs border border-[var(--border-ds)]"
                >Cancel</button>
                <button
                  onClick={handleDeleteAccount}
                  className="py-3 bg-rose-500 text-white rounded-xl font-bold text-xs"
                >Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
