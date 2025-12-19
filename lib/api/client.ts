import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { ApiError } from '@/lib/utils/error-handler'
import { getQrToken } from '@/lib/stores/qr-token-store'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/**
 * Axios client for customer-frontend
 * For GUEST users: Uses QR token as Bearer token in Authorization header
 * For CUSTOMER users (authenticated): Will use x-qr-token header (to be implemented)
 */
const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

// Request interceptor - add Bearer token for API requests
apiClient.interceptors.request.use(
  (config) => {
    // Get QR token from store and add as Bearer token
    const qrToken = getQrToken()
    if (qrToken) {
      config.headers.Authorization = `Bearer ${qrToken}`
    }
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

