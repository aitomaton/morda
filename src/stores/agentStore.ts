import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AgentConfigDTO, CreateAgentConfigDTO, UpdateAgentConfigDTO } from '../services/types';
import { agentService } from '../services/AgentService';

/**
 * Interface for the agent store state
 */
interface AgentStoreState {
  // State
  agents: AgentConfigDTO[];
  loading: boolean;
  error: string | null;
  selectedAgentId: number | null;
  
  // Actions
  setAgents: (agents: AgentConfigDTO[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedAgentId: (id: number | null) => void;
  
  // Async actions that interact with the API
  fetchAgents: () => Promise<AgentConfigDTO[] | null>;
  createAgent: (agent: CreateAgentConfigDTO) => Promise<AgentConfigDTO | null>;
  updateAgent: (id: number, agent: UpdateAgentConfigDTO) => Promise<AgentConfigDTO | null>;
  deleteAgent: (id: number) => Promise<boolean>;
  
  // Selectors
  getAgentById: (id: number) => AgentConfigDTO | undefined;
  getSelectedAgent: () => AgentConfigDTO | undefined;
}

/**
 * Create the Zustand store for agents
 */
const useAgentStore = create<AgentStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      agents: [],
      loading: false,
      error: null,
      selectedAgentId: null,
      
      // State setters
      setAgents: (agents) => set({ agents }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setSelectedAgentId: (id) => set({ selectedAgentId: id }),
      
      // API interactions
      fetchAgents: async () => {
        set({ loading: true, error: null });
        
        try {
          const response = await agentService.getAllAgents();
          if (response.success) {
            set({ agents: response.data });
            return response.data;
          } else {
            set({ error: response.error || 'Failed to fetch agents' });
          }
        } catch (err) {
          set({ error: `Error fetching agents: ${err}` });
        } finally {
          set({ loading: false });
        }
        
        return null;
      },
      
      createAgent: async (agent) => {
        set({ loading: true, error: null });
        
        try {
          const response = await agentService.createAgent(agent);
          if (response.success) {
            set((state) => ({ 
              agents: [...state.agents, response.data] 
            }));
            return response.data;
          } else {
            set({ error: response.error || 'Failed to create agent' });
          }
        } catch (err) {
          set({ error: `Error creating agent: ${err}` });
        } finally {
          set({ loading: false });
        }
        
        return null;
      },
      
      updateAgent: async (id, agent) => {
        set({ loading: true, error: null });
        
        try {
          const response = await agentService.updateAgent(id, agent);
          if (response.success) {
            set((state) => ({
              agents: state.agents.map(a => 
                a.id === id ? response.data : a
              )
            }));
            return response.data;
          } else {
            set({ error: response.error || 'Failed to update agent' });
          }
        } catch (err) {
          set({ error: `Error updating agent: ${err}` });
        } finally {
          set({ loading: false });
        }
        
        return null;
      },
      
      deleteAgent: async (id) => {
        set({ loading: true, error: null });
        
        try {
          const response = await agentService.deleteAgent(id);
          if (response.success) {
            set((state) => ({
              agents: state.agents.filter(a => a.id !== id),
              // Reset selectedAgentId if it's the one being deleted
              selectedAgentId: state.selectedAgentId === id ? null : state.selectedAgentId
            }));
            return true;
          } else {
            set({ error: response.error || 'Failed to delete agent' });
          }
        } catch (err) {
          set({ error: `Error deleting agent: ${err}` });
        } finally {
          set({ loading: false });
        }
        
        return false;
      },
      
      // Selectors
      getAgentById: (id) => {
        return get().agents.find(agent => agent.id === id);
      },
      
      getSelectedAgent: () => {
        const { selectedAgentId, agents } = get();
        return selectedAgentId ? agents.find(agent => agent.id === selectedAgentId) : undefined;
      }
    }),
    {
      name: 'agent-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        agents: state.agents,
        selectedAgentId: state.selectedAgentId 
      })
    }
  )
);

export default useAgentStore;