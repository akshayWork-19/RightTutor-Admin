
import React from 'react';

interface ToastContainerProps {
  toasts: { id: string, msg: string }[];
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="fixed bottom-10 right-10 z-[200] space-y-4">
      {toasts.map(t => (
        <div key={t.id} className="bg-[#1A1A1A] text-white px-8 py-5 rounded-[24px] shadow-2xl border border-white/10 flex items-center gap-4 animate-in slide-in-from-right duration-300">
          <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
          <p className="text-sm font-bold tracking-tight">{t.msg}</p>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
