import { goto } from '$app/navigation';
import type { RegisterData, LoginData, ListData, ListItemData } from '../lib/types';

const baseUrl = 'http://localhost:8000';

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

export async function logout() {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        await request('POST', '/api/users/logout/', undefined, headers);
    } catch (error) {
        console.error('Logout failed:', error);
    } finally {
        // Clear the access token and redirect to the login page
        localStorage.removeItem('access_token');
        goto('/');
    }
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

export function getListDetail(id: number) {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return request<ListData>('GET', `/api/lists/${id}/`, undefined, headers);
}

export function getListItems(id: number) {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return request<ListItemData[]>('GET', `/api/lists/${id}/items`, undefined, headers);
}