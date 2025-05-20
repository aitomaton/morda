import { BaseService } from './BaseService';
import { ApiClient, apiClient } from './ApiClient';
import { 
  SipAccountDTO,
  CreateSipAccountDTO,
  UpdateSipAccountAgentDTO,
  UpdateSipAccountDTO,
  ApiResponse 
} from './types';

/**
 * Response from re-registering SIP accounts
 */
export interface ReRegisterResultDTO {
  successCount: number;
  failureCount: number;
  errors: Record<string, string>;
}

/**
 * Service for managing SIP accounts
 */
export class SipAccountService extends BaseService {
  /**
   * Base URL for SIP account endpoints
   */
  protected baseUrl = '/sipaccounts';
  
  /**
   * Creates a new SipAccountService instance
   * @param client - Optional API client to use
   */
  constructor(client: ApiClient = apiClient) {
    super(client);
  }

  /**
   * Get all SIP accounts
   * @returns Promise with a list of all SIP accounts
   */
  public async getAllAccounts(): Promise<ApiResponse<SipAccountDTO[]>> {
    return this.getAll<SipAccountDTO>();
  }
  
  /**
   * Get accounts with pagination
   * @param page - Page number
   * @param pageSize - Items per page
   * @param filters - Optional filters
   * @returns Promise with paginated SIP accounts
   */
  public async getAccountsPaginated(
    page: number = 1,
    pageSize: number = 10,
    filters?: Record<string, any>
  ) {
    return this.getPaginated<SipAccountDTO>(page, pageSize, filters);
  }
  
  /**
   * Get a specific SIP account by ID
   * @param accountId - The SIP account ID
   * @returns Promise with the requested SIP account
   */
  public async getAccountById(accountId: string): Promise<ApiResponse<SipAccountDTO>> {
    return this.getById<SipAccountDTO>(accountId);
  }
  
  /**
   * Register a new SIP account
   * @param account - The SIP account data to register
   * @returns Promise with the registered SIP account
   */
  public async registerAccount(account: CreateSipAccountDTO): Promise<ApiResponse<SipAccountDTO>> {
    return this.create<SipAccountDTO, CreateSipAccountDTO>(account);
  }
  
  /**
   * Update a SIP account
   * @param accountId - The ID of the account to update
   * @param data - The updated account data
   * @returns Promise with the updated SIP account
   */
  public async updateAccount(accountId: string, data: UpdateSipAccountDTO): Promise<ApiResponse<SipAccountDTO>> {
    return this.update<SipAccountDTO, UpdateSipAccountDTO>(accountId, data);
  }
  
  /**
   * Update the agent associated with a SIP account
   * @param accountId - The SIP account ID
   * @param request - The agent update data
   * @returns Promise with the updated SIP account
   */
  public async updateAccountAgent(
    accountId: string, 
    request: UpdateSipAccountAgentDTO
  ): Promise<ApiResponse<SipAccountDTO>> {
    return this.client.put<SipAccountDTO>(`${this.baseUrl}/${accountId}/agent`, request);
  }
  
  /**
   * Delete a specific SIP account
   * @param accountId - The ID of the account to delete
   * @returns Promise indicating success or failure
   */
  public async deleteAccount(accountId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(accountId);
  }
  
  /**
   * Clear all SIP accounts
   * @returns Promise indicating success or failure
   */
  public async clearAllAccounts(): Promise<ApiResponse<void>> {
    return this.client.delete<void>(this.baseUrl);
  }
  
  /**
   * Re-register all SIP accounts
   * @returns Promise with results of the re-registration process
   */
  public async reRegisterAllAccounts(): Promise<ApiResponse<ReRegisterResultDTO>> {
    return this.client.post<ReRegisterResultDTO>(`${this.baseUrl}/re-register`);
  }
  
  /**
   * Check if an account is currently registered
   * @param accountId - The SIP account ID
   * @returns Promise with registration status
   */
  public async isAccountRegistered(accountId: string): Promise<ApiResponse<boolean>> {
    return this.client.get<boolean>(`${this.baseUrl}/${accountId}/registered`);
  }
}

// Create a singleton instance
export const sipAccountService = new SipAccountService();