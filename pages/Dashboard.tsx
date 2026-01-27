
import React from 'react';
import { Icons, getStatusStyles } from '../constants';
import { DashboardStats } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';

const Dashboard: React.FC = () => {
  const { logs } = useSelector((state: RootState) => state.admin);
  const navigate = useNavigate();
  const [liveStats, setLiveStats] = React.useState<DashboardStats>({
    totalInquiries: 0,
    activeAppointments: 0,
    teacherRequests: 0,
    resolutionRate: '0%'
  });

  const fetchStats = async () => {
    const data = await apiService.getDashboardStats();
    if (data) setLiveStats(data);
  };

  React.useEffect(() => {
    fetchStats();

    // Connect to socket for real-time updates
    const socket = socketService.connect();
    socket.on('data_updated', (payload) => {
      console.log('Real-time update received:', payload);
      fetchStats(); // Refresh stats when data changes
    });

    return () => {
      // socket.off('data_updated');
    };
  }, []);

  const statCards = [
    { label: 'Total Inquiries', value: liveStats.totalInquiries, icon: <Icons.Contact />, color: 'bg-neutral-500/10 text-neutral-500' },
    { label: 'Consultations', value: liveStats.activeAppointments, icon: <Icons.Calendar />, color: 'bg-amber-500/10 text-amber-500' },
    { label: 'Match Requests', value: liveStats.teacherRequests, icon: <Icons.Teacher />, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Success Rate', value: liveStats.resolutionRate, icon: <Icons.Sparkles />, color: 'bg-emerald-500/10 text-emerald-500' },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 animate-saas max-w-7xl mx-auto pb-24">
      {/* Stat Grid - Flexible Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="ds-card p-5 lg:p-6 min-h-[140px] flex flex-col justify-between hover:shadow-xl hover:border-[#FF850A]/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className={`${card.color} w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0`}>
                {card.icon}
              </div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-right">{card.label}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-[var(--text-main)] tracking-tight leading-none">{card.value}</h3>
              <p className="text-[10px] text-[var(--text-muted)] mt-2 font-medium">Real-time update</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Activity Stream - Elevation Level 1 */}
        <div className="lg:col-span-2 ds-card flex flex-col">
          <div className="px-6 lg:px-8 py-5 lg:py-6 border-b border-[var(--border-ds)] flex items-center justify-between">
            <div className="overflow-hidden">
              <h2 className="text-base font-bold text-[var(--text-main)] tracking-tight truncate">System Activity</h2>
              <p className="text-xs text-[var(--text-sub)] mt-1 truncate">Global administrative stream</p>
            </div>
            <Link to="/logs" className="px-3 lg:px-4 py-2 bg-[var(--bg-input)] text-[var(--text-main)] text-[11px] font-bold rounded-lg border border-[var(--border-ds)] hover:bg-[var(--bg-hover)] transition-colors shrink-0">Browse Logs</Link>
          </div>

          <div className="p-2 lg:p-4 space-y-1">
            {logs.slice(0, 5).length > 0 ? logs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center gap-4 group py-3 px-4 rounded-xl hover:bg-[var(--bg-hover)] border border-transparent hover:border-[var(--border-ds)] transition-all cursor-default overflow-hidden">
                <div className={`w-2 h-2 rounded-full shrink-0 ${log.status === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[var(--text-main)] font-semibold truncate">{log.activity}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-tighter truncate">Admin: {log.admin} • {log.timestamp}</p>
                </div>
                <div className="text-[var(--text-muted)] hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icons.ArrowRight />
                </div>
              </div>
            )) : (
              <div className="py-24 flex flex-col items-center text-center text-[var(--text-muted)]">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-input)] flex items-center justify-center mb-4">
                  <Icons.Sync />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest">No activity detected</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Insight Card - Minimalist UI */}
        <div className="bg-neutral-900 rounded-2xl p-6 lg:p-8 text-white shadow-2xl flex flex-col justify-between group relative overflow-hidden dark:bg-neutral-800 border border-white/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF850A]/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-[#FF850A]/20" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg mb-6 lg:mb-8 border border-white/5">
              <Icons.Sparkles />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Admin Insights</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight mb-3 lg:mb-4">Operational Intelligence</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8 lg:mb-10">
              Quickly analyze tutor matches and operational data. Ask the AI assistant for any summaries or trends.
            </p>
          </div>

          <button
            onClick={() => navigate('/ai-assistant')}
            className="relative z-10 w-full h-12 bg-white text-neutral-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#FF850A] hover:text-white transition-all shadow-lg active:scale-95"
          >
            Launch AI Assistant
            <Icons.ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
