import { Clock, Download, Monitor, Mic } from 'lucide-react';

interface Recording {
  id: string;
  deviceId: string;
  deviceName: string;
  type: string;
  timestamp: string;
  duration: string;
  size: string;
}

interface PreviousRecordingsProps {
  recordings: Recording[];
}

export default function PreviousRecordings({ recordings }: PreviousRecordingsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Previous Recordings</h2>
        <p className="text-sm text-gray-600">View and download previous recordings</p>
      </div>
      
      <div className="p-6">
        {recordings.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recordings available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
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
                      {recording.type === 'screen_recording'
                        ? 'Screen Recording'
                        : 'Audio Recording'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(recording.timestamp).toLocaleString()} • {recording.duration} •{' '}
                      {recording.size}
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
  );
}

