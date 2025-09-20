
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';
import { useAuth } from '@/lib/stores/auth-store';
import { toast } from 'sonner';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import ExamDetails from '@/pages/ExamDetails';
import Exams from '@/pages/Exams';
import AdminDashboard from '@/pages/AdminDashboard';
import NotFound from '@/pages/NotFound';
import Settings from '@/pages/Settings';
import DocumentProcessor from '@/pages/DocumentProcessor';
import Notifications from '@/pages/Notifications';

function App() {
  const { initializeFromApi, isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  // Initialize auth from stored tokens when app loads
  useEffect(() => {
    const initAuth = async () => {
      try {
        await initializeFromApi();
        console.log('Auth initialized from API');
      } catch (error) {
        console.log('Auth initialization failed:', error);
      }
    };
    
    initAuth();
  }, [initializeFromApi]);

  // No need for auth state listener with JWT tokens
  // The auth state is managed by the store and API calls

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/exams/:id" element={<ExamDetails />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/document-processor" element={<DocumentProcessor />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
