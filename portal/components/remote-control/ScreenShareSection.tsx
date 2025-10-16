import { Monitor, Square } from 'lucide-react';

interface ScreenShareSectionProps {
  isActive: boolean;
  status: string;
  onToggle: () => void;
}

export default function ScreenShareSection({
  isActive,
  status,
  onToggle,
}: ScreenShareSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Live Screen View</h2>
        <p className="text-sm text-gray-600">View device screen in real-time</p>
      </div>
      
      <div className="p-6">
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
            isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'
          }`}
        >
          {isActive ? (
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
        
        <p className="text-sm text-gray-600 mt-2">Status: {status}</p>
      </div>
    </div>
  );
}

