
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store, RootState, logout, addLog, runAutoCleanup, setInquiries, setAppointments, setManualMatches } from './store';
import { useAutoCleanup } from './hooks/useAutoCleanup';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import ContactInquiries from './pages/ContactInquiries';
import AppointmentDetails from './pages/AppointmentDetails';
import ManualMatching from './pages/ManualMatching';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Logs from './pages/Logs';
import GoogleSheets from './pages/GoogleSheets';
import AiAssistant from './pages/AiAssistant';
import ToastContainer from './components/ToastContainer';
import { mockInquiries, mockAppointments } from './mockData';
import { Status } from './types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, theme } = useSelector((state: RootState) => state.admin);

  // Enable automatic cleanup
  useAutoCleanup();

  // Initialize data and Theme logic
  useEffect(() => {
    document.body.className = theme;
    if (!localStorage.getItem('rt_inquiries')) {
      dispatch(setInquiries(mockInquiries));
    }
    if (!localStorage.getItem('rt_appointments')) {
      dispatch(setAppointments(mockAppointments));
    }
    if (!localStorage.getItem('rt_manual_matches')) {
      dispatch(setManualMatches([
        {
          id: 'm-1',
          parentName: 'Rohan Mehta',
          phoneNumber: '+91 91234 56789',
          subject: 'Grade 10 ICSE Maths',
          gradeLevel: 'Grade 10',
          status: Status.TRIAL_PENDING,
          dateAdded: '2024-05-18'
        },
        {
          id: 'm-2',
          parentName: 'Sneha Kapoor',
          phoneNumber: '+91 99887 76655',
          subject: 'IELTS Preparation',
          gradeLevel: 'Adult',
          status: Status.ASSIGNED,
          dateAdded: '2024-05-17'
        }
      ]));
    }
  }, [dispatch, theme]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Global Dashboard';
      case '/inquiries': return 'Contact Inquiries';
      case '/appointments': return 'Parent Appointments';
      case '/manual-matching': return 'Manual Match Entries';
      case '/profile': return 'Profile Settings';
      case '/logs': return 'System Activity Logs';
      case '/google-sheets': return 'Google Sheets';
      case '/ai-assistant': return 'AI Assistant';
      default: return 'Admin Panel';
    }
  };

  if (!user) return <Navigate to="/auth" />;

  return (
    <div className="flex h-screen w-full transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          title={getPageTitle()}
          onLogout={() => dispatch(logout())}
          adminUser={user}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const ProtectedApp: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.admin);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} />
        <Route path="/*" element={isAuthenticated ? <Layout><Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inquiries" element={<ContactInquiries />} />
          <Route path="/appointments" element={<AppointmentDetails />} />
          <Route path="/manual-matching" element={<ManualMatching />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/google-sheets" element={<GoogleSheets />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes></Layout> : <Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <ProtectedApp />
  </Provider>
);

export default App;
