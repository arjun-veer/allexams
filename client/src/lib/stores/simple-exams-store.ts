import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Exam } from '../types';

// Simple exams store with hardcoded data that works immediately
type SimpleExamsState = {
  exams: Exam[];
  subscribedExams: string[];
  isLoading: boolean;
  error: string | null;
  subscribeToExam: (examId: string) => void;
  unsubscribeFromExam: (examId: string) => void;
  syncSubscriptions: () => void;
};

// Working sample data
const sampleExams: Exam[] = [
  {
    id: 'exam-1',
    name: 'JEE Main 2024',
    category: 'Engineering',
    registrationStartDate: new Date('2023-11-01'),
    registrationEndDate: new Date('2023-12-15'),
    examDate: new Date('2024-01-24'),
    resultDate: new Date('2024-02-15'),
    websiteUrl: 'https://jeemain.nta.nic.in',
    description: 'Joint Entrance Examination for admission to undergraduate engineering programs across India.',
    eligibility: 'Candidates who have passed class 12th examination or equivalent.',
    applicationFee: '₹650 for General, ₹325 for SC/ST/PwD',
    isSubscribed: false
  },
  {
    id: 'exam-2',
    name: 'NEET 2024',
    category: 'Medical',
    registrationStartDate: new Date('2023-12-01'),
    registrationEndDate: new Date('2024-01-15'),
    examDate: new Date('2024-05-05'),
    resultDate: new Date('2024-06-10'),
    websiteUrl: 'https://neet.nta.nic.in',
    description: 'National Eligibility cum Entrance Test for admission to MBBS and BDS courses in India.',
    eligibility: 'Candidates who have passed class 12th examination with Physics, Chemistry, and Biology.',
    applicationFee: '₹1500 for General, ₹800 for SC/ST/PwD',
    isSubscribed: false
  },
  {
    id: 'exam-3',
    name: 'UPSC Civil Services 2024',
    category: 'Civil Services',
    registrationStartDate: new Date('2024-02-01'),
    registrationEndDate: new Date('2024-03-15'),
    examDate: new Date('2024-06-02'),
    resultDate: new Date('2024-12-15'),
    websiteUrl: 'https://upsc.gov.in',
    description: 'Civil Services Examination for recruitment to various Civil Services of the Government of India.',
    eligibility: 'Graduates in any discipline, age between 21-32 years (with relaxation for reserved categories).',
    applicationFee: '₹100 (exempted for SC/ST/PwD and women candidates)',
    isSubscribed: false
  },
  {
    id: 'exam-4',
    name: 'IBPS PO 2024',
    category: 'Banking',
    registrationStartDate: new Date('2024-01-01'),
    registrationEndDate: new Date('2024-02-10'),
    examDate: new Date('2024-03-15'),
    resultDate: new Date('2024-04-30'),
    websiteUrl: 'https://ibps.in',
    description: 'Institute of Banking Personnel Selection Probationary Officer recruitment examination.',
    eligibility: 'Graduates in any discipline, age between 20-30 years.',
    applicationFee: '₹850 for General, ₹175 for SC/ST/PwD',
    isSubscribed: false
  },
  {
    id: 'exam-5',
    name: 'CAT 2024',
    category: 'Management',
    registrationStartDate: new Date('2024-08-01'),
    registrationEndDate: new Date('2024-09-15'),
    examDate: new Date('2024-11-24'),
    resultDate: new Date('2025-01-05'),
    websiteUrl: 'https://iimcat.ac.in',
    description: 'Common Admission Test for admission to postgraduate management programs at IIMs and other top business schools.',
    eligibility: 'Graduates in any discipline with minimum 50% marks (45% for reserved categories).',
    applicationFee: '₹2200 for General, ₹1100 for SC/ST/PwD',
    isSubscribed: false
  }
];

const defaultSubscriptions = ['exam-1', 'exam-2', 'exam-3'];

export const useSimpleExams = create<SimpleExamsState>()(
  (set, get) => ({
    exams: sampleExams.map(exam => ({
      ...exam,
      isSubscribed: defaultSubscriptions.includes(exam.id)
    })),
    subscribedExams: defaultSubscriptions,
    isLoading: false,
    error: null,
      
      subscribeToExam: (examId) =>
        set((state) => {
          if (state.subscribedExams.includes(examId)) return state;
          
          const updatedSubscribedExams = [...state.subscribedExams, examId];
          const updatedExams = state.exams.map(exam => 
            exam.id === examId ? { ...exam, isSubscribed: true } : exam
          );
          
          return {
            subscribedExams: updatedSubscribedExams,
            exams: updatedExams,
          };
        }),
        
      unsubscribeFromExam: (examId) =>
        set((state) => {
          if (!state.subscribedExams.includes(examId)) return state;
          
          const updatedSubscribedExams = state.subscribedExams.filter(id => id !== examId);
          const updatedExams = state.exams.map(exam => 
            exam.id === examId ? { ...exam, isSubscribed: false } : exam
          );
          
          return {
            subscribedExams: updatedSubscribedExams,
            exams: updatedExams,
          };
        }),
        
    syncSubscriptions: () =>
      set((state) => ({
        exams: state.exams.map(exam => ({
          ...exam,
          isSubscribed: state.subscribedExams.includes(exam.id)
        }))
      })),
  })
);