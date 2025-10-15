import { useState, useCallback, useRef } from 'react';

interface UseWebRTCProps {
  wsConnection: WebSocket | null;
  onStatusChange?: (status: string) => void;
}

interface UseWebRTCReturn {
  peerConnection: RTCPeerConnection | null;
  setupPeerConnection: () => RTCPeerConnection;
  handleOffer: (offer: RTCSessionDescriptionInit) => Promise<void>;
  handleIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  closePeerConnection: () => void;
}

export const useWebRTC = ({ wsConnection, onStatusChange }: UseWebRTCProps): UseWebRTCReturn => {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const setupPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.ontrack = (event) => {
      console.log('Remote track received');
      if (onStatusChange) {
        onStatusChange('Live');
      }

      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
      } else {
        console.error('Remote video element not found for track received');
      }
    };

    pc.onicecandidate = (event) => {
      console.log('ICE candidate received:', event.candidate);

      if (!event.candidate) return;

      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.send(
          JSON.stringify({
            type: 'candidate',
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
          })
        );
      } else {
        console.warn('WebSocket not available for sending ICE candidate');
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Peer connection state:', pc.connectionState);

      if (onStatusChange) {
        onStatusChange(pc.connectionState);
      }

      if (pc.connectionState === 'connected') {
        const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
        if (remoteVideo) {
          remoteVideo.muted = true;
          remoteVideo.play().catch((err) => console.error('Video play error:', err));
        }
      }
    };

    setPeerConnection(pc);
    peerConnectionRef.current = pc;
    return pc;
  }, [wsConnection, onStatusChange]);

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
          wsConnection.send(JSON.stringify(answerPayload));
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
    [wsConnection, setupPeerConnection, onStatusChange]
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

