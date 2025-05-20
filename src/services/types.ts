// ==========================================
// API Response Types
// ==========================================
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  errorCode?: string;
  status?: number;
  headers?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// ==========================================
// Agent Types
// ==========================================
export interface AgentConfigDTO {
  id: number;
  name: string;
  llm: LLMConfigDTO;
  whisper: WhisperConfigDTO;
  auralis: AuralisConfigDTO;
  createdAt: string;
  updatedAt: string | null;
  priority: number;
  isEnabled: boolean;
  chatCount: number;
}

export interface LLMConfigDTO {
  model: string;
  ollamaEndpoint: string;
  parameters?: Record<string, string>;
}

export interface WhisperConfigDTO {
  endpoint: string;
  language: string;
}

export interface AuralisConfigDTO {
  endpoint: string;
}

export interface CreateAgentConfigDTO {
  name: string;
  llm: {
    model: string;
    ollamaEndpoint: string;
    parameters?: Record<string, string>;
  };
  whisper: {
    endpoint: string;
    language: string;
  };
  auralis: {
    endpoint: string;
  };
  priority: number;
  isEnabled: boolean;
}

export interface UpdateAgentConfigDTO {
  name: string;
  llm?: {
    model?: string;
    ollamaEndpoint?: string;
    parameters?: Record<string, string>;
  };
  whisper?: {
    endpoint?: string;
    language?: string;
  };
  auralis?: {
    endpoint?: string;
  };
  priority?: number;
  isEnabled?: boolean;
}

// ==========================================
// SIP Account Types
// ==========================================
export interface SipAccountDTO {
  id: number;
  accountId: string;
  username: string;
  domain: string;
  registrarUri: string;
  createdAt: string;
  isActive: boolean;
  agentConfigId: number;
  agentName: string;
  calls: SipCallDTO[];
  callCount: number;
}

export interface CreateSipAccountDTO {
  username: string;
  password: string;
  domain: string;
  registrarUri: string;
  agentConfigId: number;
}

export interface UpdateSipAccountDTO {
  agentConfigId?: number;
}

export interface UpdateSipAccountAgentDTO {
  agentConfigId: number;
}

// ==========================================
// SIP Call Types
// ==========================================
export interface SipCallDTO {
  id: number;
  callId: number;
  remoteUri: string;
  startedAt: string;
  endedAt?: string;
  status: string;
  accountId: number;
}

export interface SipCallWithWssDTO extends SipCallDTO {
  wssUrl: string;
}

export interface MakeCallDTO {
  accountId: string;
  destination: string;
}

// ==========================================
// Chat Types
// ==========================================
export interface ChatDTO {
  id: number;
  createdAt: string;
  title: string | null;
  agentConfigId: number;
  agentName: string;
  messages: MessageDTO[];
  messageCount: number;
}

export interface CreateChatDTO {
  agentConfigId: number;
  title?: string;
}

export interface UpdateChatDTO {
  title?: string;
}

// ==========================================
// Message Types
// ==========================================
export interface MessageDTO {
  id: number;
  chatId: number;
  sender: string;
  content: string;
  isUserMessage: boolean;
  timestamp: string;
  metrics: {
    listenTimeMs?: number;
    thinkTimeMs?: number;
    speakTimeMs?: number;
    listenSuccess?: boolean;
    thinkSuccess?: boolean;
    speakSuccess?: boolean;
    lastUpdated: string;
    totalProcessingTimeMs: number;
  };
}

export interface CreateMessageDTO {
  chatId: number;
  sender: string;
  content: string;
  isUserMessage: boolean;
}

export interface UpdateMessageDTO {
  sender?: string;
  content?: string;
  isUserMessage?: boolean;
}