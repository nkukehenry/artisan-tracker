import { useState, useCallback, useRef } from 'react';

interface UseWebRTCProps {
  wsConnection: WebSocket | null;
  webClientDeviceId?: string;
  targetDeviceId?: string;
  onStatusChange?: (status: string) => void;
}

interface UseWebRTCReturn {
  peerConnection: RTCPeerConnection | null;
  setupPeerConnection: () => RTCPeerConnection;
  handleOffer: (offer: RTCSessionDescriptionInit) => Promise<void>;
  handleIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  closePeerConnection: () => void;
}

export const useWebRTC = ({ wsConnection, webClientDeviceId, targetDeviceId, onStatusChange }: UseWebRTCProps): UseWebRTCReturn => {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const setupPeerConnection = useCallback(() => {
    // Only create a new peer connection if one doesn't exist or the current one is closed
    if (peerConnectionRef.current && peerConnectionRef.current.connectionState !== 'closed') {
      console.log('Peer connection already exists, reusing it');
      return peerConnectionRef.current;
    }

    console.log('Creating new peer connection');
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.ontrack = (event) => {
      console.log('Remote track received:', event.track.kind);
      console.log('Stream ID:', event.streams[0]?.id);
      console.log('Tracks in stream:', event.streams[0]?.getTracks());

      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      if (!remoteVideo) {
        console.error('Remote video element not found for track received');
        return;
      }

      const handlePlayback = () => {
        try {
          // Handle audio vs video tracks differently
          if (event.track.kind === 'audio') {
            console.log('Audio track received - enabling playback');
            remoteVideo.muted = false; // Unmute for audio
            if (onStatusChange) {
              onStatusChange('Live - Audio streaming');
            }
          } else {
            console.log('Video track received');
            remoteVideo.muted = true;
            if (onStatusChange) {
              onStatusChange('Live');
            }
          }

          // Only set srcObject and play if not already set
          if (remoteVideo.srcObject !== event.streams[0]) {
            remoteVideo.srcObject = event.streams[0];
          }

          // Attempt to play, but don't throw if it fails
          const playPromise = remoteVideo.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => console.log(`${event.track.kind} playback started`))
              .catch(err => {
                if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
                  console.error(`${event.track.kind} play error:`, err);
                }
              });
          }
        } catch (err) {
          console.error('Error in track handler:', err);
        }
      };

      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(handlePlayback);
    };

    pc.onicecandidate = (event) => {
      console.log('ICE candidate received:', event.candidate);

      if (!event.candidate) return;

      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        const candidateMessage = {
          type: 'candidate',
          deviceId: webClientDeviceId,
          targetDeviceId: targetDeviceId,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          sdpMid: event.candidate.sdpMid,
          candidate: event.candidate.candidate,
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
        };
        wsConnection.send(JSON.stringify(candidateMessage));
      } else {
        console.warn('WebSocket not available for sending ICE candidate');
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`=== WebRTC connection state changed: ${pc.connectionState} ===`);
      console.log(`Signaling state: ${pc.signalingState}`);
      console.log(`ICE gathering state: ${pc.iceGatheringState}`);

      if (onStatusChange) {
        onStatusChange(pc.connectionState);
      }

      if (pc.connectionState === 'connected') {
        console.log('=== WebRTC connection established successfully ===');
        // Playback is handled in ontrack handler, don't force play here to avoid interruption
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`=== ICE connection state changed: ${pc.iceConnectionState} ===`);
    };

    pc.onicegatheringstatechange = () => {
      console.log(`=== ICE gathering state changed: ${pc.iceGatheringState} ===`);
    };

    setPeerConnection(pc);
    peerConnectionRef.current = pc;
    return pc;
  }, [wsConnection, webClientDeviceId, targetDeviceId, onStatusChange]);

  const handleOffer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      console.log('Offer received:', offer);
      if (onStatusChange) {
        onStatusChange('offer received');
      }

      const pc = peerConnectionRef.current || setupPeerConnection();

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();

        const answerPayload = {
          type: answer.type,
          sdp: answer.sdp,
        };

        console.log('Answer created:', answerPayload);
        await pc.setLocalDescription(answer);

        if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
          const answerMessage = {
            ...answerPayload,
            type: 'answer',
            deviceId: webClientDeviceId,
            targetDeviceId: targetDeviceId,
          };
          wsConnection.send(JSON.stringify(answerMessage));
          if (onStatusChange) {
            onStatusChange('Waiting for stream...');
          }
        }
      } catch (error) {
        console.error('Error handling offer:', error);
        if (onStatusChange) {
          onStatusChange('error');
        }
      }
    },
    [wsConnection, webClientDeviceId, targetDeviceId, setupPeerConnection, onStatusChange]
  );

  const handleIceCandidate = useCallback(
    async (candidateMessage: RTCIceCandidateInit | { candidate: string; label: number; id: string }) => {
      const pc = peerConnectionRef.current;
      if (!pc) {
        console.warn('Peer connection not available for ICE candidate');
        return;
      }

      try {
        let candidate: RTCIceCandidate;

        // Handle different candidate message formats
        if ('label' in candidateMessage && 'id' in candidateMessage) {
          const candidateInit = {
            sdpMLineIndex: candidateMessage.label,
            sdpMid: candidateMessage.id,
            candidate: candidateMessage.candidate,
          };
          candidate = new RTCIceCandidate(candidateInit);
        } else {
          candidate = new RTCIceCandidate(candidateMessage as RTCIceCandidateInit);
        }

        await pc.addIceCandidate(candidate);
        if (onStatusChange) {
          onStatusChange('Connected');
        }
        console.log('Remote candidate added');
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    },
    [onStatusChange]
  );

  const closePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      setPeerConnection(null);
    }
  }, []);

  return {
    peerConnection,
    setupPeerConnection,
    handleOffer,
    handleIceCandidate,
    closePeerConnection,
  };
};

