import {
  AuthResponse,
  Dataset,
  DatasetPreview,
  DatasetProfile,
  CleaningOperationRequest,
  CleaningPreview,
  CleaningApplyResponse,
  CleaningStep,
  ChartDataRequest,
  ChartDataResponse,
  VisualizationItem,
  AskQuestionResponse,
  SuggestedQuestion,
  Report,
  User,
} from '../types';

const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('data_analyzer_token');
  }

  public setToken(token: string) {
    localStorage.setItem('data_analyzer_token', token);
  }

  public clearToken() {
    localStorage.removeItem('data_analyzer_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    const token = this.getToken();

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMsg = `Request failed (${res.status})`;
      try {
        const errorJson = await res.json();
        errorMsg = errorJson.detail || errorMsg;
      } catch {
        // ignore parse errors
      }
      throw new Error(errorMsg);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  // Health
  async checkHealth() {
    return this.request<{ status: string; app_name: string; database: string }>('/health');
  }

  // Auth
  async demoLogin(): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/demo', { method: 'POST' });
    this.setToken(res.access_token);
    return res;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async register(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Datasets
  async listDatasets(): Promise<Dataset[]> {
    return this.request<Dataset[]>('/datasets');
  }

  async getDataset(id: string): Promise<Dataset> {
    return this.request<Dataset>(`/datasets/${id}`);
  }

  async loadSampleDatasets(): Promise<Dataset[]> {
    return this.request<Dataset[]>('/datasets/sample', { method: 'POST' });
  }

  async uploadDataset(file: File): Promise<Dataset> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<Dataset>('/datasets', {
      method: 'POST',
      body: formData,
    });
  }

  async getDatasetPreview(
    id: string,
    page: number = 1,
    pageSize: number = 25,
    search?: string,
    sortBy?: string,
    sortOrder: string = 'asc'
  ): Promise<DatasetPreview> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      sort_order: sortOrder,
    });
    if (search) params.append('search', search);
    if (sortBy) params.append('sort_by', sortBy);

    return this.request<DatasetPreview>(`/datasets/${id}/preview?${params.toString()}`);
  }

  async getDatasetProfile(id: string): Promise<DatasetProfile> {
    return this.request<DatasetProfile>(`/datasets/${id}/profile`);
  }

  async deleteDataset(id: string): Promise<void> {
    return this.request<void>(`/datasets/${id}`, { method: 'DELETE' });
  }

  getExportUrl(id: string): string {
    return `${API_BASE}/datasets/${id}/export`;
  }

  // Cleaning
  async previewCleaning(id: string, req: CleaningOperationRequest): Promise<CleaningPreview> {
    return this.request<CleaningPreview>(`/datasets/${id}/clean/preview`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  async applyCleaning(id: string, req: CleaningOperationRequest): Promise<CleaningApplyResponse> {
    return this.request<CleaningApplyResponse>(`/datasets/${id}/clean/apply`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  async getCleaningHistory(id: string): Promise<CleaningStep[]> {
    return this.request<CleaningStep[]>(`/datasets/${id}/clean/history`);
  }

  // Visualizations
  async computeVisualization(id: string, req: ChartDataRequest): Promise<ChartDataResponse> {
    return this.request<ChartDataResponse>(`/datasets/${id}/visualize`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  async saveVisualization(datasetId: string, title: string, chartType: string, config: any): Promise<VisualizationItem> {
    return this.request<VisualizationItem>('/visualizations', {
      method: 'POST',
      body: JSON.stringify({
        dataset_id: datasetId,
        title,
        chart_type: chartType,
        config,
      }),
    });
  }

  async listVisualizations(): Promise<VisualizationItem[]> {
    return this.request<VisualizationItem[]>('/visualizations');
  }

  async deleteVisualization(id: string): Promise<void> {
    return this.request<void>(`/visualizations/${id}`, { method: 'DELETE' });
  }

  // AI Analyst
  async askQuestion(id: string, question: string, includeChart: boolean = true): Promise<AskQuestionResponse> {
    return this.request<AskQuestionResponse>(`/datasets/${id}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question, include_chart: includeChart }),
    });
  }

  async getSuggestedQuestions(id: string): Promise<SuggestedQuestion[]> {
    return this.request<SuggestedQuestion[]>(`/datasets/${id}/suggested-questions`);
  }

  // Reports
  async generateReport(datasetId: string, title?: string, customNotes?: string): Promise<Report> {
    return this.request<Report>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ dataset_id: datasetId, title, custom_notes: customNotes }),
    });
  }

  async listReports(): Promise<Report[]> {
    return this.request<Report[]>('/reports');
  }

  async getReport(id: string): Promise<Report> {
    return this.request<Report>(`/reports/${id}`);
  }
}

export const api = new ApiClient();
