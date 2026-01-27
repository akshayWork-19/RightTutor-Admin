
import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, setAiDraft, addUserMessage, clearAiChat, markAiAsRead, triggerAiRequest } from '../store';
import { Icons } from '../constants';

const AiAssistant: React.FC = () => {
  const { user, aiDraft, aiMessages, isAiGenerating } = useSelector((state: RootState) => state.admin);
  const dispatch = useDispatch<AppDispatch>();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [aiMessages, isAiGenerating]);

  // Mark as read when component mounts/is active
  useEffect(() => {
    dispatch(markAiAsRead());
  }, [dispatch]);

  const handleSend = () => {
    if (!aiDraft.trim() || isAiGenerating) return;

    const userText = aiDraft;
    dispatch(setAiDraft(''));
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    dispatch(addUserMessage(userText));
    dispatch(triggerAiRequest(userText));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setAiDraft(e.target.value));
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 240)}px`;
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedLine = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-[#FF850A] font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <li key={idx} className="ml-5 mb-2 list-disc text-white/80">
            {renderedLine.slice(1)}
          </li>
        );
      }
      return <p key={idx} className="mb-4 last:mb-0 text-white/80">{renderedLine}</p>;
    });
  };

  const suggestions = [
    "Summarize recent inquiries",
    "List bookings for tomorrow",
    "Check for tutor schedule gaps",
    "Analyze enrollment trends"
  ];

  return (
    <div className="h-full flex flex-col bg-[#0A0A0A] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#FF850A]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="flex-1 flex overflow-hidden">
        {/* Intelligence Sidebar - Hidden on mobile */}
        <div className="hidden lg:flex w-72 border-r border-white/5 flex-col p-8 z-10 bg-black/40 backdrop-blur-3xl shrink-0">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#FF850A] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#FF850A]/20">
                    <Icons.Sparkles />
                </div>
                <h3 className="text-white font-bold text-base tracking-tight">AI Hub</h3>
            </div>
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isAiGenerating ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                <p className="text-[#A0A0A0] text-[10px] font-bold uppercase tracking-widest">
                  {isAiGenerating ? 'Thinking...' : 'Ready'}
                </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="px-1 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4">Quick Shortcuts</p>
            {suggestions.map((s, i) => (
              <button 
                key={i}
                onClick={() => dispatch(setAiDraft(s))}
                className="w-full text-left text-[11px] font-semibold text-[#A0A0A0] hover:text-white hover:bg-white/5 p-4 rounded-xl transition-all border border-transparent hover:border-white/10 group"
              >
                <span className="group-hover:translate-x-1 inline-block transition-transform duration-300">{s}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto space-y-4">
             <button 
                onClick={() => dispatch(clearAiChat())}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-white/5 transition-all"
             >
                Reset Chat
             </button>
          </div>
        </div>

        {/* Intelligence Chat Feed */}
        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-12 space-y-8 md:space-y-12 scroll-smooth"
          >
            {aiMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`flex gap-3 md:gap-6 max-w-[95%] sm:max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs shadow-xl transition-all duration-300 ${
                    m.role === 'user' 
                      ? 'bg-[#FF850A] text-white' 
                      : 'bg-white/10 text-[#FF850A] border border-white/5'
                  }`}>
                    {m.role === 'user' ? user?.name.charAt(0) : <Icons.Sparkles />}
                  </div>

                  <div className={`px-4 py-3 md:px-8 md:py-6 rounded-2xl md:rounded-3xl text-[14px] leading-relaxed transition-all duration-300 ${
                    m.role === 'user' 
                      ? 'bg-white/5 text-white border border-white/10 rounded-tr-none' 
                      : 'bg-white/[0.03] border border-white/[0.05] rounded-tl-none prose-ai'
                  }`}>
                    {m.role === 'user' ? <p className="text-white/90">{m.text}</p> : formatText(m.text)}
                  </div>
                </div>
              </div>
            ))}
            
            {isAiGenerating && (
              <div className="flex justify-start">
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#FF850A] rounded-full animate-ping"></div>
                  </div>
                  <div className="px-4 py-3 text-white/30 text-[13px] italic">
                    Analyzing data...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Console */}
          <div className="p-4 md:p-8 pt-2 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#1A1A1A] rounded-[1.5rem] border border-white/5 focus-within:border-[#FF850A]/30 transition-all duration-500 shadow-2xl flex items-end p-2 pr-4 md:pr-5">
                <textarea 
                  ref={textareaRef}
                  value={aiDraft}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Search data or ask a question..."
                  className="flex-1 bg-transparent border-none px-4 md:px-6 py-4 text-white outline-none font-medium text-[14px] placeholder:text-white/20 resize-none max-h-60"
                />
                
                <div className="pb-3">
                  <button 
                    onClick={handleSend}
                    disabled={isAiGenerating || !aiDraft.trim()}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 min-h-[44px] min-w-[44px] ${
                      aiDraft.trim() && !isAiGenerating
                      ? 'bg-[#FF850A] text-white hover:scale-105 active:scale-95 shadow-lg shadow-[#FF850A]/20' 
                      : 'bg-white/5 text-white/10'
                    }`}
                  >
                    <Icons.ArrowRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
