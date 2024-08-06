import { jwtDecode } from "jwt-decode";

import { goto } from '$app/navigation';
import type { RegisterData, LoginData, ListData, ListItemData } from '../lib/types';

interface JwtPayload {
    exp: number;
    // Add other fields from your JWT payload as needed
}

const baseUrl = 'http://localhost:8000';

// Separate function for token refresh
// Current token refresh settings:
//  - 'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
//  - 'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
//  - 'ROTATE_REFRESH_TOKENS': True,
//  - 'BLACKLIST_AFTER_ROTATION': True,
async function refreshTokenRequest(): Promise<string> {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('No refresh token available');

    const response = await fetch(`${baseUrl}/api/token/refresh/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
    }

    return data.access;
}

async function request<T>(method: string, url: string, data?: object, headers: Record<string, string> = {}, skipAuth: boolean = false): Promise<T | null> {
    if (!skipAuth) {
        let accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            try {
                const decodedToken = jwtDecode<JwtPayload>(accessToken);
                if (decodedToken.exp < Date.now() / 1000) {
                    console.log('DEBUG GOING TO REFRESH TOKEN');
                    accessToken = await refreshTokenRequest();
                }
                headers['Authorization'] = `Bearer ${accessToken}`;
            } catch {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                goto('/');
                throw new Error('Session expired. Please log in again.');
            }
        } else {
            goto('/');
            throw new Error('No access token found. Please log in.');
        }
    }

    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(`${baseUrl}${url}`, options);

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error response body:', errorBody);

        let errorMessage = 'API request failed';
        try {
            const errorJson = JSON.parse(errorBody);
            errorMessage = errorJson.error || errorJson.detail || errorMessage;
        } catch (e) {
            console.warn('Error response was not JSON:', e);
        }

        throw new Error(`${errorMessage} (Status ${response.status})`);
    }

    // Handle 205 Reset Content
    if (response.status === 205) {
        return null;
    }

    // For other successful responses, try to parse JSON
    try {
        return await response.json();
    } catch (error) {
        console.warn('Response is not JSON:', error);
        return null;
    }
}


export function register(data: RegisterData) {
    return request<RegisterData>('POST', '/api/users/register/', data, {}, true);
}

export async function login(data: LoginData) {
    const response = await request<{ access: string, refresh: string } | null>('POST', '/api/users/login/', data, {}, true);
    
    if (response === null) {
        throw new Error('Login failed: No response data received');
    }

    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
    return response;
}

export async function logout() {
    let refreshToken = localStorage.getItem('refresh_token');

    // check token validity before logout request to avoid token refresh token rotation inside the request function
    try {
        let accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            const decodedToken = jwtDecode<JwtPayload>(accessToken);
            if (decodedToken.exp < Date.now() / 1000) {
                accessToken = await refreshTokenRequest();
                // After refreshing the access token, update the refresh token
                refreshToken = localStorage.getItem('refresh_token');
            }
        } else {
            throw new Error('No access token found. Please log in.');
        }

        await request('POST', '/api/users/logout/', { refresh_token: refreshToken });
    } catch (error) {
        console.error('Logout failed:', error);
        throw error;
    } finally {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
}


export function getLists() {
    return request<ListData[]>('GET', '/api/lists/');
}

export function createList(data: { name: string; shared_with: number[] }) {
    return request<ListData>('POST', '/api/lists/', data);
}

export function getListDetail(id: number) {
    return request<ListData>('GET', `/api/lists/${id}/`);
}

export function getListItems(id: number) {
    return request<ListItemData[]>('GET', `/api/lists/${id}/items/`);
}