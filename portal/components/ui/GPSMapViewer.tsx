'use client';

import { useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { parseGPSCoordinates } from '@/types/media';

interface GPSMapViewerProps {
  location?: string;
  gpsCoordinates?: string;
  className?: string;
}

export default function GPSMapViewer({ location, gpsCoordinates, className = '' }: GPSMapViewerProps) {
  const [showEmbeddedMap, setShowEmbeddedMap] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const coords = parseGPSCoordinates(gpsCoordinates);


  if (!location && !coords) {
    return null;
  }

  // Generate URLs for external map providers
  const googleMapsUrl = `https://www.google.com/maps?q=${coords?.latitude},${coords?.longitude}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${coords?.latitude},${coords?.longitude}`;
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${coords?.latitude}&mlon=${coords?.longitude}&zoom=15`;

  // OpenStreetMap embedded URL
  const embeddedMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${Number(coords?.longitude) - 0.01},${Number(coords?.latitude) - 0.01},${Number(coords?.longitude) + 0.01},${Number(coords?.latitude) + 0.01}&layer=mapnik&marker=${coords?.latitude},${coords?.longitude}`;


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
      </div>


      {/* Map Toggle Buttons */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setShowEmbeddedMap(true)}
          className={`px-3 py-2 text-sm rounded-md transition-colors ${showEmbeddedMap
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
        >
          <MapPin className="w-4 h-4 inline mr-1" />
          OpenStreetMap
        </button>
        <button
          onClick={() => setShowEmbeddedMap(false)}
          className={`px-3 py-2 text-sm rounded-md transition-colors ${!showEmbeddedMap
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
        >
          <ExternalLink className="w-4 h-4 inline mr-1" />
          External Maps
        </button>
      </div>

      {/* Embedded OpenStreetMap */}
      {showEmbeddedMap && (
        <div className="space-y-3">
          <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            <iframe
              src={embeddedMapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map - OpenStreetMap"
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Interactive map view • Click and drag to explore • Powered by OpenStreetMap
          </div>
        </div>
      )}

      {/* External Map Options */}
      {!showEmbeddedMap && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Google Maps
            </a>
            <a
              href={appleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-3 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Apple Maps
            </a>
            <a
              href={openStreetMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              OpenStreetMap
            </a>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Opens in new tab • Choose your preferred map provider
          </div>
        </div>
      )}


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

