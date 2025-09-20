
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserDocument } from '../types';
import { apiClient } from '../apiClient';
import { toast } from 'sonner';

interface DocumentsResponse {
  success: boolean;
  data: {
    documents: UserDocument[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

interface UploadResponse {
  success: boolean;
  data: {
    document: UserDocument;
  };
}

type DocumentsState = {
  documents: UserDocument[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchDocuments: () => Promise<void>;
  uploadDocument: (file: File, documentName: string, category: string) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export const useDocuments = create<DocumentsState>()(
  persist(
    (set, get) => ({
      documents: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      
      fetchDocuments: async () => {
        try {
          const currentTime = Date.now();
          const lastFetched = get().lastFetched;
          const documents = get().documents;
          
          // Force refresh if no documents are loaded yet
          if (documents.length === 0 || !lastFetched || (currentTime - lastFetched > CACHE_DURATION)) {
            console.log('Fetching fresh document data from the API...');
            set({ isLoading: true, error: null });
            
            const response = await apiClient.getDocuments() as DocumentsResponse;
            
            if (!response.success) {
              set({ isLoading: false, error: response.message || 'Failed to fetch documents' });
              return;
            }
            
            // Transform the data to match the UserDocument type
            const transformedDocs = response.data.documents.map((doc: any) => ({
              id: doc._id || doc.id,
              userId: doc.userId,
              documentName: doc.documentName || doc.fileName,
              fileName: doc.fileName,
              fileType: doc.fileType,
              fileSize: doc.fileSize,
              category: doc.category || 'Other Documents',
              createdAt: new Date(doc.createdAt),
              url: doc.url, // Use the direct Cloudinary URL
            }));
            
            set({ 
              documents: transformedDocs, 
              isLoading: false,
              lastFetched: currentTime
            });
          } else {
            console.log('Using cached document data, last fetched at:', new Date(lastFetched).toLocaleString());
          }
        } catch (error: any) {
          console.error('Error in fetchDocuments:', error);
          set({ isLoading: false, error: error.message || 'Failed to fetch documents' });
        }
      },
      
      uploadDocument: async (file: File, documentName: string, category: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.uploadDocument(file, documentName, category || 'Other Documents') as UploadResponse;
          
          if (!response.success) {
            const errorMessage = (response as any).message || 'Failed to upload document';
            set({ isLoading: false, error: errorMessage });
            throw new Error(errorMessage);
          }
          
          // Transform the response document
          const newDocument: UserDocument = {
            id: (response.data.document as any)._id || response.data.document.id,
            userId: response.data.document.userId,
            documentName: (response.data.document as any).documentName || response.data.document.fileName,
            fileName: response.data.document.fileName,
            fileType: response.data.document.fileType,
            fileSize: response.data.document.fileSize,
            category: response.data.document.category || 'Other Documents',
            createdAt: new Date(response.data.document.createdAt),
            url: (response.data.document as any).url,
          };
          
          set((state) => ({
            documents: [...state.documents, newDocument],
            isLoading: false,
            lastFetched: Date.now()
          }));
          
        } catch (error: any) {
          console.error('Error uploading document:', error);
          set({ isLoading: false, error: error.message || 'Failed to upload document' });
          throw error;
        }
      },
      
      deleteDocument: async (documentId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const document = get().documents.find(doc => doc.id === documentId);
          if (!document) {
            set({ isLoading: false, error: 'Document not found' });
            return;
          }
          
          // Delete from the API
          const response = await apiClient.deleteDocument(documentId) as { success: boolean; message?: string };
          
          if (!response.success) {
            const errorMessage = response.message || 'Failed to delete document';
            set({ isLoading: false, error: errorMessage });
            return;
          }
          
          // Update local state
          set((state) => ({
            documents: state.documents.filter((doc) => doc.id !== documentId),
            isLoading: false,
            lastFetched: Date.now()
          }));
        } catch (error: any) {
          console.error('Error deleting document:', error);
          set({ isLoading: false, error: error.message || 'Failed to delete document' });
        }
      },
    }),
    {
      name: 'documents',
    }
  )
);
