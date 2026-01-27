
import React, { useState } from 'react';
import { mockTeacherRequests } from '../mockData';
import { TeacherRequest, Status } from '../types';
import { Icons } from '../constants';

const TeacherRequests: React.FC = () => {
  const [requests, setRequests] = useState<TeacherRequest[]>(mockTeacherRequests);

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'Daily': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Weekly': return 'text-[#FF850A] bg-[#FFF3E6] border-[#FF850A]/20';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="p-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E5DED4] overflow-hidden">
        <div className="px-8 py-7 border-b border-[#E5DED4] bg-[#FAF6F1]/30 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A] brand-font">Long-term Teacher Matching</h2>
            <p className="text-xs text-[#5A5A5A] mt-1 font-medium">Parents requesting dedicated educators</p>
          </div>
          <div className="flex gap-4">
              <span className="text-xs font-bold text-[#A0A0A0] uppercase tracking-widest bg-white px-5 py-2.5 rounded-2xl border border-[#E5DED4]">
                  {requests.length} Requests Pending
              </span>
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF6F1]/50 border-b border-[#E5DED4]">
              <th className="px-8 py-5 text-[11px] font-bold text-[#5A5A5A] uppercase tracking-[0.1em]">Parent & Student</th>
              <th className="px-8 py-5 text-[11px] font-bold text-[#5A5A5A] uppercase tracking-[0.1em]">Subject Focus</th>
              <th className="px-8 py-5 text-[11px] font-bold text-[#5A5A5A] uppercase tracking-[0.1em]">Schedule Intensity</th>
              <th className="px-8 py-5 text-[11px] font-bold text-[#5A5A5A] uppercase tracking-[0.1em]">Requirement</th>
              <th className="px-8 py-5 text-[11px] font-bold text-[#5A5A5A] uppercase tracking-[0.1em] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DED4]">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-[#FAF6F1]/30 transition-colors">
                <td className="px-8 py-7">
                  <p className="text-sm font-bold text-[#1A1A1A]">{req.parentName}</p>
                  <p className="text-[11px] text-[#A0A0A0] font-bold uppercase tracking-tight">Student: {req.studentName}</p>
                </td>
                <td className="px-8 py-7">
                  <p className="text-sm font-bold text-[#1A1A1A]">{req.subject}</p>
                  <p className="text-[11px] text-[#FF850A] font-medium">Pref: {req.preferredGender}</p>
                </td>
                <td className="px-8 py-7">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${getIntensityColor(req.intensity)}`}>
                    {req.intensity}
                  </span>
                </td>
                <td className="px-8 py-7 max-w-xs">
                  <p className="text-xs text-[#5A5A5A] leading-relaxed line-clamp-2">
                    {req.notes}
                  </p>
                </td>
                <td className="px-8 py-7 text-right">
                  <button className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-bold rounded-xl hover:bg-[#333333] transition-all shadow-md">
                    Match Teacher
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-10 bg-[#FFF3E6] rounded-[32px] p-8 border border-[#FF850A]/10 flex items-center justify-between">
          <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#FF850A] shadow-sm">
                  <Icons.Teacher />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] brand-font">Need to add a custom match?</h3>
                  <p className="text-sm text-[#5A5A5A]">Manually record teacher requests received via direct calls.</p>
              </div>
          </div>
          <button className="px-8 py-4 bg-[#FF850A] text-white font-bold rounded-2xl shadow-xl shadow-[#FF850A]/20 hover:scale-105 transition-all">
              Create Match Request
          </button>
      </div>
    </div>
  );
};

export default TeacherRequests;
