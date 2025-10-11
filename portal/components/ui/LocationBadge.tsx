import { MapPin } from 'lucide-react';
import { parseGPSCoordinates } from '@/types/media';

interface LocationBadgeProps {
  location?: string;
  gpsCoordinates?: string;
  showCoordinates?: boolean;
  className?: string;
}

export default function LocationBadge({ 
  location, 
  gpsCoordinates, 
  showCoordinates = false,
  className = '' 
}: LocationBadgeProps) {
  if (!location && !gpsCoordinates) return null;

  const coords = parseGPSCoordinates(gpsCoordinates);
  const displayText = location || (coords ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` : null);

  if (!displayText) return null;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs ${className}`}>
      <MapPin className="h-3 w-3" />
      <span className="truncate max-w-[200px]" title={displayText}>
        {displayText}
      </span>
      {showCoordinates && coords && (
        <span className="text-blue-500 ml-1" title={`Accuracy: ${coords.accuracy || 'N/A'}m`}>
          ±{coords.accuracy?.toFixed(0) || '?'}m
        </span>
      )}
    </div>
  );
}

