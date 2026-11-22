/**
 * Base HTTP client for UNIScheduler backend API.
 * Communicates with Spring Boot backend at http://localhost:8080/api (via Vite proxy or direct URL).
 */

const API_BASE_URL = (import.meta as unknown as {env?: Record<string, string>}).env?.VITE_API_URL || '/api'

export class ApiError extends Error {
    status: number
    details?: unknown

    constructor(
        status: number,
        message: string,
        details?: unknown,
    ) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.details = details
    }
}

type QueryParams = Record<string, string | number | boolean | null | undefined>

function buildUrl(endpoint: string, params?: QueryParams): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
    const url = new URL(`${base}${cleanEndpoint}`, window.location.origin)

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, String(value))
            }
        })
    }

    // Return pathname + search so it works seamlessly with relative URLs and Vite proxy
    return `${url.pathname}${url.search}`
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    params?: QueryParams,
): Promise<T> {
    const url = buildUrl(endpoint, params)

    const headers = new Headers(options.headers || {})
    if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
        headers.set('Content-Type', 'application/json')
    }
    headers.set('Accept', 'application/json')

    const response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers,
    })

    if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        let errorDetails: unknown = null
        try {
            const data = await response.json()
            errorDetails = data
            if (data?.message) {
                errorMessage = data.message
            } else if (data?.error) {
                errorMessage = data.error
            }
        } catch {
            // Text or empty body
        }
        throw new ApiError(response.status, errorMessage, errorDetails)
    }

    if (response.status === 204) {
        return null as unknown as T
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
        return (await response.json()) as T
    }

    const text = await response.text()
    return (text ? JSON.parse(text) : null) as T
}

export const apiClient = {
    get<T>(endpoint: string, params?: QueryParams): Promise<T> {
        return request<T>(endpoint, {method: 'GET'}, params)
    },

    post<T>(endpoint: string, body?: unknown): Promise<T> {
        return request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        })
    },

    put<T>(endpoint: string, body?: unknown): Promise<T> {
        return request<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        })
    },

    delete<T = void>(endpoint: string, params?: QueryParams): Promise<T> {
        return request<T>(endpoint, {method: 'DELETE'}, params)
    },
}
