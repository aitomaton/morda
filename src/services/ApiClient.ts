import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse } from './types';

/**
 * Configuration options for the API client
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

/**
 * Standardized API client for making HTTP requests
 */
export class ApiClient {
  private client: AxiosInstance;
  private defaultConfig: ApiClientConfig;
  
  /**
   * Creates a new API client instance
   * @param config - Configuration options for the client
   */
  constructor(config: ApiClientConfig = { baseURL: '/api' }) {
    this.defaultConfig = {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      ...config
    };
    
    this.client = axios.create(this.defaultConfig);
    
    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle specific error codes
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Process successful response
   * @param response - The Axios response object
   * @returns Standardized API response
   */
  private handleResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      data: response.data,
      success: true,
      status: response.status,
      headers: response.headers
    };
  }
  
  /**
   * Process error response
   * @param error - The error object
   * @returns Standardized API error response
   */
  private handleError(error: any): ApiResponse<never> {
    let errorMessage = 'Unknown error occurred';
    let errorCode: string | undefined;
    let statusCode: number | undefined;
    
    if (error.response) {
      // The request was made and the server responded with an error status
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || 
                     error.response.data?.title || 
                     error.response.data?.error ||
                     `Server error: ${statusCode}`;
      errorCode = error.response.data?.code;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response received from server';
      errorCode = 'NETWORK_ERROR';
    } else {
      // Something happened in setting up the request
      errorMessage = error.message || errorMessage;
      errorCode = 'CLIENT_ERROR';
    }
    
    return {
      data: null as never,
      success: false,
      error: errorMessage,
      errorCode,
      status: statusCode
    };
  }
  
  /**
   * Perform a GET request
   * @param url - The endpoint URL
   * @param params - Query parameters
   * @param config - Additional Axios request config
   * @returns Promise with the API response
   */
  public async get<T>(
    url: string, 
    params?: Record<string, any>, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, { ...config, params });
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Perform a GET request that returns a paginated response
   * @param url - The endpoint URL
   * @param params - Query parameters including pagination info
   * @param config - Additional Axios request config
   * @returns Promise with the paginated API response
   */
  public async getPaginated<T>(
    url: string, 
    params?: Record<string, any> & { page?: number; pageSize?: number; }, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    return this.get<PaginatedResponse<T>>(url, params, config);
  }
  
  /**
   * Perform a POST request
   * @param url - The endpoint URL
   * @param data - The data to send in the request body
   * @param config - Additional Axios request config
   * @returns Promise with the API response
   */
  public async post<T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Perform a PUT request
   * @param url - The endpoint URL
   * @param data - The data to send in the request body
   * @param config - Additional Axios request config
   * @returns Promise with the API response
   */
  public async put<T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Perform a PATCH request
   * @param url - The endpoint URL
   * @param data - The data to send in the request body
   * @param config - Additional Axios request config
   * @returns Promise with the API response
   */
  public async patch<T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Perform a DELETE request
   * @param url - The endpoint URL
   * @param config - Additional Axios request config
   * @returns Promise with the API response
   */
  public async delete<T>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Create a default instance
export const apiClient = new ApiClient();