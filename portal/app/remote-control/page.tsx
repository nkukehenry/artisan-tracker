'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { Monitor, Square, RefreshCw, Volume2, AlertCircle } from 'lucide-react';
import { useDeviceContext } from '@/contexts/DeviceContext';
import { useWebSocketContext, useWebSocketMessage } from '@/contexts/WebSocketContext';

interface ConnectedDevice {
    deviceId: string;
    channel: string;
    platform: string;
    connectedAt: number;
    isActive: boolean;
}

interface WebSocketMessage {
    type?: string;
    message?: string;
    deviceId?: string;
    data?: { channel?: string };
    error?: string;
    devices?: ConnectedDevice[];
    sdp?: string;
    label?: number;
    id?: string;
    candidate?: string;
    action?: string;
}

export default function RemoteControlPage() {
    const [status, setStatus] = useState('Disconnected');
    const [isRegistered, setIsRegistered] = useState(false);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [deviceChannel, setDeviceChannel] = useState<string | null>(null);
    const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const [streamingActive, setStreamingActive] = useState(false);

    // Use global device context
    const { selectedDevice } = useDeviceContext();

    // Use WebSocket context
    const { isConnected, connect: connectWebSocket, sendMessage } = useWebSocketContext();

    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const remoteDeviceIdRef = useRef<string | null>(null); // Track the remote device we're connecting to
    const pendingCandidatesRef = useRef<Array<{ label?: number; id?: string; candidate?: string }>>([]); // Buffer candidates until remote description is set

    // Generate or retrieve web client device ID
    const getWebClientDeviceId = useCallback(() => {
        if (typeof window === 'undefined') return 'web_client';

        let deviceId = sessionStorage.getItem('web_client_device_id');
        if (!deviceId) {
            // Generate a unique ID for this web client session
            deviceId = `web_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
            sessionStorage.setItem('web_client_device_id', deviceId);
        }
        return deviceId;
    }, []);

    // Update status with type
    const updateStatus = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
        console.log(`[${type.toUpperCase()}] ${message}`);
        setStatus(message);
    }, []);

    // Setup peer connection
    const setupPeer = useCallback(() => {
        if (peerConnection && peerConnection.connectionState !== 'closed') {
            console.log('Peer connection already exists, reusing it');
            return peerConnection;
        }

        console.log('Creating new peer connection');
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        pc.ontrack = (ev) => {
            updateStatus('Remote track received', 'success');
            console.log('Received track:', ev.track.kind);

            if (!remoteVideoRef.current) return;

            if (ev.track.kind === 'audio') {
                console.log('Audio track received - enabling playback');
                console.log('Audio track details:', {
                    id: ev.track.id,
                    label: ev.track.label,
                    enabled: ev.track.enabled,
                    readyState: ev.track.readyState,
                    streamId: ev.streams[0]?.id
                });
                remoteVideoRef.current.srcObject = ev.streams[0];
                remoteVideoRef.current.muted = false;
                remoteVideoRef.current.volume = 1.0;
                remoteVideoRef.current.play().then(() => {
                    console.log('Audio playback started successfully');
                    console.log('Video element state:', {
                        paused: remoteVideoRef.current?.paused,
                        muted: remoteVideoRef.current?.muted,
                        volume: remoteVideoRef.current?.volume,
                        readyState: remoteVideoRef.current?.readyState,
                        currentTime: remoteVideoRef.current?.currentTime
                    });
                    updateStatus('Audio streaming active', 'success');
                    setStreamingActive(true);
                }).catch((err) => {
                    console.error('Error starting audio playback:', err);
                    updateStatus(`Audio playback error: ${err.message}`, 'error');
                });
            } else {
                remoteVideoRef.current.srcObject = ev.streams[0];
                remoteVideoRef.current.muted = true;
                remoteVideoRef.current.play().catch((err) => console.error('Video play error:', err));
                setStreamingActive(true);
            }
        };

        pc.onicecandidate = (ev) => {
            if (!ev.candidate || !deviceId) return;

            // Send ICE candidate to the remote device (if we know who we're connecting to)
            const targetDeviceId = remoteDeviceIdRef.current || selectedDevice?.deviceId;
            const candidateMessage: Record<string, unknown> = {
                type: 'candidate',
                label: ev.candidate.sdpMLineIndex,
                id: ev.candidate.sdpMid,
                candidate: ev.candidate.candidate,
                deviceId: deviceId,
            };

            // Include targetDeviceId if we know the remote device
            if (targetDeviceId) {
                candidateMessage.targetDeviceId = targetDeviceId;
            }

            const sent = sendMessage(candidateMessage);
            if (!sent) {
                updateStatus('Cannot send ICE candidate: WebSocket not open', 'error');
            }
        };

        pc.onconnectionstatechange = () => {
            console.log(`=== WebRTC connection state changed: ${pc.connectionState} ===`);
            updateStatus(`WebRTC: ${pc.connectionState}`, 'info');

            if (pc.connectionState === 'connected') {
                console.log('=== WebRTC connection established successfully ===');
            } else if (pc.connectionState === 'failed') {
                console.error('=== WebRTC connection failed ===');
                updateStatus('WebRTC connection failed', 'error');
            } else if (pc.connectionState === 'disconnected') {
                console.warn('=== WebRTC connection disconnected ===');
                updateStatus('WebRTC disconnected', 'warning');
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log(`=== ICE connection state changed: ${pc.iceConnectionState} ===`);
            if (pc.iceConnectionState === 'connected') {
                console.log('=== ICE connection established ===');
            } else if (pc.iceConnectionState === 'failed') {
                console.error('=== ICE connection failed ===');
                updateStatus('ICE connection failed', 'error');
            } else if (pc.iceConnectionState === 'disconnected') {
                console.warn('=== ICE connection disconnected ===');
            }
        };

        setPeerConnection(pc);
        peerConnectionRef.current = pc;
        return pc;
    }, [deviceId, peerConnection, updateStatus, sendMessage, selectedDevice]);

    // WebRTC offer handler
    const handleWebRTCOffer = useCallback((msg: WebSocketMessage & RTCSessionDescriptionInit) => {
        updateStatus('WebRTC offer received', 'info');

        // Extract the sender's deviceId - this is who we need to send the answer to
        const offerSenderDeviceId = msg.deviceId;

        // Check if this message is from our own deviceId (shouldn't happen, but prevent loops)
        if (offerSenderDeviceId === deviceId) {
            console.warn('Received offer from own deviceId, ignoring to prevent loop');
            return;
        }

        if (!offerSenderDeviceId) {
            console.error('Offer missing sender deviceId, cannot send answer');
            updateStatus('Offer missing sender device ID', 'error');
            return;
        }

        // Store the remote device ID for ICE candidates and future messages
        remoteDeviceIdRef.current = offerSenderDeviceId;

        let pc = peerConnectionRef.current;

        // If peer connection doesn't exist or is closed, create a new one
        if (!pc || pc.signalingState === 'closed') {
            pc = setupPeer();
        }

        if (!pc) {
            console.error('Peer connection not available');
            updateStatus('Cannot handle offer - no peer connection', 'error');
            return;
        }

        // Check connection state - only handle offer if in stable state
        // If we're in have-local-offer, we've already sent an answer, so ignore this offer
        const currentState = pc.signalingState;
        console.log('Current signaling state before handling offer:', currentState);

        if (currentState === 'have-local-offer' || currentState === 'have-remote-pranswer') {
            console.warn(`Cannot handle offer: connection already has local offer in ${currentState} state. Ignoring duplicate offer.`);
            updateStatus('Ignoring duplicate offer', 'warning');
            return;
        }

        if (currentState !== 'stable') {
            console.warn(`Cannot handle offer: connection is in ${currentState} state. Resetting connection.`);
            // Close and recreate peer connection if in wrong state
            pc.close();
            pc = setupPeer();
            if (!pc) {
                updateStatus('Failed to recreate peer connection', 'error');
                return;
            }
        }

        pc.setRemoteDescription(new RTCSessionDescription(msg))
            .then(() => {
                console.log('Remote description set successfully, creating answer');

                // Add any pending candidates now that remote description is set
                const pending = pendingCandidatesRef.current;
                console.log(`Adding ${pending.length} pending ICE candidates`);
                pending.forEach((candidateData: { label?: number; id?: string; candidate?: string }) => {
                    if (candidateData.label !== undefined && candidateData.id && candidateData.candidate) {
                        const candidate = new RTCIceCandidate({
                            sdpMLineIndex: candidateData.label,
                            sdpMid: candidateData.id,
                            candidate: candidateData.candidate,
                        });
                        pc.addIceCandidate(candidate).catch((err) => {
                            console.error('Error adding pending candidate:', err);
                        });
                    }
                });
                pendingCandidatesRef.current = []; // Clear the buffer

                return pc.createAnswer();
            })
            .then((answer) => {
                console.log('Answer created successfully');
                if (!deviceId) {
                    updateStatus('Device not registered for WebRTC', 'error');
                    return;
                }

                // Send answer message with targetDeviceId to route to the correct Android device
                const answerPayload = {
                    type: answer.type,
                    sdp: answer.sdp,
                    deviceId: deviceId,
                    targetDeviceId: offerSenderDeviceId, // Route answer back to the device that sent the offer
                };

                console.log('Setting local description and sending answer to:', offerSenderDeviceId);
                pc.setLocalDescription(answer);
                const sent = sendMessage(answerPayload);
                if (!sent) {
                    updateStatus('Cannot send answer: WebSocket not open', 'error');
                }
            })
            .catch((error) => {
                console.error('Error handling offer:', error);
                updateStatus(`Error handling WebRTC offer: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
            });
    }, [deviceId, setupPeer, sendMessage, updateStatus]);

    // WebRTC answer handler
    // Note: Web client acts as answerer, so it shouldn't normally receive answers.
    // However, we handle it gracefully in case of edge cases.
    const handleWebRTCAnswer = useCallback((msg: WebSocketMessage & RTCSessionDescriptionInit) => {
        const pc = peerConnectionRef.current;
        if (!pc) {
            console.warn('Peer connection not available for answer, ignoring');
            return;
        }

        // Check if this message is from our own deviceId (shouldn't happen, but prevent loops)
        if (msg.deviceId === deviceId) {
            console.warn('Received answer from own deviceId, ignoring to prevent loop');
            return;
        }

        // Check connection state - only handle answer if we have a local offer
        const currentState = pc.signalingState;
        console.log('Handling WebRTC answer, current signaling state:', currentState);

        // Web client acts as answerer, so it shouldn't receive answers unless it somehow became the offerer
        // We should only receive answers when we're in "have-local-offer" state (we sent an offer)
        if (currentState !== 'have-local-offer' && currentState !== 'have-remote-pranswer') {
            console.warn(`Cannot handle answer: connection is in ${currentState} state. Web client acts as answerer, not offerer. Ignoring answer.`);
            // Silently ignore since this is expected behavior (we're not the offerer)
            return;
        }

        console.log('Setting remote answer description');
        pc.setRemoteDescription(new RTCSessionDescription(msg))
            .then(() => {
                console.log('Remote answer set successfully');
                updateStatus('WebRTC answer applied', 'success');
            })
            .catch((error) => {
                console.error('Error handling answer:', error);
                // Check if error is due to wrong state
                if (error instanceof Error && error.message.includes('wrong state')) {
                    console.warn('Answer state conflict, ignoring:', error.message);
                    return;
                }
                updateStatus(`Error handling WebRTC answer: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
            });
    }, [deviceId, updateStatus]);

    // WebRTC candidate handler
    const handleWebRTCCandidate = useCallback((msg: WebSocketMessage) => {
        const pc = peerConnectionRef.current;
        if (!pc) {
            // Peer connection doesn't exist yet - buffer the candidate
            console.log('Peer connection not ready, buffering ICE candidate');
            if (msg.label !== undefined && msg.id && msg.candidate) {
                pendingCandidatesRef.current.push({
                    label: msg.label,
                    id: msg.id,
                    candidate: msg.candidate,
                });
            }
            return;
        }

        // Check if remote description is set - if not, buffer the candidate
        if (!pc.remoteDescription) {
            console.log('Remote description not set yet, buffering ICE candidate');
            if (msg.label !== undefined && msg.id && msg.candidate) {
                pendingCandidatesRef.current.push({
                    label: msg.label,
                    id: msg.id,
                    candidate: msg.candidate,
                });
            }
            return;
        }

        try {
            // Check for required fields (label can be 0, so check for undefined/null explicitly)
            if (msg.label === undefined || msg.label === null || !msg.id || !msg.candidate) {
                console.warn('ICE candidate missing required fields:', {
                    label: msg.label,
                    id: msg.id,
                    candidate: !!msg.candidate
                });
                return;
            }
            const candidate = new RTCIceCandidate({
                sdpMLineIndex: msg.label,
                sdpMid: msg.id,
                candidate: msg.candidate,
            });

            pc.addIceCandidate(candidate)
                .then(() => {
                    console.log('ICE candidate added successfully');
                })
                .catch((error) => {
                    console.error('Error adding ICE candidate:', error);
                });
        } catch (error) {
            console.error('Error creating ICE candidate:', error);
        }
    }, []);

    // Handle WebSocket messages
    const handleWebSocketMessage = useCallback((message: unknown) => {
        const msg = message as WebSocketMessage;
        console.log('Received message:', msg);
        console.log('Message type:', msg.type, 'Message keys:', Object.keys(msg));

        switch (msg.type) {
            case 'success':
                console.log('Success message received:', {
                    message: msg.message,
                    deviceId: msg.deviceId,
                    hasData: !!msg.data,
                    data: msg.data
                });
                // Check if this is a registration success message
                // Backend sends: { type: 'success', message: 'Device registered successfully', deviceId, data: { channel, deviceId } }
                if (msg.message && (msg.message.includes('registered') || msg.message.includes('Registration'))) {
                    console.log('Registration detected in message, setting isRegistered to true');
                    setIsRegistered(true);
                    setDeviceId(msg.deviceId || null);
                    setDeviceChannel(msg.data?.channel || null);
                    updateStatus(`Device registered: ${msg.deviceId}`, 'success');
                } else if (msg.deviceId && msg.data?.channel) {
                    // Fallback: if we have deviceId and channel in success message, assume it's registration
                    console.log('Registration detected via deviceId/channel presence, setting isRegistered to true');
                    setIsRegistered(true);
                    setDeviceId(msg.deviceId);
                    setDeviceChannel(msg.data.channel);
                    updateStatus(`Device registered: ${msg.deviceId}`, 'success');
                } else {
                    console.log('Success message does not appear to be a registration response');
                }
                break;

            case 'error':
                updateStatus(`Error: ${msg.error}`, 'error');
                break;

            case 'server_message':
                if (msg.action) {
                    updateStatus(`Server action: ${msg.action}`, 'info');
                }
                break;

            case 'server_response':
                // This is a confirmation that our message was routed
                console.log('Server response received:', msg);
                if (msg.action) {
                    updateStatus(`Action ${msg.action} routed successfully`, 'success');
                }
                break;

            case 'connected_devices':
                setConnectedDevices(msg.devices || []);
                break;

            case 'offer':
                console.log('=== OFFER RECEIVED ===', msg);
                console.log('Offer has sdp:', !!msg.sdp);
                // Handle both message formats: {type: 'offer', sdp: '...'} and {type: 'offer', offer: {sdp: '...'}}
                const offerMsg = msg as WebSocketMessage & RTCSessionDescriptionInit;
                const msgWithOffer = msg as { offer?: { sdp?: string; type?: string } };
                if (!offerMsg.sdp && msgWithOffer.offer?.sdp) {
                    // Android might send offer nested in 'offer' property
                    offerMsg.sdp = msgWithOffer.offer.sdp;
                    offerMsg.type = (msgWithOffer.offer.type || 'offer') as RTCSdpType;
                    console.log('Extracted offer from nested structure');
                }
                handleWebRTCOffer(offerMsg);
                break;

            case 'answer':
                console.log('=== ANSWER RECEIVED ===', msg);
                handleWebRTCAnswer(msg as WebSocketMessage & RTCSessionDescriptionInit);
                break;

            case 'candidate':
                console.log('=== CANDIDATE RECEIVED ===', msg);
                handleWebRTCCandidate(msg);
                break;

            default:
                console.log('Unknown message type:', msg.type);
        }
    }, [updateStatus, handleWebRTCOffer, handleWebRTCAnswer, handleWebRTCCandidate]);

    // Set up WebSocket message listener
    useWebSocketMessage(handleWebSocketMessage);

    // Register web client explicitly
    const registerWebClient = useCallback(() => {
        if (!isConnected) {
            console.log('Cannot register: WebSocket not connected');
            return;
        }

        const webClientDeviceId = getWebClientDeviceId();
        console.log('Registering web client with device ID:', webClientDeviceId);

        const registrationMessage = {
            type: 'device_registration',
            deviceId: webClientDeviceId,
            deviceInfo: {
                deviceId: webClientDeviceId,
                platform: 'web',
                timestamp: Date.now(),
            }
        };

        const sent = sendMessage(registrationMessage);
        if (sent) {
            console.log('Registration message sent successfully');
            updateStatus('Registering web client...', 'info');
        } else {
            console.error('Failed to send registration message');
            updateStatus('Failed to send registration message', 'error');
        }
    }, [isConnected, getWebClientDeviceId, sendMessage, updateStatus]);

    // Handle connection status changes
    useEffect(() => {
        if (isConnected) {
            updateStatus('Connected to signaling server', 'success');
            // Registration happens automatically in WebSocketContext on connect
            // But we'll also trigger explicit registration as a fallback
            registerWebClient();

            // Give it a moment, then check if we got registered
            const checkRegistration = setTimeout(() => {
                if (!isRegistered && isConnected) {
                    console.log('Not registered after 2 seconds, retrying registration...');
                    // Retry registration if we didn't get a response
                    registerWebClient();
                }
            }, 2000);
            return () => clearTimeout(checkRegistration);
        } else {
            updateStatus('Disconnected', 'warning');
            setIsRegistered(false);
            setDeviceId(null);
            setDeviceChannel(null);
        }
    }, [isConnected, isRegistered, registerWebClient, updateStatus]);

    // Manual disconnect function (optional, not currently used)
    // const disconnect = useCallback(() => {
    //   if (wsConnectionRef.current) {
    //     wsConnectionRef.current.close();
    //     setWsConnection(null);
    //     wsConnectionRef.current = null;
    //   }
    //   setIsConnected(false);
    //   setIsRegistered(false);
    //   setDeviceId(null);
    //   setDeviceChannel(null);
    //   if (peerConnectionRef.current) {
    //     peerConnectionRef.current.close();
    //     setPeerConnection(null);
    //     peerConnectionRef.current = null;
    //   }
    // }, []);

    // Action sending
    const sendAction = useCallback((
        action: string,
        duration: number | null = null,
        payload: unknown = null,
        targetDeviceId: string | null = null,
        targetChannel: string | null = null
    ) => {
        if (!deviceId) {
            updateStatus('Device not registered', 'error');
            return;
        }

        const clientMessage: Record<string, unknown> = {
            type: 'client-message',
            deviceId: deviceId,
            action: action,
            timestamp: Date.now(),
        };

        if (duration !== null) clientMessage.duration = duration;
        if (payload) clientMessage.payload = payload;
        if (targetDeviceId) clientMessage.targetDeviceId = targetDeviceId;
        if (targetChannel) clientMessage.targetChannel = targetChannel;

        const sent = sendMessage(clientMessage);
        if (sent) {
            const routingInfo = targetDeviceId
                ? ` to device ${targetDeviceId}`
                : targetChannel
                    ? ` to channel ${targetChannel}`
                    : ' to all Android devices';
            updateStatus(`Sent action: ${action}${routingInfo}`, 'info');
        } else {
            updateStatus('Cannot send: WebSocket not open', 'error');
        }
    }, [deviceId, sendMessage, updateStatus]);

    // Request connected devices list
    const requestConnectedDevices = useCallback(() => {
        if (isConnected && deviceId) {
            const sent = sendMessage({
                type: 'get_connected_devices',
                deviceId: deviceId,
                timestamp: Date.now(),
            });
            if (!sent) {
                updateStatus('Cannot request devices: WebSocket not open', 'error');
            }
        }
    }, [isConnected, deviceId, sendMessage, updateStatus]);

    // Auto-connect on mount - only run once
    useEffect(() => {
        connectWebSocket();

        return () => {
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    // Refresh devices every 5 seconds when connected
    useEffect(() => {
        if (isConnected && isRegistered && deviceId) {
            requestConnectedDevices();
            const interval = setInterval(requestConnectedDevices, 5000);
            return () => clearInterval(interval);
        }
    }, [isConnected, isRegistered, deviceId, requestConnectedDevices]);

    const getStatusColor = () => {
        if (status.toLowerCase().includes('error')) return 'text-red-600 bg-red-50';
        if (status.toLowerCase().includes('success') || status.toLowerCase().includes('live') || status.toLowerCase().includes('connected')) return 'text-green-600 bg-green-50';
        if (status.toLowerCase().includes('warning')) return 'text-yellow-600 bg-yellow-50';
        return 'text-blue-600 bg-blue-50';
    };

    const handleStream = (action: 'stream_audio' | 'stream_video') => {
        const duration = 30;
        const targetId = selectedDevice?.deviceId || null;
        sendAction(action, duration, null, targetId);
    };

    const handleStopStream = () => {
        setStreamingActive(false);
        sendAction('stop_streaming');
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            setPeerConnection(null);
            peerConnectionRef.current = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
        // Clear remote device ID reference
        remoteDeviceIdRef.current = null;
    };

    return (
        <AuthWrapper>
            <Layout>
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Android Device Controller</h1>
                        <p className="text-gray-600">Control and monitor Android devices remotely</p>
                    </div>

                    {/* Status Card */}
                    <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">Status: {status}</span>
                        </div>
                    </div>

                    {/* Video Section */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Live Stream</h2>
                            <p className="text-sm text-gray-600">Real-time audio/video feed from device</p>
                        </div>
                        <div className="p-6">
                            <video
                                ref={remoteVideoRef}
                                id="remoteVideo"
                                autoPlay
                                playsInline
                                controls
                                className="w-full max-w-2xl h-64 bg-black rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Stream Controls</h2>
                            <p className="text-sm text-gray-600">Start or stop streaming from devices</p>
                        </div>
                        <div className="p-6 flex flex-wrap gap-4">
                            <button
                                onClick={() => handleStream('stream_audio')}
                                disabled={!isConnected || !isRegistered}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Volume2 className="h-5 w-5" />
                                Stream Audio
                            </button>
                            <button
                                onClick={() => handleStream('stream_video')}
                                disabled={!isConnected || !isRegistered}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Monitor className="h-5 w-5" />
                                Stream Video
                            </button>
                            <button
                                onClick={handleStopStream}
                                disabled={!isConnected || !isRegistered || !streamingActive}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Square className="h-5 w-5" />
                                Stop Stream
                            </button>
                            <button
                                onClick={requestConnectedDevices}
                                disabled={!isConnected || !isRegistered}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <RefreshCw className="h-5 w-5" />
                                Refresh Devices
                            </button>
                        </div>
                    </div>

                    {/* Web Client Device Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Web Client Connection</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Device ID:</span>
                                <span className="font-mono text-gray-900">{deviceId || 'Not connected'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Channel:</span>
                                <span className="font-mono text-gray-900">{deviceChannel || 'Not registered'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Connection:</span>
                                <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                                    {isConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Registration:</span>
                                <span className={`font-medium ${isRegistered ? 'text-green-600' : 'text-red-600'}`}>
                                    {isRegistered ? 'Registered' : 'Not registered'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* WebSocket Connected Devices */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">WebSocket Connected Devices ({connectedDevices.length})</h3>
                        <p className="text-sm text-gray-600 mb-4">These are devices currently connected via WebSocket signaling</p>
                        {connectedDevices.length === 0 ? (
                            <p className="text-gray-500">No devices connected via WebSocket</p>
                        ) : (
                            <div className="space-y-2">
                                {connectedDevices.map((device) => {
                                    const deviceType = device.deviceId.startsWith('web_') ? 'Web Client' : 'Android Device';
                                    return (
                                        <div
                                            key={device.deviceId}
                                            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="font-mono text-sm text-gray-900">{device.deviceId}</div>
                                            <div className="text-xs text-gray-600">
                                                {deviceType} • {device.channel}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Message Routing Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">How It Works</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• <strong>1.</strong> Select a device from the dropdown above</li>
                            <li>• <strong>2.</strong> Click Stream Audio or Stream Video to start streaming from that device</li>
                            <li>• <strong>3.</strong> Click Stop Stream to stop the stream</li>
                            <li>• <strong>Note:</strong> If no device is selected, commands will be broadcast to all connected Android devices</li>
                        </ul>
                    </div>
                </div>
            </Layout>
        </AuthWrapper>
    );
}
