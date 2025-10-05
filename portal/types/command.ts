export type CommandType = 
  | 'RECORD_AUDIO' 
  | 'RECORD_VIDEO' 
  | 'SCREEN_RECORDING' 
  | 'TAKE_PHOTO' 
  | 'GET_LOCATION' 
  | 'GET_CONTACTS' 
  | 'GET_CALL_LOGS' 
  | 'GET_MESSAGES' 
  | 'ENABLE_APP' 
  | 'DISABLE_APP' 
  | 'RESTART_DEVICE' 
  | 'WIPE_DATA';

export type CommandStatus = 
  | 'PENDING' 
  | 'SENT' 
  | 'EXECUTED' 
  | 'FAILED' 
  | 'CANCELLED';

export interface DeviceCommand {
  id: string;
  command: CommandType;
  payload?: any;
  status: CommandStatus;
  sentAt: string;
  executedAt: string | null;
  response: any;
  createdAt: string;
  updatedAt: string;
  deviceId: string;
}

export interface SendCommandData {
  action: string;
  type: string;
  deviceId: string;
  duration?: number;
  timestamp?: number;
}

export interface WebSocketMessage {
  type: 'connected' | 'offer' | 'answer' | 'ice-candidate' | 'screen-share-start' | 'screen-share-stop' | 'command-response';
  data?: any;
  timestamp?: string;
  message?: string;
  clientsCount?: number;
}

export interface ScreenShareState {
  isActive: boolean;
  isConnecting: boolean;
  error: string | null;
  stream: MediaStream | null;
}
