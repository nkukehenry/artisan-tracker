'use client';

import { useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { parseGPSCoordinates, GPSCoordinates } from '@/types/media';

interface GPSMapViewerProps {
  location?: string;
  gpsCoordinates?: string;
  className?: string;
}

export default function GPSMapViewer({ location, gpsCoordinates, className = '' }: GPSMapViewerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const coords = parseGPSCoordinates(gpsCoordinates);

  if (!location && !coords) {
    return null;
  }

  const openInGoogleMaps = () => {
    if (coords) {
      window.open(`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`, '_blank');
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">Location Information</h3>
        </div>
        {coords && (
          <button
            onClick={openInGoogleMaps}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Maps
          </button>
        )}
      </div>

      {location && (
        <div className="mb-2">
          <p className="text-sm text-gray-600">Address:</p>
          <p className="text-sm font-medium text-gray-900">{location}</p>
        </div>
      )}

      {coords && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500">Latitude</p>
              <p className="text-sm font-mono font-medium">{coords.latitude.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Longitude</p>
              <p className="text-sm font-mono font-medium">{coords.longitude.toFixed(6)}</p>
            </div>
          </div>

          {showDetails && (
            <div className="border-t border-gray-200 pt-3 space-y-2">
              {coords.accuracy !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Accuracy:</span>
                  <span className="text-xs font-medium">±{coords.accuracy.toFixed(1)}m</span>
                </div>
              )}
              {coords.altitude !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Altitude:</span>
                  <span className="text-xs font-medium">{coords.altitude.toFixed(1)}m</span>
                </div>
              )}
              {coords.speed !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Speed:</span>
                  <span className="text-xs font-medium">{(coords.speed * 3.6).toFixed(1)} km/h</span>
                </div>
              )}
              {coords.heading !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Heading:</span>
                  <span className="text-xs font-medium flex items-center gap-1">
                    <Navigation className="h-3 w-3" style={{ transform: `rotate(${coords.heading}deg)` }} />
                    {coords.heading.toFixed(0)}°
                  </span>
                </div>
              )}
            </div>
          )}

          {(coords.accuracy !== undefined || coords.altitude !== undefined || coords.speed !== undefined || coords.heading !== undefined) && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              {showDetails ? 'Hide Details' : 'Show More Details'}
            </button>
          )}
        </>
      )}
    </div>
  );
}

