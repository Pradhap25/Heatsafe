import {
  User,
  WeatherResponse,
  HeatRiskAssessment,
  Facility,
  HydrationReminder,
  HydrationSummary,
  AssistantResponse,
  EmployerDashboardSummary,
  Worksite,
  Incident
} from '../types';

const API_BASE = '/api/v1';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('heatsafe_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Authentication
  async register(data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    workplace_or_org?: string;
    preferred_language?: string;
  }): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    if (!res.ok) {
      throw new Error('Failed to retrieve profile');
    }
    return res.json();
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error('Failed to update profile');
    }
    return res.json();
  },

  // Weather & Heat Risk
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherResponse> {
    const res = await fetch(`${API_BASE}/weather/current?latitude=${lat}&longitude=${lon}`);
    if (!res.ok) {
      throw new Error('Failed to retrieve live weather data');
    }
    return res.json();
  },

  async getHeatRisk(lat: number, lon: number, activityCategory: string = 'outdoor_worker'): Promise<HeatRiskAssessment> {
    const res = await fetch(`${API_BASE}/heat-risk?latitude=${lat}&longitude=${lon}&activity_category=${activityCategory}`);
    if (!res.ok) {
      throw new Error('Failed to evaluate heat risk');
    }
    return res.json();
  },

  async getHeatRiskHistory(lat: number, lon: number): Promise<HeatRiskAssessment[]> {
    const res = await fetch(`${API_BASE}/heat-risk/history?latitude=${lat}&longitude=${lon}`);
    if (!res.ok) {
      return [];
    }
    return res.json();
  },

  // Hydration
  async getHydrationReminders(): Promise<HydrationReminder[]> {
    const res = await fetch(`${API_BASE}/hydration/reminders`, {
      headers: getAuthHeader()
    });
    if (!res.ok) return [];
    return res.json();
  },

  async acknowledgeReminder(id: number, amount_ml: number = 250, notes?: string) {
    const res = await fetch(`${API_BASE}/hydration/reminders/${id}/acknowledge`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ amount_ml, user_notes: notes })
    });
    return res.json();
  },

  async getHydrationSummary(): Promise<HydrationSummary> {
    const res = await fetch(`${API_BASE}/hydration/summary`, {
      headers: getAuthHeader()
    });
    if (!res.ok) {
      throw new Error('Failed to retrieve hydration stats');
    }
    return res.json();
  },

  // Facilities
  async getNearbyFacilities(lat: number, lon: number, radiusKm: number = 25, category?: string): Promise<Facility[]> {
    let url = `${API_BASE}/facilities/nearby?latitude=${lat}&longitude=${lon}&radius_km=${radiusKm}`;
    if (category) url += `&category=${category}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    return res.json();
  },

  async reportFacilityIssue(facilityId: number, reportType: string, description: string) {
    const res = await fetch(`${API_BASE}/facilities/reports`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ facility_id: facilityId, report_type: reportType, description })
    });
    return res.json();
  },

  async submitNewFacility(data: Partial<Facility>) {
    const res = await fetch(`${API_BASE}/facilities`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Bilingual Voice Assistant
  async sendAssistantMessage(message: string, language: string = 'en'): Promise<AssistantResponse> {
    const res = await fetch(`${API_BASE}/assistant/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language })
    });
    if (!res.ok) {
      throw new Error('Assistant communication error');
    }
    return res.json();
  },

  // Employer Portal
  async getEmployerDashboard(orgId: number = 1): Promise<EmployerDashboardSummary> {
    const res = await fetch(`${API_BASE}/organisations/${orgId}/dashboard`, {
      headers: getAuthHeader()
    });
    if (!res.ok) {
      throw new Error('Failed to load employer dashboard');
    }
    return res.json();
  },

  async getWorksites(orgId: number = 1): Promise<Worksite[]> {
    const res = await fetch(`${API_BASE}/organisations/${orgId}/worksites`, {
      headers: getAuthHeader()
    });
    if (!res.ok) return [];
    return res.json();
  },

  async createWorksite(orgId: number, data: Partial<Worksite>): Promise<Worksite> {
    const res = await fetch(`${API_BASE}/organisations/${orgId}/worksites`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async reportIncident(orgId: number, data: Partial<Incident>): Promise<Incident> {
    const res = await fetch(`${API_BASE}/organisations/${orgId}/incidents`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Admin Console
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeader()
    });
    return res.json();
  },

  async verifyFacility(id: number, status: string, notes?: string) {
    const res = await fetch(`${API_BASE}/admin/facilities/${id}/verification`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify({ verification_status: status, notes })
    });
    return res.json();
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: getAuthHeader()
    });
    return res.json();
  }
};
