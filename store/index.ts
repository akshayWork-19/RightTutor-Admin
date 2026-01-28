
import { configureStore, createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ContactInquiry, Appointment, Status, RetentionPeriod, ManualMatch } from '../types';
import { apiService } from '../services/apiService';

export interface AdminUser {
  name: string;
  email: string;
  avatar: string;
  phone: string;
  password?: string;
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  category: 'Inquiries' | 'Bookings' | 'Manual Matches'; // New field for robust sync
  assignedTo: string;
  lastSync: string;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  activity: string;
  admin: string;
  status: 'success' | 'info' | 'warning';
}

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

interface AdminState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  repositories: Repository[];
  inquiries: ContactInquiry[];
  appointments: Appointment[];
  manualMatches: ManualMatch[];
  logs: SystemLog[];
  retentionEnabled: boolean;
  retentionDays: RetentionPeriod;
  aiDraft: string;
  aiMessages: ChatMessage[];
  isAiGenerating: boolean;
  hasUnreadAiResponse: boolean;
  theme: 'light' | 'dark';
  isSidebarOpen: boolean;
}

const getInitialTheme = (): 'light' | 'dark' => {
  const saved = localStorage.getItem('rt_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialState: AdminState = {
  user: JSON.parse(localStorage.getItem('rt_user') || 'null'),
  isAuthenticated: localStorage.getItem('rt_auth') === 'true',
  repositories: JSON.parse(localStorage.getItem('rt_repos') || '[]'),
  inquiries: JSON.parse(localStorage.getItem('rt_inquiries') || '[]'),
  appointments: JSON.parse(localStorage.getItem('rt_appointments') || '[]'),
  manualMatches: JSON.parse(localStorage.getItem('rt_manual_matches') || '[]'),
  logs: JSON.parse(localStorage.getItem('rt_logs') || '[]'),
  retentionEnabled: localStorage.getItem('rt_retention_enabled') === 'true',
  retentionDays: (Number(localStorage.getItem('rt_retention_days')) as RetentionPeriod) || 14,
  aiDraft: localStorage.getItem('rt_ai_draft') || '',
  aiMessages: JSON.parse(localStorage.getItem('rt_ai_history') || '[{"role": "ai", "text": "Hello! I can help you summarize calls, find tutors, or check schedule gaps. What do you need?"}]'),
  isAiGenerating: false,
  hasUnreadAiResponse: localStorage.getItem('rt_ai_unread') === 'true',
  theme: getInitialTheme(),
  isSidebarOpen: false,
};

export const triggerAiRequest = createAsyncThunk(
  'admin/triggerAiRequest',
  async (prompt: string, { getState }) => {
    const state = (getState() as RootState).admin;
    const dataContext = `
      Admin Name: ${state.user?.name}
      Active Repositories: ${state.repositories.map(r => r.name).join(', ')}
      Recent Activity: ${state.logs.slice(0, 3).map(l => l.activity).join('; ')}
    `;

    try {
      const response = await apiService.chatWithAI(prompt, dataContext);
      return response || "I'm ready to assist. Please ask your question again.";
    } catch (error: any) {
      throw new Error(error.message || "Network timeout. Retrieval failed.");
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('rt_theme', state.theme);
      document.body.className = state.theme;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    setUser: (state, action: PayloadAction<AdminUser>) => {
      state.user = action.payload;
      localStorage.setItem('rt_user', JSON.stringify(action.payload));
    },
    setAuth: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      localStorage.setItem('rt_auth', String(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('rt_auth');
      localStorage.removeItem('token');
    },
    triggerLiveSync: (state, action: PayloadAction<string>) => {
      const newLog: SystemLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        activity: `[LIVE SYNC] ${action.payload}`,
        admin: state.user?.name || 'Automated Sync',
        status: 'success'
      };
      state.logs.unshift(newLog);
      localStorage.setItem('rt_logs', JSON.stringify(state.logs.slice(0, 100)));
    },
    setRepositories: (state, action: PayloadAction<Repository[]>) => {
      state.repositories = action.payload;
      localStorage.setItem('rt_repos', JSON.stringify(state.repositories));
    },
    addRepository: (state, action: PayloadAction<Omit<Repository, 'createdAt'>>) => {
      const newRepo = { ...action.payload, createdAt: new Date().toISOString() };
      state.repositories.unshift(newRepo);
      localStorage.setItem('rt_repos', JSON.stringify(state.repositories));
      adminSlice.caseReducers.triggerLiveSync(state, { payload: `Repository '${newRepo.name}' mirrored to Sheets`, type: 'admin/triggerLiveSync' });
    },
    updateRepository: (state, action: PayloadAction<Repository>) => {
      const index = state.repositories.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.repositories[index] = action.payload;
        localStorage.setItem('rt_repos', JSON.stringify(state.repositories));
        adminSlice.caseReducers.triggerLiveSync(state, { payload: `Updates for repository '${action.payload.name}' pushed to Sheets`, type: 'admin/triggerLiveSync' });
      }
    },
    removeRepository: (state, action: PayloadAction<string>) => {
      const name = state.repositories.find(r => r.id === action.payload)?.name;
      state.repositories = state.repositories.filter(r => r.id !== action.payload);
      localStorage.setItem('rt_repos', JSON.stringify(state.repositories));
      adminSlice.caseReducers.triggerLiveSync(state, { payload: `Repository '${name}' unlinked and synced`, type: 'admin/triggerLiveSync' });
    },
    setInquiries: (state, action: PayloadAction<ContactInquiry[]>) => {
      state.inquiries = action.payload;
      localStorage.setItem('rt_inquiries', JSON.stringify(state.inquiries));
    },
    addInquiry: (state, action: PayloadAction<ContactInquiry>) => {
      state.inquiries.unshift(action.payload);
      localStorage.setItem('rt_inquiries', JSON.stringify(state.inquiries));
      adminSlice.caseReducers.triggerLiveSync(state, { payload: `Inquiry from ${action.payload.name} recorded and backed up`, type: 'admin/triggerLiveSync' });
    },
    updateInquiry: (state, action: PayloadAction<ContactInquiry>) => {
      const index = state.inquiries.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.inquiries[index] = action.payload;
        localStorage.setItem('rt_inquiries', JSON.stringify(state.inquiries));
        adminSlice.caseReducers.triggerLiveSync(state, { payload: `Status update for inquiry ${action.payload.name} mirrored`, type: 'admin/triggerLiveSync' });
      }
    },
    removeInquiry: (state, action: PayloadAction<string>) => {
      state.inquiries = state.inquiries.filter(i => i.id !== action.payload);
      localStorage.setItem('rt_inquiries', JSON.stringify(state.inquiries));
    },
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.appointments = action.payload;
      localStorage.setItem('rt_appointments', JSON.stringify(state.appointments));
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments.unshift(action.payload);
      localStorage.setItem('rt_appointments', JSON.stringify(state.appointments));
      adminSlice.caseReducers.triggerLiveSync(state, { payload: `Booking for ${action.payload.parentName} established and synced`, type: 'admin/triggerLiveSync' });
    },
    updateAppointment: (state, action: PayloadAction<Appointment>) => {
      const index = state.appointments.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
        localStorage.setItem('rt_appointments', JSON.stringify(state.appointments));
        adminSlice.caseReducers.triggerLiveSync(state, { payload: `Match Profile/Status for ${action.payload.parentName} updated`, type: 'admin/triggerLiveSync' });
      }
    },
    removeAppointment: (state, action: PayloadAction<string>) => {
      state.appointments = state.appointments.filter(a => a.id !== action.payload);
      localStorage.setItem('rt_appointments', JSON.stringify(state.appointments));
    },
    setAiDraft: (state, action: PayloadAction<string>) => {
      state.aiDraft = action.payload;
      localStorage.setItem('rt_ai_draft', action.payload);
    },
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.aiMessages.push({ role: 'user', text: action.payload });
      localStorage.setItem('rt_ai_history', JSON.stringify(state.aiMessages));
    },
    clearAiChat: (state) => {
      state.aiMessages = [{ role: "ai", text: "Hello! I can help you summarize calls, find tutors, or check schedule gaps. What do you need?" }];
      localStorage.setItem('rt_ai_history', JSON.stringify(state.aiMessages));
      state.hasUnreadAiResponse = false;
    },
    markAiAsRead: (state) => {
      state.hasUnreadAiResponse = false;
      localStorage.setItem('rt_ai_unread', 'false');
    },
    setManualMatches: (state, action: PayloadAction<ManualMatch[]>) => {
      state.manualMatches = action.payload;
      localStorage.setItem('rt_manual_matches', JSON.stringify(state.manualMatches));
    },
    addManualMatch: (state, action: PayloadAction<ManualMatch>) => {
      state.manualMatches.unshift(action.payload);
      localStorage.setItem('rt_manual_matches', JSON.stringify(state.manualMatches));
      adminSlice.caseReducers.triggerLiveSync(state, { payload: `Registry record for ${action.payload.parentName} pushed to database`, type: 'admin/triggerLiveSync' });
    },
    updateManualMatch: (state, action: PayloadAction<ManualMatch>) => {
      const index = state.manualMatches.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.manualMatches[index] = action.payload;
        localStorage.setItem('rt_manual_matches', JSON.stringify(state.manualMatches));
        adminSlice.caseReducers.triggerLiveSync(state, { payload: `Updated match details for ${action.payload.parentName} mirrored`, type: 'admin/triggerLiveSync' });
      }
    },
    removeManualMatch: (state, action: PayloadAction<string>) => {
      state.manualMatches = state.manualMatches.filter(m => m.id !== action.payload);
      localStorage.setItem('rt_manual_matches', JSON.stringify(state.manualMatches));
    },
    addLog: (state, action: PayloadAction<Omit<SystemLog, 'id' | 'timestamp'>>) => {
      const newLog = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      state.logs.unshift(newLog);
      localStorage.setItem('rt_logs', JSON.stringify(state.logs.slice(0, 100)));
    },
    setRetention: (state, action: PayloadAction<{ enabled: boolean, days: RetentionPeriod }>) => {
      state.retentionEnabled = action.payload.enabled;
      state.retentionDays = action.payload.days;
      localStorage.setItem('rt_retention_enabled', String(action.payload.enabled));
      localStorage.setItem('rt_retention_days', String(action.payload.days));
    },
    runCleanup: (state) => {
      if (!state.retentionEnabled) return;
      const limitDate = new Date(Date.now() - state.retentionDays * 24 * 60 * 60 * 1000);
      state.logs = state.logs.filter(log => new Date(log.timestamp) > limitDate);
      state.repositories = state.repositories.filter(repo => new Date(repo.createdAt) > limitDate);
      localStorage.setItem('rt_logs', JSON.stringify(state.logs));
      localStorage.setItem('rt_repos', JSON.stringify(state.repositories));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(triggerAiRequest.pending, (state) => { state.isAiGenerating = true; })
      .addCase(triggerAiRequest.fulfilled, (state, action) => {
        state.isAiGenerating = false;
        state.aiMessages.push({ role: 'ai', text: action.payload });
        state.hasUnreadAiResponse = true;
        localStorage.setItem('rt_ai_history', JSON.stringify(state.aiMessages));
        localStorage.setItem('rt_ai_unread', 'true');
      })
      .addCase(triggerAiRequest.rejected, (state) => {
        state.isAiGenerating = false;
        state.aiMessages.push({ role: 'ai', text: "Network timeout. Retrieval failed." });
        state.hasUnreadAiResponse = true;
      });
  }
});

export const {
  setUser, setAuth, logout,
  setRepositories, addRepository, updateRepository, removeRepository,
  addLog,
  setInquiries, addInquiry, updateInquiry, removeInquiry,
  setAppointments, addAppointment, updateAppointment, removeAppointment,
  setManualMatches, addManualMatch, updateManualMatch, removeManualMatch,
  setRetention, runCleanup,
  setAiDraft, addUserMessage, clearAiChat, markAiAsRead, toggleTheme, toggleSidebar, setSidebarOpen
} = adminSlice.actions;

export const store = configureStore({
  reducer: { admin: adminSlice.reducer }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
