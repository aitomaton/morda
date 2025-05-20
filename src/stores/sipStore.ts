import { create } from 'zustand';
import { CreateSipAccountDTO, SipAccountDTO, SipCallDTO, UpdateSipAccountAgentDTO } from '../services/types';
import { sipAccountService } from '../services/SipAccountService';
import { sipCallService } from '../services/SipCallService';
import { SipClientSingalRService } from '../services/SipSignalRService';

/**
 * Interface for the SIP store state
 */
interface SipStoreState {
  // State
  sipAccounts: SipAccountDTO[];
  activeAccount: SipAccountDTO | null;
  activeCalls: SipCallDTO[];
  loading: boolean;
  error: string | null;
  signalRConnected: boolean;
  signalRService: SipClientSingalRService;
  
  // Actions
  setAccounts: (accounts: SipAccountDTO[]) => void;
  setActiveAccount: (account: SipAccountDTO | null) => void;
  setActiveCalls: (calls: SipCallDTO[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSignalRConnected: (connected: boolean) => void;
  
  // API interactions
  initializeConnection: () => Promise<void>;
  fetchAccounts: () => Promise<SipAccountDTO[] | null>;
  registerAccount: (account: CreateSipAccountDTO) => Promise<SipAccountDTO | null>;
  makeCall: (accountId: string, destination: string) => Promise<SipCallDTO | null>;
  hangupCall: (callId: number) => Promise<void>;
  disconnectSip: () => Promise<void>;
  updateAccountAgent: (accountId: string, agentConfigId: number) => Promise<SipAccountDTO | null>;
  deleteAccount: (accountId: string) => Promise<boolean>;
  reRegisterAllAccounts: () => Promise<boolean>;
  
  // Selectors
  getAccountById: (id: string) => SipAccountDTO | undefined;
  getActiveCallById: (id: number) => SipCallDTO | undefined;
  getCallsByAccountId: (accountId: string) => SipCallDTO[];
}

/**
 * Create the Zustand store for SIP
 */
const useSipStore = create<SipStoreState>()((set, get) => {
  // Create SignalR service instance
  const signalRService = new SipClientSingalRService();
  
  return {
    // Initial state
    sipAccounts: [],
    activeAccount: null,
    activeCalls: [],
    loading: false,
    error: null,
    signalRConnected: false,
    signalRService,
    
    // State setters
    setAccounts: (accounts) => set({ sipAccounts: accounts }),
    setActiveAccount: (account) => set({ activeAccount: account }),
    setActiveCalls: (calls) => set({ activeCalls: calls }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setSignalRConnected: (connected) => set({ signalRConnected: connected }),
    
    // Initialize SignalR connection
    initializeConnection: async () => {
      const MAX_RETRIES = 3;
      let retries = 0;

      const connectWithRetry = async () => {
        try {
          if (!get().signalRConnected) {
            await signalRService.connect();
            set({ signalRConnected: true });
          }

          // Set up account update handler
          signalRService.onAccountUpdate((account) => {
            set((state) => {
              const newAccounts = [...state.sipAccounts];
              const index = newAccounts.findIndex(a => a.accountId === account.accountId);

              if (index >= 0) {
                newAccounts[index] = account;
              } else {
                newAccounts.push(account);
              }

              const newState: Partial<SipStoreState> = { sipAccounts: newAccounts };

              // Update active account if needed
              if (state.activeAccount && state.activeAccount.accountId === account.accountId) {
                newState.activeAccount = account;
              }

              return newState;
            });
          });

          // Set up call update handler
          signalRService.onCallUpdate((call) => {
            set((state) => {
              if (call.status === "DISCONNECTED" || call.status === "FAILED") {
                // Remove ended call
                return {
                  activeCalls: state.activeCalls.filter(c => c.callId !== call.callId)
                };
              } else {
                // Update or add call
                const newCalls = [...state.activeCalls];
                const index = newCalls.findIndex(c => c.callId === call.callId);

                if (index >= 0) {
                  newCalls[index] = call;
                } else {
                  newCalls.push(call);
                }

                return { activeCalls: newCalls };
              }
            });
          });

          // Fetch initial accounts
          await get().fetchAccounts();
        } catch (err) {
          if (retries < MAX_RETRIES) {
            retries++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            await connectWithRetry();
          } else {
            set({ error: `Failed to connect to SIP service after ${MAX_RETRIES} attempts: ${err}`, signalRConnected: false });
          }
        }
      };

      await connectWithRetry();
    },
    
    // Fetch all SIP accounts
    fetchAccounts: async () => {
      set({ loading: true, error: null });
      
      try {
        const response = await sipAccountService.getAllAccounts();
        if (response.success) {
          set({ sipAccounts: response.data });
          return response.data;
        } else {
          set({ error: response.error || 'Failed to fetch accounts' });
        }
      } catch (err) {
        set({ error: `Error fetching accounts: ${err}` });
      } finally {
        set({ loading: false });
      }
      
      return null;
    },
    
    // Register a new SIP account
    registerAccount: async (account) => {
      set({ loading: true, error: null });
      
      try {
        const response = await sipAccountService.registerAccount(account);
        if (response.success) {
          set((state) => ({
            sipAccounts: [...state.sipAccounts, response.data]
          }));
          return response.data;
        } else {
          set({ error: response.error || 'Failed to register account' });
        }
      } catch (err) {
        set({ error: `Error registering account: ${err}` });
      } finally {
        set({ loading: false });
      }
      
      return null;
    },
    
    // Make a new call
    makeCall: async (accountId, destination) => {
      set({ loading: true, error: null });
      
      try {
        const response = await sipCallService.makeCall({ accountId, destination });
        if (response.success) {
          // Subscribe to call updates
          await signalRService.subscribeToCallUpdates(response.data.callId);
          
          set((state) => ({
            activeCalls: [...state.activeCalls, response.data]
          }));
          return response.data;
        } else {
          set({ error: response.error || 'Failed to make call' });
        }
      } catch (err) {
        set({ error: `Error making call: ${err}` });
      } finally {
        set({ loading: false });
      }
      
      return null;
    },
    
    // Hang up a call
    hangupCall: async (callId) => {
      try {
        await sipCallService.hangupCall(callId);
        // We'll get a call update event through SignalR to remove the call
      } catch (err) {
        set({ error: `Error hanging up call: ${err}` });
      }
    },
    
    // Disconnect SignalR
    disconnectSip: async () => {
      await signalRService.disconnect();
      set({ signalRConnected: false });
    },
    
    // Update account agent
    updateAccountAgent: async (accountId, agentConfigId) => {
      set({ loading: true, error: null });
      
      try {
        const updateRequest: UpdateSipAccountAgentDTO = { agentConfigId };
        const response = await sipAccountService.updateAccountAgent(accountId, updateRequest);
        if (response.success) {
          set((state) => {
            const newState: Partial<SipStoreState> = {
              sipAccounts: state.sipAccounts.map(account => 
                account.accountId === accountId ? response.data : account
              )
            };
            
            // Update active account if it's the one being updated
            if (state.activeAccount && state.activeAccount.accountId === accountId) {
              newState.activeAccount = response.data;
            }
            
            return newState;
          });
          
          return response.data;
        } else {
          set({ error: response.error || 'Failed to update account agent' });
        }
      } catch (err) {
        set({ error: `Error updating account agent: ${err}` });
      } finally {
        set({ loading: false });
      }
      
      return null;
    },
    
    // Delete account
    deleteAccount: async (accountId) => {
      set({ loading: true, error: null });
      
      try {
        const response = await sipAccountService.deleteAccount(accountId);
        if (response.success) {
          set((state) => {
            const newState: Partial<SipStoreState> = {
              sipAccounts: state.sipAccounts.filter(account => account.accountId !== accountId)
            };
            
            // Clear active account if it's the one being deleted
            if (state.activeAccount && state.activeAccount.accountId === accountId) {
              newState.activeAccount = null;
            }
            
            return newState;
          });
          
          return true;
        } else {
          set({ error: response.error || 'Failed to delete account' });
        }
      } catch (err) {
        set({ error: `Error deleting account: ${err}` });
      } finally {
        set({ loading: false });
      }
      
      return false;
    },
    
    // Re-register all accounts
    reRegisterAllAccounts: async () => {
      set({ loading: true, error: null });
      
      try {
        const response = await sipAccountService.reRegisterAllAccounts();
        if (response.success) {
          // We'll get account updates through SignalR
          return true;
        } else {
          set({ error: response.error || 'Failed to re-register accounts' });
        }
      } catch (err) {
        set({ error: `Error re-registering accounts: ${err}` });
      } finally {
        set({ loading: false });
      }
      
      return false;
    },
    
    // Selectors
    getAccountById: (id) => {
      return get().sipAccounts.find(account => account.accountId === id);
    },
    
    getActiveCallById: (id) => {
      return get().activeCalls.find(call => call.callId === id);
    },
    
    getCallsByAccountId: (accountId: string) => {
      return get().activeCalls.filter(call => call.accountId === parseInt(accountId));
    }
  };
});

export default useSipStore;