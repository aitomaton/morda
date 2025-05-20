import { BaseService } from './BaseService';
import { ApiClient, apiClient } from './ApiClient';
import { 
  ChatDTO, 
  CreateChatDTO, 
  UpdateChatDTO, 
  ApiResponse, 
  MessageDTO,
  CreateMessageDTO,
  PaginatedResponse
} from './types';

/**
 * Service for managing chats
 */
export class ChatService extends BaseService {
  /**
   * Base URL for chat endpoints
   */
  protected baseUrl = '/chats';
  
  /**
   * Creates a new ChatService instance
   * @param client - Optional API client to use
   */
  constructor(client: ApiClient = apiClient) {
    super(client);
  }

  /**
   * Get all chats
   * @returns Promise with a list of all chats
   */
  public async getAllChats(): Promise<ApiResponse<ChatDTO[]>> {
    return this.getAll<ChatDTO>();
  }
  
  /**
   * Get chats with pagination
   * @param page - Page number
   * @param pageSize - Items per page
   * @param filters - Optional filters
   * @returns Promise with paginated chats
   */
  public async getChatsPaginated(
    page: number = 1,
    pageSize: number = 10,
    filters?: Record<string, any>
  ): Promise<ApiResponse<PaginatedResponse<ChatDTO>>> {
    return this.getPaginated<ChatDTO>(page, pageSize, filters);
  }
  
  /**
   * Get chats by agent ID
   * @param agentId - The agent ID to filter by
   * @returns Promise with chats for the specified agent
   */
  public async getChatsByAgentId(agentId: number): Promise<ApiResponse<ChatDTO[]>> {
    return this.client.get<ChatDTO[]>(`${this.baseUrl}/by-agent/${agentId}`);
  }
  
  /**
   * Get chats by agent ID with pagination
   * @param agentId - The agent ID to filter by
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Promise with paginated chats for the specified agent
   */
  public async getChatsByAgentIdPaginated(
    agentId: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PaginatedResponse<ChatDTO>>> {
    return this.client.getPaginated<ChatDTO>(
      `${this.baseUrl}/by-agent/${agentId}`,
      { page, pageSize }
    );
  }
  
  /**
   * Get chat by ID
   * @param id - The chat ID
   * @returns Promise with the requested chat
   */
  public async getChatById(id: number): Promise<ApiResponse<ChatDTO>> {
    return this.getById<ChatDTO>(id);
  }
  
  /**
   * Get chat with messages
   * @param id - The chat ID
   * @returns Promise with the chat including its messages
   */
  public async getChatWithMessages(id: number): Promise<ApiResponse<ChatDTO>> {
    return this.client.get<ChatDTO>(`${this.baseUrl}/${id}/with-messages`);
  }
  
  /**
   * Create a new chat
   * @param chat - The chat data to create
   * @returns Promise with the created chat
   */
  public async createChat(chat: CreateChatDTO): Promise<ApiResponse<ChatDTO>> {
    return this.create<ChatDTO, CreateChatDTO>(chat);
  }
  
  /**
   * Update an existing chat
   * @param id - The chat ID
   * @param chat - The updated chat data
   * @returns Promise with the updated chat
   */
  public async updateChat(id: number, chat: UpdateChatDTO): Promise<ApiResponse<ChatDTO>> {
    return this.update<ChatDTO, UpdateChatDTO>(id, chat);
  }
  
  /**
   * Delete a chat
   * @param id - The chat ID
   * @returns Promise indicating success or failure
   */
  public async deleteChat(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(id);
  }

  /**
   * Get chat messages
   * @param chatId - The chat ID
   * @returns Promise with messages for the specified chat
   */
  public async getChatMessages(chatId: number): Promise<ApiResponse<MessageDTO[]>> {
    return this.client.get<MessageDTO[]>(`${this.baseUrl}/${chatId}/messages`);
  }
  
  /**
   * Get chat messages with pagination
   * @param chatId - The chat ID
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Promise with paginated messages for the specified chat
   */
  public async getChatMessagesPaginated(
    chatId: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<MessageDTO>>> {
    return this.client.getPaginated<MessageDTO>(
      `${this.baseUrl}/${chatId}/messages`,
      { page, pageSize }
    );
  }
  
  /**
   * Add a message to a chat
   * @param chatId - The chat ID
   * @param message - The message to add
   * @returns Promise with the created message
   */
  public async addMessageToChat(chatId: number, message: CreateMessageDTO): Promise<ApiResponse<MessageDTO>> {
    return this.client.post<MessageDTO>(`${this.baseUrl}/${chatId}/messages`, message);
  }
  
  /**
   * Search chats by text
   * @param query - The search query
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Promise with paginated search results
   */
  public async searchChats(
    query: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PaginatedResponse<ChatDTO>>> {
    return this.client.getPaginated<ChatDTO>(
      `${this.baseUrl}/search`,
      { query, page, pageSize }
    );
  }
}

// Create a singleton instance
export const chatService = new ChatService();