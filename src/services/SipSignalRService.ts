import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";
import { MessageDTO, SipAccountDTO, SipCallDTO } from "./types";

type AccountCallback = (account: SipAccountDTO) => void;
type CallCallback = (call: SipCallDTO) => void;
type MessageCallback = (message: MessageDTO) => void;
type MessageWithChatCallback = (message: MessageDTO, chatId: number) => void;
type VoiceActivityCallback = (callId: number, isActive: boolean) => void;
type MediaStateCallback = (callId: number, state: string) => void;
type NoParamCallback = () => void;
interface CallbackCollections {
    onAccountUpdate: AccountCallback[];
    onAccountListUpdate: AccountCallback[];
    onCallUpdate: CallCallback[];
    onCallListUpdate: CallCallback[];
    onMessageReceived: MessageCallback[];
    onNewMessage: MessageWithChatCallback[];
    onVoiceActivity: VoiceActivityCallback[];
    onMediaStateChange: MediaStateCallback[];
    onConnected: NoParamCallback[];
    onDisconnected: NoParamCallback[];
}


class SipClientSingalRService {
    private connection: signalR.HubConnection | null;
    private callbacks: CallbackCollections;

    constructor() {
        this.connection = null;
        this.callbacks = {
            onAccountUpdate: [],
            onAccountListUpdate: [],
            onCallUpdate: [],
            onCallListUpdate: [],
            onMessageReceived: [],
            onNewMessage: [],
            onVoiceActivity: [],
            onMediaStateChange: [],
            onConnected: [],
            onDisconnected: []
        };
    }

    async connect(): Promise<void> {
        try {
            const baseUrl = window.location.origin;
        
            this.connection = new HubConnectionBuilder()
            .withUrl(`/hubs/sip`)
            .withAutomaticReconnect([0, 2000, 5000, 10000, 15000, 30000]) // Progressive retry strategy
            .configureLogging(LogLevel.Information)
            .build();

            // Set up handlers for incoming notifications
            this.connection.on("AccountUpdate", (account: SipAccountDTO) => {
                this.callbacks.onAccountUpdate.forEach(callback => callback(account));
            });

            this.connection.on("AccountListUpdate", (account: SipAccountDTO) => {
                this.callbacks.onAccountListUpdate.forEach(callback => callback(account));
            });

            this.connection.on("CallUpdate", (call: SipCallDTO) => {
                this.callbacks.onCallUpdate.forEach(callback => callback(call));
            });

            this.connection.on("CallListUpdate", (call: SipCallDTO) => {
                this.callbacks.onCallListUpdate.forEach(callback => callback(call));
            });

            this.connection.on("MessageReceived", (message: MessageDTO) => {
                this.callbacks.onMessageReceived.forEach(callback => callback(message));
            });

            this.connection.on("NewMessage", (message: MessageDTO, chatId: number) => {
                this.callbacks.onNewMessage.forEach(callback => callback(message, chatId));
            });

            this.connection.on("VoiceActivity", (callId: number, isActive: boolean) => {
                this.callbacks.onVoiceActivity.forEach(callback => callback(callId, isActive));
            });

            this.connection.on("MediaStateChange", (callId: number, state: string) => {
                this.callbacks.onMediaStateChange.forEach(callback => callback(callId, state));
            });

            // Set up connection event handlers
            this.connection.onclose(() => {
                this.callbacks.onDisconnected.forEach(callback => callback());
                console.log("SignalR connection closed");
            });

            // Start the connection
            await this.connection.start();
            console.log("SignalR connected");
            this.callbacks.onConnected.forEach(callback => callback());
        } catch (err) {
            console.error("Error establishing SignalR connection:", err);
            throw err;
        }
    }

    // Subscription methods
    subscribeToAccountUpdates(accountId: number): Promise<void> {
        if (!this.connection) throw new Error("Connection not established");
        return this.connection.invoke("SubscribeToAccountUpdates", accountId);
    }

    subscribeToCallUpdates(callId: number): Promise<void> {
        if (!this.connection) throw new Error("Connection not established");
        return this.connection.invoke("SubscribeToCallUpdates", callId);
    }

    joinChatGroup(chatId: number): Promise<void> {
        if (!this.connection) throw new Error("Connection not established");
        return this.connection.invoke("JoinGroup", `chat_${chatId}`);
    }

    // Event registration methods
    onAccountUpdate(callback: AccountCallback): void {
        this.callbacks.onAccountUpdate.push(callback);
    }

    onAccountListUpdate(callback: AccountCallback): void {
        this.callbacks.onAccountListUpdate.push(callback);
    }

    onCallUpdate(callback: CallCallback): void {
        this.callbacks.onCallUpdate.push(callback);
    }

    onCallListUpdate(callback: CallCallback): void {
        this.callbacks.onCallListUpdate.push(callback);
    }

    onMessageReceived(callback: MessageCallback): void {
        this.callbacks.onMessageReceived.push(callback);
    }

    onNewMessage(callback: MessageWithChatCallback): void {
        this.callbacks.onNewMessage.push(callback);
    }

    onVoiceActivity(callback: VoiceActivityCallback): void {
        this.callbacks.onVoiceActivity.push(callback);
    }

    onMediaStateChange(callback: MediaStateCallback): void {
        this.callbacks.onMediaStateChange.push(callback);
    }

    onConnected(callback: NoParamCallback): void {
        this.callbacks.onConnected.push(callback);
    }

    onDisconnected(callback: NoParamCallback): void {
        this.callbacks.onDisconnected.push(callback);
    }

    disconnect(): Promise<void> | undefined {
        if (this.connection) {
            return this.connection.stop();
        }
        return undefined;
    }
}
export { SipClientSingalRService };