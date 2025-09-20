
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '../types';
import { apiClient, setTokens, clearTokens, initializeAuth } from '../apiClient';

// Define API response types
interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      name?: string;
      verified: boolean;
    };
    accessToken: string;
    refreshToken: string;
  };
}

interface UserResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      name?: string;
      verified: boolean;
    };
  };
}

// Auth store for user authentication state
type AuthState = {
  isAuthenticated: boolean;
  currentUser: {
    id: string;
    email: string;
    role: UserRole;
    name?: string;
    verified?: boolean;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (role: UserRole) => void;
  initializeFromApi: () => Promise<void>;
  updateProfile: (data: { name?: string }) => Promise<void>;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentUser: null,
      
      login: async (email: string, password: string) => {
        try {
          const response = await apiClient.login(email, password) as AuthResponse;
          const { user, accessToken, refreshToken } = response.data;
          
          // Store tokens
          setTokens(accessToken, refreshToken);
          
          // Update state
          set({ 
            isAuthenticated: true, 
            currentUser: {
              id: user.id,
              email: user.email,
              role: user.role as UserRole,
              name: user.name,
              verified: user.verified
            } 
          });
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },

      register: async (email: string, password: string, name?: string) => {
        try {
          const response = await apiClient.register(email, password, name) as AuthResponse;
          const { user, accessToken, refreshToken } = response.data;
          
          // Store tokens
          setTokens(accessToken, refreshToken);
          
          // Update state
          set({ 
            isAuthenticated: true, 
            currentUser: {
              id: user.id,
              email: user.email,
              role: user.role as UserRole,
              name: user.name,
              verified: user.verified
            } 
          });
        } catch (error) {
          console.error('Registration failed:', error);
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiClient.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          clearTokens();
          set({ isAuthenticated: false, currentUser: null });
        }
      },

      updateUserRole: (role) => set((state) => ({
        currentUser: state.currentUser 
          ? { ...state.currentUser, role }
          : null
      })),

      initializeFromApi: async () => {
        try {
          // Initialize auth tokens from localStorage
          initializeAuth();
          
          // Try to get current user from API
          const response = await apiClient.getCurrentUser() as UserResponse;
          const user = response.data.user;
          
          set({ 
            isAuthenticated: true, 
            currentUser: {
              id: user.id,
              email: user.email,
              role: user.role as UserRole,
              name: user.name,
              verified: user.verified
            } 
          });
        } catch (error) {
          console.error('Failed to initialize auth from API:', error);
          // Clear invalid tokens
          clearTokens();
          set({ isAuthenticated: false, currentUser: null });
        }
      },

      updateProfile: async (data: { name?: string }) => {
        try {
          const response = await apiClient.updateUserProfile(data) as UserResponse;
          const user = response.data.user;
          
          set((state) => ({
            currentUser: state.currentUser ? {
              ...state.currentUser,
              name: user.name
            } : null
          }));
        } catch (error) {
          console.error('Profile update failed:', error);
          throw error;
        }
      }
    }),
    {
      name: 'auth',
      // Only persist the authentication state, not the functions
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser
      })
    }
  )
);
