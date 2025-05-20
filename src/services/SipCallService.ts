import { BaseService } from './BaseService';
import { ApiClient, apiClient } from './ApiClient';
import { 
  MakeCallDTO,
  SipCallDTO,
  SipCallWithWssDTO,
  ApiResponse 
} from './types';

/**
 * Service for managing SIP calls
 */
export class SipCallService extends BaseService {
  /**
   * Base URL for SIP call endpoints
   */
  protected baseUrl = '/sipcall';
  
  /**
   * Creates a new SipCallService instance
   * @param client - Optional API client to use
   */
  constructor(client: ApiClient = apiClient) {
    super(client);
  }
  
  /**
   * Get all active calls
   * @returns Promise with a list of all active calls
   */
  public async getAllCalls(): Promise<ApiResponse<SipCallDTO[]>> {
    return this.getAll<SipCallDTO>();
  }

  /**
   * Get a specific call by ID
   * @param callId - The call ID
   * @returns Promise with the requested call
   */
  public async getCallById(callId: number): Promise<ApiResponse<SipCallDTO>> {
    return this.getById<SipCallDTO>(callId);
  }
  
  /**
   * Make a new SIP call
   * @param request - The call request data
   * @returns Promise with the new call including WebSocket URL
   */
  public async makeCall(request: MakeCallDTO): Promise<ApiResponse<SipCallWithWssDTO>> {
    return this.client.post<SipCallWithWssDTO>(this.baseUrl, request);
  }
  
  /**
   * Hangup an active SIP call
   * @param callId - The ID of the call to hang up
   * @returns Promise indicating success or failure
   */
  public async hangupCall(callId: number): Promise<ApiResponse<void>> {
    return this.client.post<void>(`${this.baseUrl}/${callId}/hangup`);
  }
  
  /**
   * Alternative way to hangup a call using DELETE
   * @param callId - The ID of the call to delete
   * @returns Promise indicating success or failure
   */
  public async deleteCall(callId: number): Promise<ApiResponse<void>> {
    return this.delete<void>(callId);
  }
  
  /**
   * Get the status of a SIP call
   * @param callId - The ID of the call to check
   * @returns Promise with the current status of the call
   */
  public async getCallStatus(callId: number): Promise<ApiResponse<SipCallDTO>> {
    return this.client.get<SipCallDTO>(`${this.baseUrl}/${callId}/status`);
  }
  
  /**
   * Get call statistics for a specific call
   * @param callId - The call ID
   * @returns Promise with call statistics
   */
  public async getCallStatistics(callId: number): Promise<ApiResponse<any>> {
    return this.client.get<any>(`${this.baseUrl}/${callId}/statistics`);
  }
  
  /**
   * Send DTMF digits during a call
   * @param callId - The call ID
   * @param digits - The DTMF digits to send
   * @returns Promise indicating success or failure
   */
  public async sendDtmf(callId: number, digits: string): Promise<ApiResponse<void>> {
    return this.client.post<void>(`${this.baseUrl}/${callId}/dtmf`, { digits });
  }
  
  /**
   * Hold a call
   * @param callId - The call ID
   * @returns Promise indicating success or failure
   */
  public async holdCall(callId: number): Promise<ApiResponse<void>> {
    return this.client.post<void>(`${this.baseUrl}/${callId}/hold`);
  }
  
  /**
   * Unhold a call
   * @param callId - The call ID
   * @returns Promise indicating success or failure
   */
  public async unholdCall(callId: number): Promise<ApiResponse<void>> {
    return this.client.post<void>(`${this.baseUrl}/${callId}/unhold`);
  }
  
  /**
   * Mute a call
   * @param callId - The call ID
   * @returns Promise indicating success or failure
   */
  public async muteCall(callId: number): Promise<ApiResponse<void>> {
    return this.client.post<void>(`${this.baseUrl}/${callId}/mute`);
  }
  
  /**
   * Unmute a call
   * @param callId - The call ID
   * @returns Promise indicating success or failure
   */
  public async unmuteCall(callId: number): Promise<ApiResponse<void>> {
    return this.client.post<void>(`${this.baseUrl}/${callId}/unmute`);
  }
}

// Create a singleton instance
export const sipCallService = new SipCallService();