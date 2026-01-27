
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const Logs: React.FC = () => {
  const logs = useSelector((state: RootState) => state.admin.logs);

  return (
    <div className="p-8 animate-saas max-w-7xl mx-auto pb-24">
      <div className="ds-card">
        <div className="px-8 py-6 border-b border-[var(--border-ds)] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--text-main)] tracking-tight">Administrative Stream</h2>
            <p className="text-xs text-[var(--text-sub)] mt-1 italic">Historical modification logs</p>
          </div>
          <div className="px-3 py-1 bg-[var(--bg-input)] rounded-lg text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest border border-[var(--border-ds)]">
             {logs.length} Sequential Records
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-input)]">
                <th className="ds-table-header">Timeline</th>
                <th className="ds-table-header">Modification</th>
                <th className="ds-table-header">Authorized User</th>
                <th className="ds-table-header text-right">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-ds)]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center text-[var(--text-muted)] italic text-sm">Empty log stream detected.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="ds-table-cell text-[12px] font-medium text-[var(--text-sub)]">{log.timestamp}</td>
                    <td className="ds-table-cell text-[13px] font-bold text-[var(--text-main)]">{log.activity}</td>
                    <td className="ds-table-cell">
                       <div className="flex items-center gap-3">
                         <div className="w-6 h-6 rounded-md bg-[var(--bg-input)] border border-[var(--border-ds)] flex items-center justify-center text-[var(--text-main)] font-bold text-[9px]">
                           {log.admin.charAt(0)}
                         </div>
                         <span className="text-[13px] font-bold text-[var(--text-sub)]">{log.admin}</span>
                       </div>
                    </td>
                    <td className="ds-table-cell text-right">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                        log.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Logs;
