import { create } from 'zustand';
import { ChatDTO, CreateMessageDTO, MessageDTO } from '../services/types';
import { chatService } from '../services/ChatService';
import { SipClientSingalRService } from '../services/SipSignalRService';

/**
 * Interface for the chat store state
 */
interface ChatStoreState {
  // State
  chats: ChatDTO[];
  activeChat: ChatDTO | null;
  loading: boolean;
  error: string | null;
  signalRConnected: boolean;
  signalRService: SipClientSingalRService;
  
  // Actions
  setChats: (chats: ChatDTO[]) => void;
  setActiveChat: (chat: ChatDTO | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSignalRConnected: (connected: boolean) => void;
  updateChatWithMessage: (chatId: number, message: MessageDTO) => void;
  
  // API interactions
  initializeConnection: () => Promise<void>;
  fetchChats: () => Promise<ChatDTO[] | null>;
  loadChat: (chatId: number) => Promise<ChatDTO | null>;
  createChat: (agentConfigId: number, title?: string) => Promise<ChatDTO | null>;
  updateChat: (chatId: number, title: string) => Promise<ChatDTO | null>;
  deleteChat: (chatId: number) => Promise<boolean>;
  sendMessage: (chatId: number, message: CreateMessageDTO) => Promise<MessageDTO | null>;
  
  // Selectors
  getChatById: (id: number) => ChatDTO | undefined;
  getChatsByAgentId: (agentId: number) => ChatDTO[];
}

/**
 * Create the Zustand store for chats
 */
const useChatStore = create<ChatStoreState>()((set, get) => {
  // Create SignalR service instance
  const signalRService = new SipClientSingalRService();
  
  return {
    // Initial state
    chats: [],
    activeChat: null,
    loading: false,
    error: null,
    signalRConnected: false,
    signalRService,
    
    // State setters
    setChats: (chats) => set({ chats }),
    setActiveChat: (chat) => set({ activeChat: chat }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setSignalRConnected: (connected) => set({ signalRConnected: connected }),
    
    // Update chat with a new message
    updateChatWithMessage: (chatId, message) => {
      const { chats, activeChat } = get();
      
      // Update chat in chats array
      set({
        chats: chats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...(chat.messages || []), message],
              messageCount: (chat.messageCount || 0) + 1
            };
          }
          return chat;
        })
      });
      
      // Update active chat if needed
      if (activeChat && activeChat.id === chatId) {
        set({
          activeChat: {
            ...activeChat,
            messages: [...(activeChat.messages || []), message],
            messageCount: (activeChat.messageCount || 0) + 1
          }
        });
      }
    },
    
    // Initialize SignalR connection
    initializeConnection: async () => {
      const { setError, setSignalRConnected, updateChatWithMessage, fetchChats } = get();
      
      try {
        // Connect to SignalR hub
        await signalRService.connect();
        setSignalRConnected(true);
        
        // Set up message handler
        signalRService.onNewMessage((message, chatId) => {
          updateChatWithMessage(chatId, message);
        });
        
        // Fetch initial chats
        await fetchChats();
      } catch (err) {
        setError(`Failed to connect to chat service: ${err}`);
        setSignalRConnected(false);
      }
    },
    
    // Fetch all chats
    fetchChats: async () => {
      set({ loading: true, error: null });
      
      try {
        const response = await chatService.getAllChats();
        if (response.success) {
          set({ chats: response.data });
          return response.data;
        } else {
          set({ error: response.error || 'Failed to fetch chats' });
        }
      } catch (err) {
        set({ error: `Error fetching chats: ${err}` });
      } finally {
        set({ loading: false });
      }
      
      return null;
    },
    
    // Load a specific chat with messages
    loadChat: async (chatId) => {
      const { signalRService } = get();
      set({ loading: true, error: null });
      
      try {
        const response = await chatService.getChatWithMessages(chatId);
        if (response.success) {
          // Join SignalR group for this chat
          await signalRService.joinChatGroup(chatId);
          
          set((state) => ({
            activeChat: response.data,
            // Update this chat in the chats list too
            chats: state.chats.map(chat => 
              chat.id === chatId ? response.data : chat
            )
          }));
          
          return response.data;
        } else {
          set({ error: response.error || 'Failed to load chat' });
        }
      } catch (err) {
        set({ error: `Error loading chat: ${err}` });
      } finally {
        set({ loading: false });
      }
      
      return null;
    },
    
    // Create a new chat
    createChat: async (agentConfigId, title) => {
      set({ loading: true, error: null });
      
      try {
        const response = await chatService.createChat({ agentConfigId, title });
        if (response.success) {
          set((state) => ({
            chats: [...state.chats, response.data]
          }));
          return response.data;
        } else {
          set({ error: response.error || 'Failed to create chat' });
        }
      } catch (err) {
        set({ error: `Error creating chat: ${err}` });
      } finally {
        set({ loading: false });
      }
      
      return null;
    },
    
    // Send a message in a chat
    sendMessage: async (chatId, message) => {
      set({ loading: true, error: null });
      
      try {
        const response = await chatService.addMessageToChat(chatId, message);
        if (response.success) {
          // The message will be added through the SignalR notification
          // but we could also update it directly here if needed
          return response.data;
        } else {
          set({ error: response.error || 'Failed to send message' });
        }
      } catch (err) {
        set({ error: `Error sending message: ${err}` });
      } finally {
        set({ loading: false });
      }
      
      return null;
    },
    
    // Update a chat
    updateChat: async (chatId, title) => {
      set({ loading: true, error: null });
      
      try {
        const response = await chatService.updateChat(chatId, { title });
        if (response.success) {
          set((state) => {
            const newState: Partial<ChatStoreState> = {
              chats: state.chats.map(chat => 
                chat.id === chatId ? response.data : chat
              )
            };
            
            // Update active chat if it's the one being updated
            if (state.activeChat && state.activeChat.id === chatId) {
              newState.activeChat = response.data;
            }
            
            return newState;
          });
          
          return response.data;
        } else {
          set({ error: response.error || 'Failed to update chat' });
        }
      } catch (err) {
        set({ error: `Error updating chat: ${err}` });
      } finally {
        set({ loading: false });
      }
      
      return null;
    },
    
    // Delete a chat
    deleteChat: async (chatId) => {
      set({ loading: true, error: null });
      
      try {
        const response = await chatService.deleteChat(chatId);
        if (response.success) {
          set((state) => {
            const newState: Partial<ChatStoreState> = {
              chats: state.chats.filter(chat => chat.id !== chatId)
            };
            
            // Clear active chat if it's the one being deleted
            if (state.activeChat && state.activeChat.id === chatId) {
              newState.activeChat = null;
            }
            
            return newState;
          });
          
          return true;
        } else {
          set({ error: response.error || 'Failed to delete chat' });
        }
      } catch (err) {
        set({ error: `Error deleting chat: ${err}` });
      } finally {
        set({ loading: false });
      }
      
      return false;
    },
    
    // Selectors
    getChatById: (id) => {
      return get().chats.find(chat => chat.id === id);
    },
    
    getChatsByAgentId: (agentId) => {
      return get().chats.filter(chat => chat.agentConfigId === agentId);
    }
  };
});

export default useChatStore;