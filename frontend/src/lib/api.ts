const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface RequestOptions {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const token = localStorage.getItem('token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
    }

    return response.json();
}

export const api = {
    // Auth
    login: (email: string, password: string) =>
        request<{ token: string; user: any }>('/auth/login', {
            method: 'POST',
            body: { email, password },
        }),

    getMe: () => request<any>('/auth/me'),

    // Dashboard
    getDashboard: () => request<any>('/reports/dashboard'),

    // Sessions
    getSessions: (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return request<any[]>(`/sessions${query}`);
    },

    getTodaySessions: () => request<any[]>('/sessions/today'),

    getSession: (id: string) => request<any>(`/sessions/${id}`),

    createSession: (data: any) =>
        request<any>('/sessions', { method: 'POST', body: data }),

    startSession: (id: string) =>
        request<any>(`/sessions/${id}/start`, { method: 'POST' }),

    endSession: (id: string) =>
        request<any>(`/sessions/${id}/end`, { method: 'POST' }),

    lockSession: (id: string) =>
        request<any>(`/sessions/${id}/lock`, { method: 'POST' }),

    // Attendance
    getSessionAttendance: (sessionId: string) =>
        request<any>(`/attendance/session/${sessionId}`),

    manualCheckin: (sessionId: string, personId: string) =>
        request<any>('/attendance/checkin', {
            method: 'POST',
            body: { sessionId, personId },
        }),

    // Persons
    getPersons: (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return request<any[]>(`/persons${query}`);
    },

    createPerson: (data: any) =>
        request<any>('/persons', { method: 'POST', body: data }),

    // Rooms
    getRooms: () => request<any[]>('/rooms'),

    createRoom: (data: any) =>
        request<any>('/rooms', { method: 'POST', body: data }),

    // Cameras
    getCameras: () => request<any[]>('/cameras'),

    getCameraStatus: () => request<any>('/cameras/status/overview'),

    createCamera: (data: any) =>
        request<any>('/cameras', { method: 'POST', body: data }),

    testCamera: (id: string) =>
        request<any>(`/cameras/${id}/test`, { method: 'POST' }),

    // Reports
    getSessionReport: (sessionId: string) =>
        request<any>(`/reports/session/${sessionId}`),

    exportSessionReport: (sessionId: string) =>
        request<any>(`/reports/export/session/${sessionId}`),

    // Units
    getUnits: () => request<any[]>('/units'),

    // Organizations
    getOrganizations: () => request<any[]>('/organizations'),
};
