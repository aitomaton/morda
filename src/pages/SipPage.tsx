import { useState, useEffect } from 'react';
import { Phone, PhoneOff, User, Plus, Trash2, Headphones, Mic } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import useSipStore from '../stores/sipStore';
import useAgentStore from '../stores/agentStore';
import { CreateSipAccountDTO } from '../services/types';

const SipPage = () => {
  const {
    sipAccounts,
    activeCalls,
    loading,
    error,
    signalRConnected,
    initializeConnection,
    registerAccount,
    makeCall,
    hangupCall,
    deleteAccount,
    updateAccountAgent,
    reRegisterAllAccounts
  } = useSipStore();

  const { agents, fetchAgents } = useAgentStore();

  // States for creating a new account
  const [newAccountData, setNewAccountData] = useState<CreateSipAccountDTO>({
    username: '',
    password: '',
    domain: '',
    registrarUri: '',
    agentConfigId: 0,
  });

  // State for dialing
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [dialNumber, setDialNumber] = useState<string>('');

  // State for managing agent assignment
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

  useEffect(() => {
    // Initialize the connection to the SIP service
    initializeConnection();
    
    // Fetch agents
    fetchAgents();
  }, [initializeConnection, fetchAgents]);

  // Function to handle creating a new account
  const handleCreateAccount = async () => {
    await registerAccount(newAccountData);
    
    // Reset the form after submission
    setNewAccountData({
      username: '',
      password: '',
      domain: '',
      registrarUri: '',
      agentConfigId: 0,
    });
  };

  // Function to handle input changes for new account
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAccountData(prev => ({ ...prev, [name]: value }));
  };

  // Function to handle making a call
  const handleMakeCall = async () => {
    if (selectedAccountId && dialNumber) {
      await makeCall(selectedAccountId, dialNumber);
      setDialNumber('');
    }
  };

  // Function to handle hanging up a call
  const handleHangupCall = async (callId: number) => {
    await hangupCall(callId);
  };

  // Function to handle assigning an agent to an account
  const handleAssignAgent = async (accountId: string) => {
    if (selectedAgentId !== null) {
      await updateAccountAgent(accountId, selectedAgentId);
      setSelectedAgentId(null);
    }
  };

  // Function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'registered': return 'bg-green-500';
      case 'registering': return 'bg-yellow-500';
      case 'not registered': return 'bg-red-500';
      case 'unregistering': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Function to get call status badge color
  const getCallStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': case 'confirmed': return 'bg-green-500';
      case 'connecting': case 'calling': return 'bg-blue-500';
      case 'hold': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">SIP Management</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>SIP Connection</CardTitle>
              <CardDescription>
                Status: {signalRConnected ? (
                  <Badge variant="default" className="bg-green-500">Connected</Badge>
                ) : (
                  <Badge variant="default" className="bg-red-500">Disconnected</Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Account</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Register New SIP Account</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">Username</Label>
                        <Input
                          id="username"
                          name="username"
                          value={newAccountData.username}
                          onChange={handleInputChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={newAccountData.password}
                          onChange={handleInputChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="domain" className="text-right">Domain</Label>
                        <Input
                          id="domain"
                          name="domain"
                          value={newAccountData.domain}
                          onChange={handleInputChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="registrarUri" className="text-right">Registrar URI</Label>
                        <Input
                          id="registrarUri"
                          name="registrarUri"
                          value={newAccountData.registrarUri}
                          onChange={handleInputChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="agentConfigId" className="text-right">Agent</Label>
                        <Select
                          onValueChange={(value) => setNewAccountData({...newAccountData, agentConfigId: Number(value)})}
                          value={newAccountData.agentConfigId ? newAccountData.agentConfigId.toString() : ''}
                        >
                          <SelectTrigger id="agentConfigId" className="col-span-3">
                            <SelectValue placeholder="Select agent" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(agents) ? agents.map((agent) => (
                              <SelectItem key={agent.id} value={agent.id.toString()}>
                                {agent.name}
                              </SelectItem>
                            )) : <SelectItem value="0">No agents available</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateAccount} disabled={loading}>
                        Register Account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button onClick={reRegisterAllAccounts} variant="outline" className="w-full">
                  Re-Register All Accounts
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Make a Call</CardTitle>
              <CardDescription>Select an account and enter the number to call</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="accountSelect">Account</Label>
                  <Select
                    onValueChange={(value) => setSelectedAccountId(value)}
                    value={selectedAccountId}
                  >
                    <SelectTrigger id="accountSelect">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {sipAccounts.map((account) => (
                        <SelectItem key={account.accountId} value={account.accountId}>
                          {account.username}@{account.domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="dialNumber">Number to Call</Label>
                  <div className="flex gap-2">
                    <Input
                      id="dialNumber"
                      value={dialNumber}
                      onChange={(e) => setDialNumber(e.target.value)}
                      placeholder="Enter number or SIP URI"
                    />
                    <Button onClick={handleMakeCall} disabled={!selectedAccountId || !dialNumber || loading}>
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Tabs defaultValue="accounts">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="accounts">SIP Accounts</TabsTrigger>
              <TabsTrigger value="calls">Active Calls</TabsTrigger>
            </TabsList>
            
            <TabsContent value="accounts" className="space-y-4">
              {sipAccounts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No SIP accounts registered</p>
                  </CardContent>
                </Card>
              ) : (
                sipAccounts.map((account) => (
                  <Card key={account.accountId}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>{account.username}@{account.domain}</CardTitle>
                        <Badge
                          variant="default"
                          className={getStatusBadgeColor(account.isActive ? 'registered' : 'not registered')}
                        >
                          {account.isActive ? 'Registered' : 'Not Registered'}
                        </Badge>
                      </div>
                      <CardDescription>{account.registrarUri}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Username:</span>
                          <span>{account.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Domain:</span>
                          <span>{account.domain}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Agent:</span>
                          <span>
                            {account.agentName || 'No agent assigned'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <User className="mr-2 h-4 w-4" /> Assign Agent
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Agent to Account</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <Label htmlFor="agentSelect">Select Agent</Label>
                            <Select
                              onValueChange={(value) => setSelectedAgentId(Number(value))}
                              value={selectedAgentId?.toString() || ''}
                            >
                              <SelectTrigger id="agentSelect">
                                <SelectValue placeholder="Select agent" />
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
                          <DialogFooter>
                            <Button 
                              onClick={() => handleAssignAgent(account.accountId)}
                              disabled={selectedAgentId === null || loading}
                            >
                              Assign Agent
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteAccount(account.accountId)}
                        disabled={loading}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="calls" className="space-y-4">
              {activeCalls.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No active calls</p>
                  </CardContent>
                </Card>
              ) : (
                activeCalls.map((call) => {
                  const account = sipAccounts.find(a => a.accountId === call.accountId);
                  return (
                    <Card key={call.callId}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>
                            Call with {call.remoteUri}
                          </CardTitle>
                          <Badge 
                            variant="default" 
                            className={getCallStatusBadgeColor(call.status)}
                          >
                            {call.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          From: {account ? account.username : 'Unknown'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Call ID:</span>
                            <span>{call.callId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Started:</span>
                            <span>{new Date(call.startedAt).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button 
                              variant={'outline'} 
                              size="sm" 
                              className="flex-1"
                              disabled={true} // This would require a mute function
                            >
                              <Mic className="mr-2 h-4 w-4" />
                              Mute
                            </Button>
                            <Button 
                              variant={'outline'} 
                              size="sm" 
                              className="flex-1"
                              disabled={true} // This would require a hold function
                            >
                              <Headphones className="mr-2 h-4 w-4" />
                              Hold
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={() => handleHangupCall(call.callId)}
                          disabled={loading}
                        >
                          <PhoneOff className="mr-2 h-4 w-4" /> Hang Up
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SipPage;
