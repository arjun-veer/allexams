import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DocumentWallet } from '@/components/dashboard/DocumentWallet';
import { ExamTracker } from '@/components/dashboard/ExamTracker';
import { DocProcessorButton } from '@/components/dashboard/DocProcessorButton';
// import { checkSupabaseConnection } from '@/lib/supabase';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/stores/auth-store';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      // For now, let's temporarily allow access for testing dashboard functionality
      console.log('User not authenticated, but allowing dashboard access for testing');
    }

    // Check Supabase connection 
    const initializeDashboard = async () => {
      setIsLoading(true);
      try {
        // Check backend API connection
        await fetch(`${import.meta.env.VITE_API_URL}/health`);
        setIsConnected(true);
        console.log('Connected to backend API successfully');
      } catch (error) {
        console.error('Backend API connection error:', error);
        setIsConnected(false);
        // Don't show error toast as we're using local data now
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeDashboard();
  }, [isAuthenticated, navigate]);

  // Allow dashboard access for testing (authentication temporarily bypassed)
  console.log('Dashboard render - isAuthenticated:', isAuthenticated);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container my-5 mx-auto px-4 py-8 md:py-12">
        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="col-span-full lg:col-span-2">
                <ExamTracker />
              </div>
              
              <div className="md:col-span-full lg:col-span-1">
                <DocProcessorButton />
              </div>
            </div>
            
            <DocumentWallet />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
