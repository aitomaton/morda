import { apiClient, ApiClient } from './ApiClient';
import { ApiResponse, PaginatedResponse } from './types';

/**
 * Base service class that all API services should extend
 */
export abstract class BaseService {
  /**
   * The HTTP client instance for making API requests
   */
  protected client: ApiClient;
  
  /**
   * Base URL for all endpoints of this service
   */
  protected abstract baseUrl: string;
  
  /**
   * Creates a new service instance
   * @param client - Optional API client instance to use
   */
  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }
  
  /**
   * Generic method to get all items from an endpoint
   * @returns Promise with API response containing array of items
   */
  protected async getAll<T>(): Promise<ApiResponse<T[]>> {
    return this.client.get<T[]>(this.baseUrl);
  }
  
  /**
   * Generic method to get paginated items from an endpoint
   * @param page - Page number (1-based)
   * @param pageSize - Number of items per page
   * @param filters - Additional filters to apply
   * @returns Promise with API response containing paginated items
   */
  protected async getPaginated<T>(
    page: number = 1,
    pageSize: number = 10,
    filters?: Record<string, any>
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    return this.client.getPaginated<T>(this.baseUrl, {
      page,
      pageSize,
      ...filters
    });
  }
  
  /**
   * Generic method to get a single item by ID
   * @param id - The ID of the item to fetch
   * @returns Promise with API response containing the item
   */
  protected async getById<T>(id: number | string): Promise<ApiResponse<T>> {
    return this.client.get<T>(`${this.baseUrl}/${id}`);
  }
  
  /**
   * Generic method to create a new item
   * @param data - The data for the new item
   * @returns Promise with API response containing the created item
   */
  protected async create<T, U>(data: U): Promise<ApiResponse<T>> {
    return this.client.post<T>(this.baseUrl, data);
  }
  
  /**
   * Generic method to update an existing item
   * @param id - The ID of the item to update
   * @param data - The data to update
   * @returns Promise with API response containing the updated item
   */
  protected async update<T, U>(id: number | string, data: U): Promise<ApiResponse<T>> {
    return this.client.put<T>(`${this.baseUrl}/${id}`, data);
  }
  
  /**
   * Generic method to delete an item
   * @param id - The ID of the item to delete
   * @returns Promise with API response
   */
  protected async delete<T = void>(id: number | string): Promise<ApiResponse<T>> {
    return this.client.delete<T>(`${this.baseUrl}/${id}`);
  }
}
