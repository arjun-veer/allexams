import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Exam, ExamCategory } from '../types';
import { apiClient } from '../apiClient';

interface ExamSubscription {
  id: string;
  userId: string;
  examId: string;
  subscriptionType: 'basic' | 'premium';
  createdAt: Date;
  exam: Exam;
}

interface ExamsResponse {
  success: boolean;
  data: {
    exams: Exam[];
    total: number;
    page: number;
    totalPages: number;
  };
}

interface SubscriptionsResponse {
  success: boolean;
  data: {
    subscriptions: ExamSubscription[];
  };
}

interface SubscribeResponse {
  success: boolean;
  data: {
    subscription: ExamSubscription;
  };
}

interface ExamStore {
  exams: Exam[];
  mySubscriptions: ExamSubscription[];
  categories: ExamCategory[];
  selectedCategory: ExamCategory | 'All';
  loading: boolean;

  // Fetch all exams
  fetchExams: () => Promise<void>;
  
  // Get exams by category
  getExamsByCategory: (category: ExamCategory | 'All') => Exam[];
  
  // Subscribe to exam
  subscribeToExam: (examId: string, subscriptionType: 'basic' | 'premium') => Promise<void>;
  
  // Unsubscribe from exam
  unsubscribeFromExam: (examId: string) => Promise<void>;
  
  // Get user subscriptions
  fetchSubscriptions: () => Promise<void>;
  
  // Set selected category
  setSelectedCategory: (category: ExamCategory | 'All') => void;
  
  // Search exams
  searchExams: (query: string) => Exam[];
}

export const useExams = create<ExamStore>()(
  persist(
    (set, get) => ({
      exams: [],
      mySubscriptions: [],
      categories: [
        'Engineering',
        'Medical', 
        'Civil Services',
        'Banking',
        'Railways',
        'Defence',
        'Teaching',
        'State Services',
        'School Board',
        'Law',
        'Management',
        'Other'
      ],
      selectedCategory: 'All',
      loading: false,

      fetchExams: async () => {
        set({ loading: true });
        try {
          const response = await apiClient.getExams() as ExamsResponse;
          set({ 
            exams: response.data.exams.map(exam => ({
              ...exam,
              registrationStartDate: new Date(exam.registrationStartDate),
              registrationEndDate: new Date(exam.registrationEndDate),
              examDate: exam.examDate ? new Date(exam.examDate) : undefined,
              resultDate: exam.resultDate ? new Date(exam.resultDate) : undefined
            }))
          });
        } catch (error) {
          console.error('Error fetching exams:', error);
        } finally {
          set({ loading: false });
        }
      },

      getExamsByCategory: (category) => {
        const { exams } = get();
        if (category === 'All') return exams;
        return exams.filter(exam => exam.category === category);
      },

      subscribeToExam: async (examId, subscriptionType) => {
        try {
          await apiClient.subscribeToExam(examId, subscriptionType);
          await get().fetchSubscriptions();
          
          // Update exam subscription status
          set((state) => ({
            exams: state.exams.map(exam => 
              exam.id === examId 
                ? { ...exam, isSubscribed: true }
                : exam
            )
          }));
        } catch (error) {
          console.error('Error subscribing to exam:', error);
          throw error;
        }
      },

      unsubscribeFromExam: async (examId) => {
        try {
          await apiClient.unsubscribeFromExam(examId);
          await get().fetchSubscriptions();
          
          // Update exam subscription status
          set((state) => ({
            exams: state.exams.map(exam => 
              exam.id === examId 
                ? { ...exam, isSubscribed: false }
                : exam
            )
          }));
        } catch (error) {
          console.error('Error unsubscribing from exam:', error);
          throw error;
        }
      },

      fetchSubscriptions: async () => {
        try {
          const response = await apiClient.getUserSubscriptions() as SubscriptionsResponse;
          
          // Check if response and data exist
          if (!response?.data?.subscriptions) {
            console.warn('No subscriptions data received');
            set({ mySubscriptions: [] });
            return;
          }
          
          const subscriptions = response.data.subscriptions.map(sub => ({
            ...sub,
            createdAt: new Date(sub.createdAt),
            exam: {
              ...sub.exam,
              registrationStartDate: new Date(sub.exam.registrationStartDate),
              registrationEndDate: new Date(sub.exam.registrationEndDate),
              examDate: sub.exam.examDate ? new Date(sub.exam.examDate) : undefined,
              resultDate: sub.exam.resultDate ? new Date(sub.exam.resultDate) : undefined
            }
          }));
          
          set({ mySubscriptions: subscriptions });
          
          // Update exam subscription status
          const subscribedExamIds = subscriptions.map(sub => sub.examId);
          set((state) => ({
            exams: state.exams.map(exam => ({
              ...exam,
              isSubscribed: subscribedExamIds.includes(exam.id)
            }))
          }));
        } catch (error) {
          console.error('Error fetching subscriptions:', error);
          // Set empty subscriptions on error
          set({ mySubscriptions: [] });
        }
      },

      setSelectedCategory: (category) => {
        set({ selectedCategory: category });
      },

      searchExams: (query) => {
        const { exams } = get();
        if (!query.trim()) return exams;
        
        const searchTerm = query.toLowerCase();
        return exams.filter(exam => 
          exam.name.toLowerCase().includes(searchTerm) ||
          exam.category.toLowerCase().includes(searchTerm) ||
          (exam.description && exam.description.toLowerCase().includes(searchTerm))
        );
      }
    }),
    {
      name: 'exams',
      partialize: (state) => ({
        exams: state.exams,
        mySubscriptions: state.mySubscriptions,
        selectedCategory: state.selectedCategory
      })
    }
  )
);
