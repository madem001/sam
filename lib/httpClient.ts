/**
 * HTTP Client para comunicación con el backend
 * Reemplaza Supabase con llamadas directas al API backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

class HttpClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken() {
    this.token = localStorage.getItem('auth_token');
  }

  private saveToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  private clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers: customHeaders } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(customHeaders);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ [HTTP Client] Error:', error);
      throw error;
    }
  }

  // Métodos convenientes
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Métodos de autenticación
  setToken(token: string) {
    this.saveToken(token);
  }

  getToken(): string | null {
    return this.token;
  }

  logout() {
    this.clearToken();
  }
}

// Instancia única del cliente
export const httpClient = new HttpClient(API_BASE_URL);

// Helper para autenticación
export const setAuthToken = (token: string) => {
  httpClient.setToken(token);
};

export const clearAuthToken = () => {
  httpClient.logout();
};

export const getAuthToken = (): string | null => {
  return httpClient.getToken();
};
