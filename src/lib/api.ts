import { ApiResponse, PaginatedResponse, SearchFilters } from '@/types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/.netlify/functions';

// API Client class
class ApiClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.headers['Authorization'];
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        ...this.headers,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(endpoint + url.search, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Utility functions
export const buildQueryParams = (filters: SearchFilters): Record<string, any> => {
  const params: Record<string, any> = {};

  if (filters.query) params.q = filters.query;
  if (filters.status?.length) params.status = filters.status.join(',');
  if (filters.priority?.length) params.priority = filters.priority.join(',');
  if (filters.assigned_to?.length) params.assigned_to = filters.assigned_to.join(',');
  if (filters.created_by?.length) params.created_by = filters.created_by.join(',');
  if (filters.tags?.length) params.tags = filters.tags.join(',');
  if (filters.document_type?.length) params.document_type = filters.document_type.join(',');
  if (filters.event_type?.length) params.event_type = filters.event_type.join(',');
  
  if (filters.date_range) {
    params.start_date = filters.date_range.start;
    params.end_date = filters.date_range.end;
  }

  return params;
};

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error.response) {
    return new ApiError(
      error.response.data?.message || 'API request failed',
      error.response.status,
      error.response.data?.code
    );
  }

  return new ApiError(error.message || 'Network error');
};

// File upload helper
export const uploadFile = async (file: File, endpoint: string): Promise<ApiResponse<{ url: string; id: string }>> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiClient.post(endpoint, formData);
};

// Batch operations helper
export const batchRequest = async <T>(
  requests: Array<() => Promise<ApiResponse<T>>>
): Promise<Array<ApiResponse<T>>> => {
  try {
    return await Promise.all(requests.map(request => request()));
  } catch (error) {
    throw handleApiError(error);
  }
};

// Retry mechanism
export const retryRequest = async <T>(
  requestFn: () => Promise<ApiResponse<T>>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<ApiResponse<T>> => {
  let lastError: any;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw handleApiError(lastError);
}; 