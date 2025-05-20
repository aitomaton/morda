import { BaseService } from './BaseService';
import { ApiClient, apiClient } from './ApiClient';
import { 
  AgentConfigDTO, 
  CreateAgentConfigDTO, 
  UpdateAgentConfigDTO,
  ApiResponse 
} from './types';

/**
 * Service for managing agent configurations
 */
export class AgentService extends BaseService {
  /**
   * Base URL for agent endpoints
   */
  protected baseUrl = '/agents';
  
  /**
   * Creates a new AgentService instance
   * @param client - Optional API client to use
   */
  constructor(client: ApiClient = apiClient) {
    super(client);
  }

  /**
   * Get all agents
   * @returns Promise with a list of all agents
   */
  public async getAllAgents(): Promise<ApiResponse<AgentConfigDTO[]>> {
    return this.getAll<AgentConfigDTO>();
  }
  
  /**
   * Get agent by database ID
   * @param id - The database ID of the agent
   * @returns Promise with the requested agent
   */
  public async getAgentById(id: number): Promise<ApiResponse<AgentConfigDTO>> {
    return this.getById<AgentConfigDTO>(id);
  }
  
  /**
   * Get agent by its agent identifier string (not database ID)
   * @param agentId - The agent identifier string
   * @returns Promise with the requested agent
   */
  public async getAgentByAgentId(agentId: string): Promise<ApiResponse<AgentConfigDTO>> {
    return this.client.get<AgentConfigDTO>(`${this.baseUrl}/by-agent-id/${agentId}`);
  }
  
  /**
   * Check if an agent with the given agent ID exists
   * @param agentId - The agent identifier to check
   * @returns Promise with a boolean indicating if the agent exists
   */
  public async agentExistsByAgentId(agentId: string): Promise<ApiResponse<boolean>> {
    return this.client.get<boolean>(`${this.baseUrl}/exists/by-agent-id/${agentId}`);
  }
  
  /**
   * Check if an agent with the given database ID exists
   * @param id - The database ID to check
   * @returns Promise with a boolean indicating if the agent exists
   */
  public async agentExists(id: number): Promise<ApiResponse<boolean>> {
    return this.client.get<boolean>(`${this.baseUrl}/exists/${id}`);
  }
  
  /**
   * Create a new agent
   * @param agent - The agent configuration to create
   * @returns Promise with the created agent
   */
  public async createAgent(agent: CreateAgentConfigDTO): Promise<ApiResponse<AgentConfigDTO>> {
    return this.create<AgentConfigDTO, CreateAgentConfigDTO>(agent);
  }
  
  /**
   * Update an existing agent
   * @param id - The database ID of the agent to update
   * @param agent - The updated agent configuration
   * @returns Promise with the updated agent
   */
  public async updateAgent(id: number, agent: UpdateAgentConfigDTO): Promise<ApiResponse<AgentConfigDTO>> {
    return this.update<AgentConfigDTO, UpdateAgentConfigDTO>(id, agent);
  }
  
  /**
   * Delete an agent
   * @param id - The database ID of the agent to delete
   * @returns Promise indicating success or failure
   */
  public async deleteAgent(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(id);
  }
}

// Create a singleton instance
export const agentService = new AgentService();