import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { ApiError } from '@/lib/utils/error-handler'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/**
 * Axios client for customer-frontend
 * Simpler than admin frontend - no auth token refresh, no tenant context header
 */
const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

// Request interceptor - add any common headers if needed
apiClient.interceptors.request.use(
  (config) => {
    // Could add session token here if needed in the future
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - centralized error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    // Transform axios error into our ApiError format
    const apiError = new ApiError(
      error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred',
      error.response?.status || 500,
      error.response?.data
    )

    return Promise.reject(apiError)
  }
)

export { apiClient }

