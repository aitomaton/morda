import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  User,
  Bot,
  MoreVertical,
  Pencil,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import useAgentStore from '../stores/agentStore';
import useChatStore from '../stores/chatStore';
import { CreateAgentConfigDTO, UpdateAgentConfigDTO, CreateMessageDTO } from '../services/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import TimelineChart, { ProfilerTimelineSingleBar } from './TChart';
import ChatTimelineChart from './TChart';
import ChartComponent from './TChart';
import GanttChartComponent from './TChart';
import ProfilerTimelineComponent from './TChart';


const ChatSidebar = ({ chats }) => {
  const { agents } = useAgentStore();
  const { loadChat, createChat, updateChat, deleteChat } = useChatStore();
  
  const [chatTitle, setChatTitle] = useState('');
  const [selectedAgentIdForChat, setSelectedAgentIdForChat] = useState<number | null>(null);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [editingChatTitle, setEditingChatTitle] = useState<{ id: number, title: string } | null>(null);

  const handleCreateChat = async () => {
    if (selectedAgentIdForChat) {
      await createChat(selectedAgentIdForChat, chatTitle || undefined);
      setChatTitle('');
      setSelectedAgentIdForChat(null);
      setIsNewChatDialogOpen(false);
    }
  };

  const handleUpdateChatTitle = async () => {
    if (editingChatTitle) {
      await updateChat(editingChatTitle.id, editingChatTitle.title);
      setEditingChatTitle(null);
    }
  };

  return (
    <div className="w-80 bg-background border-r flex flex-col">
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Chats</h2>
          <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> New Chat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Chat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="chatTitle">Title (optional)</Label>
                  <Input id="chatTitle" value={chatTitle} onChange={(e) => setChatTitle(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="chatAgent">Agent</Label>
                  <Select value={selectedAgentIdForChat?.toString()} onValueChange={(value) => setSelectedAgentIdForChat(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id.toString()}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateChat} disabled={!selectedAgentIdForChat}>
                  Create Chat
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-2 space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer"
              onClick={() => editingChatTitle?.id !== chat.id && loadChat(chat.id)}
            >
              {editingChatTitle?.id === chat.id ? (
                <div className="flex w-full gap-2">
                  <Input 
                    value={editingChatTitle.title} 
                    onChange={(e) => setEditingChatTitle({ ...editingChatTitle, title: e.target.value })} 
                  />
                  <Button size="sm" onClick={handleUpdateChatTitle}>Save</Button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{chat.title || `Chat #${chat.id}`}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.messages?.length > 0 ? chat.messages[chat.messages.length - 1].content : 'No messages'}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setEditingChatTitle({ id: chat.id, title: chat.title || `Chat #${chat.id}` })}>
                        <Pencil className="mr-2 h-4 w-4" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteChat(chat.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          ))}
          {chats.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">No chats created yet</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};


const ChatMain = ({ activeChat, messagesEndRef, loading }) => {
  const { sendMessage } = useChatStore();
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = async () => {
    if (activeChat && messageText.trim()) {
      const message: CreateMessageDTO = { 
        chatId: activeChat.id, 
        content: messageText, 
        sender: 'User', 
        isUserMessage: true 
      };
      await sendMessage(activeChat.id, message);
      setMessageText('');
    }
  };
  
  const formatTimestamp = (timestamp: string) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Card className="flex-1 flex flex-col overflow-hidden border-0">
      <CardHeader>
        {activeChat && (
          <>
            <ProfilerTimelineSingleBar chat={activeChat} />
          </>
        )}
      </CardHeader>
     
      <CardContent className="flex-1 overflow-auto p-0">
        {activeChat ? (
          <ScrollArea className="h-full px-4 pt-2">
            <div className="space-y-4">
              {activeChat.messages?.length > 0 ? (
                activeChat.messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    agentName={activeChat.agentConfig?.name}
                    formatTimestamp={formatTimestamp}
                  />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No messages yet</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Chat</h3>
            <p className="text-muted-foreground">Select an existing chat or create a new one</p>
          </div>
        )}
      </CardContent>
      {activeChat && (
        <CardFooter className="p-4 pt-2">
          <div className="flex w-full gap-2">
            <Input
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            />
            <Button onClick={handleSendMessage} disabled={!messageText.trim() || loading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};


const ChatMessage = ({ message, agentName, formatTimestamp }) => {
  return (
    <div className={`flex ${message.isUserMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-lg p-3 ${message.isUserMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        <div className="flex items-center mb-1">
          {message.isUserMessage ? <User className="h-4 w-4 mr-2" /> : <Bot className="h-4 w-4 mr-2" />}
          <span className="text-xs font-medium">
            {message.isUserMessage ? 'You' : agentName || 'Assistant'}
          </span>
          <span className="text-xs ml-auto">{formatTimestamp(message.timestamp)}</span>
        </div>
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.metrics && (
          <div className="text-xs text-muted-foreground mt-1">
            {message.metrics.listenTimeMs && <span>Listen: {Math.round(message.metrics.listenTimeMs)}ms </span>}
            {message.metrics.thinkTimeMs && <span>Think: {Math.round(message.metrics.thinkTimeMs)}ms </span>}
            {message.metrics.speakTimeMs && <span>Speak: {Math.round(message.metrics.speakTimeMs)}ms</span>}
          </div>
        )}
      </div>
    </div>
  );
};


const AgentSidebar = ({ agents, loading }) => {
  const { createAgent, updateAgent, deleteAgent } = useAgentStore();
  const { createChat } = useChatStore();
  
  const [newAgentData, setNewAgentData] = useState<CreateAgentConfigDTO>({
    name: '',
    llm: { model: '', ollamaEndpoint: '', parameters: {} },
    whisper: { endpoint: '', language: 'en' },
    auralis: { endpoint: '' },
    priority: 0,
    isEnabled: true
  });
  
  const [editAgentData, setEditAgentData] = useState<UpdateAgentConfigDTO & { id: number }>({
    id: 0,
    name: '',
    llm: { model: '', ollamaEndpoint: '' },
    whisper: { endpoint: '', language: 'en' },
    auralis: { endpoint: '' },
    priority: 0,
    isEnabled: true
  });
  
  const [isCreateAgentDialogOpen, setIsCreateAgentDialogOpen] = useState(false);
  const [isEditAgentDialogOpen, setIsEditAgentDialogOpen] = useState(false);

  const handleCreateAgent = async () => {
    await createAgent(newAgentData);
    setNewAgentData({
      name: '',
      llm: { model: '', ollamaEndpoint: '', parameters: {} },
      whisper: { endpoint: '', language: 'en' },
      auralis: { endpoint: '' },
      priority: 0,
      isEnabled: true
    });
    setIsCreateAgentDialogOpen(false);
  };

  const handleUpdateAgent = async () => {
    if (editAgentData.id) {
      const { id, ...updateData } = editAgentData;
      await updateAgent(id, updateData);
      setIsEditAgentDialogOpen(false);
    }
  };

  const handleSelectAgentForEdit = (agent) => {
    setEditAgentData({
      id: agent.id,
      name: agent.name,
      llm: {
        model: agent.llm?.model || '',
        ollamaEndpoint: agent.llm?.ollamaEndpoint || '',
        parameters: agent.llm?.parameters || {}
      },
      whisper: {
        endpoint: agent.whisper?.endpoint || '',
        language: agent.whisper?.language || 'en'
      },
      auralis: { endpoint: agent.auralis?.endpoint || '' },
      priority: agent.priority || 0,
      isEnabled: agent.isEnabled || false
    });
  };

  const handleStartChatWithAgent = async (agentId: number) => {
    await createChat(agentId);
  };

  return (
    <div className="w-80 bg-background border-l flex flex-col">
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Agents</h2>
          <Dialog open={isCreateAgentDialogOpen} onOpenChange={setIsCreateAgentDialogOpen}>
  <Button size="sm" onClick={() => setIsCreateAgentDialogOpen(true)}>
    <Plus className="mr-2 h-4 w-4" /> New Agent
  </Button>
  <DialogContent className="max-w-3xl">  {/* Increased width */}
    <DialogHeader>
      <DialogTitle>Create New Agent</DialogTitle>
    </DialogHeader>
    <CreateAgentForm 
      newAgentData={newAgentData} 
      setNewAgentData={setNewAgentData} 
    />
    <DialogFooter>
      <Button onClick={handleCreateAgent} disabled={loading}>
        Create
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
        </div>
      </div>
      
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-2 space-y-2">
          {agents.map((agent) => (
            <AgentListItem
              key={agent.id}
              agent={agent}
              onStartChat={() => handleStartChatWithAgent(agent.id)}
              onEdit={() => {
                handleSelectAgentForEdit(agent);
                setIsEditAgentDialogOpen(true);
              }}
              onDelete={() => deleteAgent(agent.id)}
            />
          ))}
          {agents.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">No agents created yet</div>
          )}
        </div>
      </ScrollArea>

      {/* Edit Agent Dialog */}
      <Dialog open={isEditAgentDialogOpen} onOpenChange={setIsEditAgentDialogOpen}>
  <DialogContent className="max-w-3xl">  {/* Increased width */}
    <DialogHeader>
      <DialogTitle>Edit Agent</DialogTitle>
    </DialogHeader>
    <EditAgentForm 
      editAgentData={editAgentData} 
      setEditAgentData={setEditAgentData} 
    />
    <DialogFooter>
      <Button onClick={handleUpdateAgent} disabled={loading}>
        Update
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
};


const AgentListItem = ({ agent, onStartChat, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible 
      key={agent.id} 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className="border rounded-md mb-2"
    >
      <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{agent.name}</h3>
          <p className="text-sm text-muted-foreground">
            {agent.isEnabled ? "Enabled" : "Disabled"} • Model: {agent.llm?.model || "Not set"}
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onStartChat} title="Start a chat">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit} title="Edit agent">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} title="Delete agent">
            <Trash2 className="h-4 w-4" />
          </Button>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent>
        <Card className='border-0 shadow-none p-0 m-0 w-full'>
          <CardContent className="pt-2 px-4 pb-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Priority:</span> {agent.priority}
              </div>
              <div>
                <span className="font-semibold">Model:</span> {agent.llm?.model || "Not set"}
              </div>
              <div>
                <span className="font-semibold">Endpoint:</span> {agent.llm?.ollamaEndpoint || "Not set"}
              </div>
              <div>
                <span className="font-semibold">Temperature:</span> {agent.llm?.parameters?.temperature || "Default"}
              </div>
              {agent.llm?.parameters?.systemPrompt && (
                <div className="col-span-2 mt-2">
                  <span className="font-semibold">System Prompt:</span>
                  <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-xs whitespace-pre-wrap">
                    {agent.llm?.parameters?.systemPrompt}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};

const AgentParametersForm = ({ agent, editMode = false, updateAgentParameter = null }) => {
  return (
    <div className="grid grid-cols-1 gap-3">
      <div>
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          className="w-full min-h-[100px] p-2 rounded-md border border-input bg-background"
          value={agent?.llm?.parameters?.systemPrompt || ""}
          onChange={editMode ? (e) => updateAgentParameter('systemPrompt', e.target.value, true) : undefined}
          placeholder="Enter system instructions for the agent..."
          readOnly={!editMode}
        />
      </div>
      
      <ParameterInput
        id="num_keep"
        label="Num Keep"
        type="number"
        value={agent?.llm?.parameters?.num_keep || 5}
        onChange={editMode ? (e) => updateAgentParameter('num_keep', parseInt(e.target.value)) : undefined}
        readOnly={!editMode}
      />
      
      <ParameterInput
        id="seed"
        label="Seed"
        type="number"
        value={agent?.llm?.parameters?.seed || 42}
        onChange={editMode ? (e) => updateAgentParameter('seed', parseInt(e.target.value)) : undefined}
        readOnly={!editMode}
      />
      
      <ParameterInput
        id="num_predict"
        label="Num Predict"
        type="number"
        value={agent?.llm?.parameters?.num_predict || 100}
        onChange={editMode ? (e) => updateAgentParameter('num_predict', parseInt(e.target.value)) : undefined}
        readOnly={!editMode}
      />
      
      <ParameterInput
        id="top_k"
        label="Top K"
        type="number"
        value={agent?.llm?.parameters?.top_k || 20}
        onChange={editMode ? (e) => updateAgentParameter('top_k', parseInt(e.target.value)) : undefined}
        readOnly={!editMode}
      />
      
      <ParameterInput
        id="top_p"
        label="Top P"
        type="number"
        step="0.1"
        value={agent?.llm?.parameters?.top_p || 0.9}
        onChange={editMode ? (e) => updateAgentParameter('top_p', parseFloat(e.target.value)) : undefined}
        readOnly={!editMode}
      />
      
      <ParameterInput
        id="min_p"
        label="Min P"
        type="number"
        step="0.1"
        value={agent?.llm?.parameters?.min_p || 0.0}
        onChange={editMode ? (e) => updateAgentParameter('min_p', parseFloat(e.target.value)) : undefined}
        readOnly={!editMode}
      />
      
      <ParameterInput
        id="temperature"
        label="Temperature"
        type="number"
        step="0.1"
        value={agent?.llm?.parameters?.temperature || 0.8}
        onChange={editMode ? (e) => updateAgentParameter('temperature', parseFloat(e.target.value)) : undefined}
        readOnly={!editMode}
      />

      {/* Add other parameters as needed */}
    </div>
  );
};

const ParameterInput = ({ id, label, type, value, step, onChange, readOnly }) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      type={type}
      step={step}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  </div>
);



const CreateAgentForm = ({ newAgentData, setNewAgentData }) => {
  return (
    <Tabs defaultValue="base" className="w-full">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="base">Base</TabsTrigger>
        <TabsTrigger value="llm">LLM</TabsTrigger>
        <TabsTrigger value="whisper">Whisper</TabsTrigger>
        <TabsTrigger value="auralis">Auralis</TabsTrigger>
      </TabsList>
      
      {/* Base Configuration Tab */}
      <TabsContent value="base" className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={newAgentData.name}
            onChange={(e) => setNewAgentData({ ...newAgentData, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Input
            id="priority"
            type="number"
            value={newAgentData.priority}
            onChange={(e) => setNewAgentData({ ...newAgentData, priority: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isEnabled"
            checked={newAgentData.isEnabled}
            onCheckedChange={(checked) => setNewAgentData({ ...newAgentData, isEnabled: checked })}
          />
          <Label htmlFor="isEnabled">Enabled</Label>
        </div>
      </TabsContent>
      
      {/* LLM Configuration Tab */}
      <TabsContent value="llm" className="space-y-4">
        <div>
          <Label htmlFor="llm.model">Model</Label>
          <Input
            id="llm.model"
            value={newAgentData.llm.model}
            onChange={(e) =>
              setNewAgentData({
                ...newAgentData,
                llm: { ...newAgentData.llm, model: e.target.value },
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="llm.ollamaEndpoint">Ollama Endpoint</Label>
          <Input
            id="llm.ollamaEndpoint"
            value={newAgentData.llm.ollamaEndpoint}
            onChange={(e) =>
              setNewAgentData({
                ...newAgentData,
                llm: { ...newAgentData.llm, ollamaEndpoint: e.target.value },
              })
            }
          />
        </div>
      </TabsContent>
      
      {/* Whisper Configuration Tab */}
      <TabsContent value="whisper" className="space-y-4">
        <div>
          <Label htmlFor="whisper.endpoint">Whisper Endpoint</Label>
          <Input
            id="whisper.endpoint"
            value={newAgentData.whisper.endpoint}
            onChange={(e) =>
              setNewAgentData({
                ...newAgentData,
                whisper: { ...newAgentData.whisper, endpoint: e.target.value },
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="whisper.language">Language</Label>
          <Input
            id="whisper.language"
            value={newAgentData.whisper.language}
            onChange={(e) =>
              setNewAgentData({
                ...newAgentData,
                whisper: { ...newAgentData.whisper, language: e.target.value },
              })
            }
          />
        </div>
      </TabsContent>
      
      {/* Auralis Configuration Tab */}
      <TabsContent value="auralis" className="space-y-4">
        <div>
          <Label htmlFor="auralis.endpoint">Auralis Endpoint</Label>
          <Input
            id="auralis.endpoint"
            value={newAgentData.auralis.endpoint}
            onChange={(e) =>
              setNewAgentData({
                ...newAgentData,
                auralis: { ...newAgentData.auralis, endpoint: e.target.value },
              })
            }
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};


const EditAgentForm = ({ editAgentData, setEditAgentData }) => {
  const updateAgentParameter = (paramName, value, isLlmParameter = false) => {
    if (isLlmParameter) {
      setEditAgentData(prev => ({
        ...prev,
        llm: {
          ...prev.llm,
          parameters: {
            ...prev.llm?.parameters,
            [paramName]: value
          }
        }
      }));
    } else {
      setEditAgentData(prev => ({
        ...prev,
        [paramName]: value
      }));
    }
  };

  return (
    <Tabs defaultValue="base" className="w-full">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="base">Base</TabsTrigger>
        <TabsTrigger value="llm">LLM</TabsTrigger>
        <TabsTrigger value="whisper">Whisper</TabsTrigger>
        <TabsTrigger value="auralis">Auralis</TabsTrigger>
      </TabsList>
      
      {/* Base Configuration Tab */}
      <TabsContent value="base" className="space-y-4">
        <div>
          <Label htmlFor="edit-name">Name</Label>
          <Input
            id="edit-name"
            value={editAgentData.name}
            onChange={(e) => setEditAgentData({ ...editAgentData, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="edit-priority">Priority</Label>
          <Input
            id="edit-priority"
            type="number"
            value={editAgentData.priority}
            onChange={(e) => setEditAgentData({ ...editAgentData, priority: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="edit-isEnabled"
            checked={editAgentData.isEnabled}
            onCheckedChange={(checked) => setEditAgentData({ ...editAgentData, isEnabled: checked })}
          />
          <Label htmlFor="edit-isEnabled">Enabled</Label>
        </div>
      </TabsContent>
      
      {/* LLM Configuration Tab */}
      <TabsContent value="llm" className="space-y-4">
        <div>
          <Label htmlFor="edit-llm.model">Model</Label>
          <Input
            id="edit-llm.model"
            value={editAgentData.llm.model}
            onChange={(e) =>
              setEditAgentData({
                ...editAgentData,
                llm: { ...editAgentData.llm, model: e.target.value },
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="edit-llm.ollamaEndpoint">Ollama Endpoint</Label>
          <Input
            id="edit-llm.ollamaEndpoint"
            value={editAgentData.llm.ollamaEndpoint || ''}
            onChange={(e) =>
              setEditAgentData({
                ...editAgentData,
                llm: { ...editAgentData.llm, ollamaEndpoint: e.target.value },
              })
            }
          />
        </div>
        
        {/* LLM Advanced Parameters */}
        <div>
          <Label htmlFor="edit-systemPrompt">System Prompt</Label>
          <Textarea
            id="edit-systemPrompt"
            className="min-h-[100px]"
            value={editAgentData.llm.parameters?.systemPrompt || ""}
            onChange={(e) => updateAgentParameter('systemPrompt', e.target.value, true)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-temperature">Temperature</Label>
            <Input
              id="edit-temperature"
              type="number"
              step="0.1"
              value={editAgentData.llm.parameters?.temperature || 0.8}
              onChange={(e) => updateAgentParameter('temperature', parseFloat(e.target.value), true)}
            />
          </div>
          <div>
            <Label htmlFor="edit-top_p">Top P</Label>
            <Input
              id="edit-top_p"
              type="number"
              step="0.1"
              value={editAgentData.llm.parameters?.top_p || 0.9}
              onChange={(e) => updateAgentParameter('top_p', parseFloat(e.target.value), true)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-top_k">Top K</Label>
            <Input
              id="edit-top_k"
              type="number"
              value={editAgentData.llm.parameters?.top_k || 20}
              onChange={(e) => updateAgentParameter('top_k', parseInt(e.target.value), true)}
            />
          </div>
          <div>
            <Label htmlFor="edit-min_p">Min P</Label>
            <Input
              id="edit-min_p"
              type="number"
              step="0.1"
              value={editAgentData.llm.parameters?.min_p || 0.0}
              onChange={(e) => updateAgentParameter('min_p', parseFloat(e.target.value), true)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-repeat_penalty">Repeat Penalty</Label>
            <Input
              id="edit-repeat_penalty"
              type="number"
              step="0.1"
              value={editAgentData.llm.parameters?.repeat_penalty || 1.2}
              onChange={(e) => updateAgentParameter('repeat_penalty', parseFloat(e.target.value), true)}
            />
          </div>
          <div>
            <Label htmlFor="edit-presence_penalty">Presence Penalty</Label>
            <Input
              id="edit-presence_penalty"
              type="number"
              step="0.1"
              value={editAgentData.llm.parameters?.presence_penalty || 1.5}
              onChange={(e) => updateAgentParameter('presence_penalty', parseFloat(e.target.value), true)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-frequency_penalty">Frequency Penalty</Label>
            <Input
              id="edit-frequency_penalty"
              type="number"
              step="0.1"
              value={editAgentData.llm.parameters?.frequency_penalty || 1.0}
              onChange={(e) => updateAgentParameter('frequency_penalty', parseFloat(e.target.value), true)}
            />
          </div>
          <div>
            <Label htmlFor="edit-num_predict">Num Predict</Label>
            <Input
              id="edit-num_predict"
              type="number"
              value={editAgentData.llm.parameters?.num_predict || 100}
              onChange={(e) => updateAgentParameter('num_predict', parseInt(e.target.value), true)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-seed">Seed</Label>
            <Input
              id="edit-seed"
              type="number"
              value={editAgentData.llm.parameters?.seed || 42}
              onChange={(e) => updateAgentParameter('seed', parseInt(e.target.value), true)}
            />
          </div>
          <div>
            <Label htmlFor="edit-num_keep">Num Keep</Label>
            <Input
              id="edit-num_keep"
              type="number"
              value={editAgentData.llm.parameters?.num_keep || 5}
              onChange={(e) => updateAgentParameter('num_keep', parseInt(e.target.value), true)}
            />
          </div>
        </div>
      </TabsContent>
      
      {/* Whisper Configuration Tab */}
      <TabsContent value="whisper" className="space-y-4">
        <div>
          <Label htmlFor="edit-whisper.endpoint">Whisper Endpoint</Label>
          <Input
            id="edit-whisper.endpoint"
            value={editAgentData.whisper.endpoint}
            onChange={(e) =>
              setEditAgentData({
                ...editAgentData,
                whisper: { ...editAgentData.whisper, endpoint: e.target.value },
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="edit-whisper.language">Language</Label>
          <Input
            id="edit-whisper.language"
            value={editAgentData.whisper.language}
            onChange={(e) =>
              setEditAgentData({
                ...editAgentData,
                whisper: { ...editAgentData.whisper, language: e.target.value },
              })
            }
          />
        </div>
      </TabsContent>
      
      {/* Auralis Configuration Tab */}
      <TabsContent value="auralis" className="space-y-4">
        <div>
          <Label htmlFor="edit-auralis.endpoint">Auralis Endpoint</Label>
          <Input
            id="edit-auralis.endpoint"
            value={editAgentData.auralis.endpoint}
            onChange={(e) =>
              setEditAgentData({
                ...editAgentData,
                auralis: { ...editAgentData.auralis, endpoint: e.target.value },
              })
            }
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};


const ErrorAlert = ({ error }) => {
  return (
    <Alert variant="destructive" className="m-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};


const ChatPage = () => {
  const {
    agents,
    loading: agentLoading,
    error: agentError,
    fetchAgents
  } = useAgentStore();
  
  const {
    chats,
    activeChat,
    loading: chatLoading,
    error: chatError,
    initializeConnection,
    fetchChats
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    initializeConnection();
    fetchAgents();
    fetchChats();
  }, [initializeConnection, fetchAgents, fetchChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const loading = agentLoading || chatLoading;
  const error = agentError || chatError;

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Chats */}
      <ChatSidebar chats={chats} />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {error && <ErrorAlert error={error} />}
        <ChatMain 
          activeChat={activeChat} 
          messagesEndRef={messagesEndRef} 
          loading={loading} 
        />
      </div>
      
      {/* Right Sidebar - Agents */}
      <AgentSidebar agents={agents} loading={loading} />
    </div>
  );
};


export default ChatPage;