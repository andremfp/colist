const baseUrl = 'http://localhost:8000';

import type { RegisterData, LoginData, ListData } from '../lib/types';

async function request<T>(method: string, url: string, data?: object, headers: HeadersInit = {}): Promise<T> {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };
    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${baseUrl}${url}`, options);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'API request failed');
    }
    return response.json();
}

export function register(data: RegisterData) {
    return request('POST', '/api/users/register/', data);
}

export function login(data: LoginData) {
    return request<{ access: string }>('POST', '/api/users/login/', data);
}

export function getLists() {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return request<ListData[]>('GET', '/api/lists/', undefined, headers);
}

export function createList(data: { name: string; shared_with: number[] }) {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return request<ListData>('POST', '/api/lists/', data, headers);
}

export function getListDetails(id: number) {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return request<ListData>('GET', `/api/lists/${id}/`, undefined, headers);
}