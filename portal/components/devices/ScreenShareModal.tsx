'use client';

import { X, Monitor } from 'lucide-react';

interface ScreenShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceName?: string;
  deviceId: string;
  screenShareStatus: string;
  isConnected: boolean;
}

export default function ScreenShareModal({
  isOpen,
  onClose,
  deviceName,
  deviceId,
  screenShareStatus,
  isConnected,
}: ScreenShareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ width: '50vh', height: '90vh' }}>
        {/* Phone Header */}
        <div className="bg-gray-900 text-white p-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-sm font-medium truncate">{deviceName}</h3>
            <p className="text-xs text-gray-300">Screen Live View</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Phone Screen - Full Height Video */}
        <div className="bg-black relative flex-1">
          <video
            id="remoteVideo"
            autoPlay
            playsInline
            controls
            className="w-full h-full object-cover"
          >
            Your browser does not support the video.
          </video>
          
          {/* Status Overlay */}
          <div className="absolute top-3 left-3 right-3 z-10">
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  screenShareStatus === 'connected' ? 'bg-green-500' :
                  screenShareStatus === 'waiting for offer' ? 'bg-yellow-500' :
                  screenShareStatus === 'error' ? 'bg-red-500' :
                  screenShareStatus === 'connecting...' ? 'bg-blue-500' :
                  screenShareStatus === 'connected - waiting for offer' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}></div>
                <span className="text-xs text-white font-medium">
                  {screenShareStatus === 'connected' ? 'Connected' :
                   screenShareStatus === 'waiting for offer' ? 'Connecting to device...' :
                   screenShareStatus === 'connected - waiting for offer' ? 'Connecting to device...' :
                   screenShareStatus === 'connecting...' ? 'Connecting...' :
                   screenShareStatus === 'error' ? 'Connection Error' :
                   screenShareStatus === 'disconnected' ? 'Disconnected' :
                   screenShareStatus}
                </span>
              </div>
            </div>
          </div>
          
          {/* No video placeholder */}
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center text-white">
                <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm opacity-75">Waiting for connection...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Phone Footer */}
        <div className="bg-gray-50 p-3 border-t border-gray-200 flex-shrink-0">
          <div className="text-xs text-gray-600 text-center">
            Device: {deviceId}
          </div>
        </div>
      </div>
    </div>
  );
}
