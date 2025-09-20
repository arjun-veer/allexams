
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import ExamCard from "./ExamCard";
import { useAuth } from "@/lib/stores/auth-store";

interface PendingExam {
  id: string;
  name: string;
  category: string;
  description: string;
  registration_start_date: string;
  registration_end_date: string;
  exam_date: string | null;
  result_date: string | null;
  answer_key_date: string | null;
  website_url: string;
  eligibility: string | null;
  application_fee: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

const PendingExamsList = () => {
  const [pendingExams, setPendingExams] = useState<PendingExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  const fetchPendingExams = async () => {
    setIsLoading(true);
    try {
      // Verify user is admin before fetching
      if (currentUser?.role !== 'admin') {
        toast.error("Only admin users can access pending exams");
        setIsLoading(false);
        setPendingExams([]);
        return;
      }

      const response = await apiClient.getPendingExams() as { 
        success: boolean; 
        data: { pendingExams: PendingExam[] } 
      };
      
      setPendingExams(response.data.pendingExams || []);
      console.log("Fetched pending exams:", response.data.pendingExams);
    } catch (error: any) {
      console.error('Error fetching pending exams:', error);
      toast.error('Failed to load pending exams: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchPendingExams();
    } else {
      setIsLoading(false);
      setPendingExams([]);
    }
  }, [currentUser]);

  const approveExam = async (pendingExam: PendingExam) => {
    try {
      // Verify user is admin before approving
      if (currentUser?.role !== 'admin') {
        toast.error("Only admin users can approve exams");
        return;
      }
      
      // Approve the pending exam
      await apiClient.approveExam(pendingExam.id);
      
      toast.success('Exam approved and added to the database');
      fetchPendingExams();
    } catch (error: any) {
      console.error('Error approving exam:', error);
      toast.error(`Failed to approve exam: ${error.message}`);
    }
  };

  const rejectExam = async (pendingExamId: string) => {
    try {
      // Verify user is admin before rejecting
      if (currentUser?.role !== 'admin') {
        toast.error("Only admin users can reject exams");
        return;
      }
      
      await apiClient.rejectExam(pendingExamId, 'Rejected by admin');
      
      toast.success('Exam rejected');
      fetchPendingExams();
    } catch (error: any) {
      console.error('Error rejecting exam:', error);
      toast.error(`Failed to reject exam: ${error.message}`);
    }
  };

  // If user is not admin, show access denied
  if (currentUser?.role !== 'admin') {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center text-muted-foreground">
            You don't have permission to view pending exams.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              Loading pending exams...
            </div>
          </CardContent>
        </Card>
      ) : pendingExams.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              No pending exams to review
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pending Exams for Review ({pendingExams.length})</h2>
          
          {pendingExams.map((exam) => (
            <ExamCard 
              key={exam.id} 
              exam={exam} 
              onApprove={approveExam} 
              onReject={rejectExam}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingExamsList;
