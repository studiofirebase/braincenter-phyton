/**
 * Cerebro Central API Client Service
 * Provides typed HTTP methods with Bearer token authentication,
 * automatic fallback, and an automated test runner for all endpoints.
 */

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

export interface ApiTestResult {
  endpoint: string;
  method: string;
  status: number;
  latencyMs: number;
  passed: boolean;
  response: any;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('cc_auth_token') || 'valid_admin_token_xyz987';
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('cc_auth_token', token);
      } else {
        localStorage.removeItem('cc_auth_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; status: number; headers: Headers }> {
    const url = `${BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (this.token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));
    return { data, status: res.status, headers: res.headers };
  }

  // System & Health
  async getHealth() {
    return this.request('/health');
  }

  // Authentication
  async login(email: string = 'dani@admin', password: string = 'admin123') {
    const res = await this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.data?.access_token) {
      this.setToken(res.data.access_token);
    }
    return res;
  }

  async logout() {
    const res = await this.request('/api/v1/auth/logout', { method: 'POST' });
    this.setToken(null);
    return res;
  }

  async getMe() {
    return this.request('/api/v1/auth/me');
  }

  async refreshToken() {
    const res = await this.request('/api/v1/auth/refresh', { method: 'POST' });
    if (res.data?.access_token) {
      this.setToken(res.data.access_token);
    }
    return res;
  }

  // Users
  async getUsers() {
    return this.request('/api/v1/users');
  }

  async getUser(userId: string) {
    return this.request(`/api/v1/users/${userId}`);
  }

  async updateUser(userId: string, data: { name?: string; email?: string; plan?: string }) {
    return this.request(`/api/v1/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Organizations
  async getOrganizations() {
    return this.request('/api/v1/organizations');
  }

  async createOrganization(name: string, slug?: string) {
    return this.request('/api/v1/organizations', {
      method: 'POST',
      body: JSON.stringify({ name, slug })
    });
  }

  async getOrganization(orgId: string) {
    return this.request(`/api/v1/organizations/${orgId}`);
  }

  // Media (Cloudflare R2)
  async getMediaList() {
    return this.request('/api/v1/media');
  }

  async uploadMedia(data: { filename: string; category: string; access: string; resolution?: string }) {
    return this.request('/api/v1/media/upload', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getMedia(mediaId: string) {
    return this.request(`/api/v1/media/${mediaId}`);
  }

  async deleteMedia(mediaId: string) {
    return this.request(`/api/v1/media/${mediaId}`, { method: 'DELETE' });
  }

  // Integrations
  async getIntegrations() {
    return this.request('/api/v1/integrations');
  }

  async connectIntegration(provider: string) {
    return this.request(`/api/v1/integrations/${provider}/connect`, { method: 'POST' });
  }

  async disconnectIntegration(provider: string) {
    return this.request(`/api/v1/integrations/${provider}/disconnect`, { method: 'POST' });
  }

  // Webhooks
  async triggerStripeWebhook(event: Record<string, any> = { type: 'payment_intent.succeeded' }) {
    return this.request('/api/v1/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }

  async triggerWhatsAppWebhook(payload: Record<string, any> = { message: 'Mensagem de teste do cliente' }) {
    return this.request('/api/v1/webhooks/whatsapp', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async triggerInstagramWebhook(payload: Record<string, any> = { media_id: '17928371928' }) {
    return this.request('/api/v1/webhooks/instagram', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Automated Test Suite Runner across all routes
  async runAllTests(onProgress?: (result: ApiTestResult) => void): Promise<ApiTestResult[]> {
    const testCases: { name: string; method: string; fn: () => Promise<{ status: number; data: any }> }[] = [
      { name: '/health', method: 'GET', fn: () => this.getHealth() },
      { name: '/api/v1/auth/login', method: 'POST', fn: () => this.login('dani@admin', 'admin123') },
      { name: '/api/v1/auth/me', method: 'GET', fn: () => this.getMe() },
      { name: '/api/v1/auth/refresh', method: 'POST', fn: () => this.refreshToken() },
      { name: '/api/v1/users', method: 'GET', fn: () => this.getUsers() },
      { name: '/api/v1/users/user_admin_1', method: 'GET', fn: () => this.getUser('user_admin_1') },
      { name: '/api/v1/organizations', method: 'GET', fn: () => this.getOrganizations() },
      { name: '/api/v1/media', method: 'GET', fn: () => this.getMediaList() },
      {
        name: '/api/v1/media/upload',
        method: 'POST',
        fn: () => this.uploadMedia({ filename: 'test_upload_4k.jpg', category: 'Fotos', access: 'Público' })
      },
      { name: '/api/v1/integrations', method: 'GET', fn: () => this.getIntegrations() },
      { name: '/api/v1/webhooks/stripe', method: 'POST', fn: () => this.triggerStripeWebhook() },
      { name: '/api/v1/webhooks/whatsapp', method: 'POST', fn: () => this.triggerWhatsAppWebhook() },
      { name: '/api/v1/webhooks/instagram', method: 'POST', fn: () => this.triggerInstagramWebhook() }
    ];

    const results: ApiTestResult[] = [];

    for (const tc of testCases) {
      const start = performance.now();
      try {
        const res = await tc.fn();
        const latencyMs = Math.round(performance.now() - start);
        const testResult: ApiTestResult = {
          endpoint: tc.name,
          method: tc.method,
          status: res.status,
          latencyMs,
          passed: res.status >= 200 && res.status < 300,
          response: res.data
        };
        results.push(testResult);
        if (onProgress) onProgress(testResult);
      } catch (err: any) {
        const latencyMs = Math.round(performance.now() - start);
        const testResult: ApiTestResult = {
          endpoint: tc.name,
          method: tc.method,
          status: 500,
          latencyMs,
          passed: false,
          response: null,
          error: err.message || 'Network error'
        };
        results.push(testResult);
        if (onProgress) onProgress(testResult);
      }
    }

    return results;
  }
}

export const apiClient = new ApiClient();
