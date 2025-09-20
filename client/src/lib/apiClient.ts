// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token management
let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const getAccessToken = () => accessToken;

// API request wrapper with automatic token refresh
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Add authorization header if token exists
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 - try to refresh token
      if (response.status === 401 && refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry original request with new token
          headers.Authorization = `Bearer ${accessToken}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          return this.handleResponse<T>(retryResponse);
        } else {
          // Refresh failed, redirect to login
          clearTokens();
          window.location.href = '/auth';
          throw new Error('Authentication required');
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  // Authentication methods
  async register(email: string, password: string, name?: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      clearTokens();
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Exam methods
  async getExams(params: {
    category?: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.request(`/exams?${queryParams.toString()}`);
  }

  async getExam(id: string) {
    return this.request(`/exams/${id}`);
  }

  async subscribeToExam(examId: string, notificationPreferences?: any) {
    return this.request(`/exams/${examId}/subscribe`, {
      method: 'POST',
      body: JSON.stringify({ notificationPreferences }),
    });
  }

  async unsubscribeFromExam(examId: string) {
    return this.request(`/exams/${examId}/subscribe`, {
      method: 'DELETE',
    });
  }

  async getUserSubscriptions() {
    return this.request('/exams/user/subscriptions');
  }

  async getExamCategories() {
    return this.request('/exams/meta/categories');
  }

  // Document methods
  async getDocuments(params: {
    category?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.request(`/documents?${queryParams.toString()}`);
  }

  async uploadDocument(file: File, documentName: string, category?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentName', documentName);
    if (category) {
      formData.append('category', category);
    }

    // Remove Content-Type header to let browser set it with boundary
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse(response);
  }

  async getDocument(id: string) {
    return this.request(`/documents/${id}`);
  }

  async updateDocument(id: string, data: { category?: string; fileName?: string }) {
    return this.request(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(id: string) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async getDocumentCategories() {
    return this.request('/documents/meta/categories');
  }

  async getDocumentsByCategory(category: string) {
    return this.request(`/documents/category/${category}`);
  }

  async viewDocument(id: string): Promise<string> {
    return `${API_BASE_URL}/documents/view/${id}`;
  }

  async downloadDocument(id: string): Promise<string> {
    return `${API_BASE_URL}/documents/download/${id}`;
  }

  // User methods
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(data: { name?: string }) {
    return this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  // Admin methods
  async getAdminDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.request(`/admin/users?${queryParams.toString()}`);
  }

  async updateUserRole(userId: string, role: string) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async createExam(examData: any) {
    return this.request('/admin/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  async updateExam(examId: string, examData: any) {
    return this.request(`/admin/exams/${examId}`, {
      method: 'PATCH',
      body: JSON.stringify(examData),
    });
  }

  async deleteExam(examId: string) {
    return this.request(`/admin/exams/${examId}`, {
      method: 'DELETE',
    });
  }

  async getPendingExams(params: { page?: number; limit?: number } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.request(`/admin/exams/pending?${queryParams.toString()}`);
  }

  async createPendingExam(examData: {
    name: string;
    category: string;
    description: string;
    registrationStartDate: Date;
    registrationEndDate: Date;
    examDate?: Date;
    resultDate?: Date;
    websiteUrl: string;
    eligibility?: string;
    applicationFee?: string;
  }) {
    return this.request('/admin/exams/pending', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  async approveExam(examId: string) {
    return this.request(`/admin/exams/pending/${examId}/approve`, {
      method: 'POST',
    });
  }

  async rejectExam(examId: string, rejectionReason: string) {
    return this.request(`/admin/exams/pending/${examId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!accessToken;
};

// Initialize tokens from localStorage on app start
export const initializeAuth = () => {
  const storedAccessToken = localStorage.getItem('accessToken');
  const storedRefreshToken = localStorage.getItem('refreshToken');
  
  if (storedAccessToken && storedRefreshToken) {
    setTokens(storedAccessToken, storedRefreshToken);
  }
};