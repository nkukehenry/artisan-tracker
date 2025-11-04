import { useState } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

export interface RemoteControlConfig {
    duration?: number;
    cameraFace?: 'front' | 'back';
}

interface RemoteControlConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (config: RemoteControlConfig) => void;
    action: string;
    actionLabel: string;
}

interface TimeChooserProps {
    minutes: number;
    seconds: number;
    onMinutesChange: (minutes: number) => void;
    onSecondsChange: (seconds: number) => void;
}

function TimeChooser({ minutes, seconds, onMinutesChange, onSecondsChange }: TimeChooserProps) {
    const incrementMinutes = () => {
        const newMinutes = minutes + 1;
        if (newMinutes * 60 + seconds <= 3600) {
            onMinutesChange(newMinutes);
        }
    };

    const decrementMinutes = () => {
        if (minutes > 0) {
            onMinutesChange(minutes - 1);
        }
    };

    const incrementSeconds = () => {
        const totalSeconds = minutes * 60 + seconds + 1;
        if (totalSeconds <= 3600) {
            if (seconds === 59) {
                onSecondsChange(0);
                onMinutesChange(minutes + 1);
            } else {
                onSecondsChange(seconds + 1);
            }
        }
    };

    const decrementSeconds = () => {
        if (seconds > 0) {
            onSecondsChange(seconds - 1);
        } else if (minutes > 0) {
            onSecondsChange(59);
            onMinutesChange(minutes - 1);
        }
    };

    return (
        <div className="flex items-center justify-center gap-6 py-4">
            {/* Minutes */}
            <div className="flex flex-col items-center">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase">
                    Minutes
                </label>
                <div className="flex flex-col items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    <button
                        type="button"
                        onClick={incrementMinutes}
                        disabled={minutes * 60 + seconds >= 3600}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Increment minutes"
                    >
                        <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div className="px-6 py-3 text-3xl font-semibold text-gray-900 dark:text-gray-100 min-w-[80px] text-center">
                        {String(minutes).padStart(2, '0')}
                    </div>
                    <button
                        type="button"
                        onClick={decrementMinutes}
                        disabled={minutes === 0 && seconds === 0}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-b-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Decrement minutes"
                    >
                        <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>

            {/* Separator */}
            <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100 pt-8">
                :
            </div>

            {/* Seconds */}
            <div className="flex flex-col items-center">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase">
                    Seconds
                </label>
                <div className="flex flex-col items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    <button
                        type="button"
                        onClick={incrementSeconds}
                        disabled={minutes * 60 + seconds >= 3600}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Increment seconds"
                    >
                        <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div className="px-6 py-3 text-3xl font-semibold text-gray-900 dark:text-gray-100 min-w-[80px] text-center">
                        {String(seconds).padStart(2, '0')}
                    </div>
                    <button
                        type="button"
                        onClick={decrementSeconds}
                        disabled={minutes === 0 && seconds === 0}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-b-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Decrement seconds"
                    >
                        <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>
        </div>
    );
}

interface CameraFaceChooserProps {
    cameraFace: 'front' | 'back';
    onCameraFaceChange: (face: 'front' | 'back') => void;
}

function CameraFaceChooser({ cameraFace, onCameraFaceChange }: CameraFaceChooserProps) {
    return (
        <div className="flex flex-col items-center py-4">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase">
                Camera Face
            </label>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => onCameraFaceChange('front')}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${cameraFace === 'front'
                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                >
                    Front
                </button>
                <button
                    type="button"
                    onClick={() => onCameraFaceChange('back')}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${cameraFace === 'back'
                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                >
                    Back
                </button>
            </div>
        </div>
    );
}

export default function RemoteControlConfigModal({
    isOpen,
    onClose,
    onConfirm,
    action,
    actionLabel,
}: RemoteControlConfigModalProps) {
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(30);
    const [cameraFace, setCameraFace] = useState<'front' | 'back'>('front');
    const [error, setError] = useState('');

    // Determine what to show based on action
    const needsDuration = ['record_audio', 'stream_audio', 'stream_screen', 'record_video', 'stream_video'].includes(action);
    const needsCamera = ['take_photo', 'record_video', 'stream_video'].includes(action);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const config: RemoteControlConfig = {};

        if (needsDuration) {
            const totalSeconds = minutes * 60 + seconds;
            if (totalSeconds < 1 || totalSeconds > 3600) {
                setError('Duration must be between 1 and 3600 seconds (1 hour)');
                return;
            }
            config.duration = totalSeconds;
        }

        if (needsCamera) {
            config.cameraFace = cameraFace;
        }

        onConfirm(config);
        onClose();
    };

    const handleClose = () => {
        setMinutes(0);
        setSeconds(30);
        setCameraFace('front');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    const totalSeconds = minutes * 60 + seconds;

    return (
        <div className="fixed inset-0 bg-blue-900/20 dark:bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Configure {actionLabel}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        {needsDuration && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                                    Duration
                                </label>
                                <TimeChooser
                                    minutes={minutes}
                                    seconds={seconds}
                                    onMinutesChange={setMinutes}
                                    onSecondsChange={setSeconds}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                                    Total: {totalSeconds} seconds (Max: 3600 seconds / 1 hour)
                                </p>
                            </div>
                        )}

                        {needsCamera && (
                            <div>
                                <CameraFaceChooser
                                    cameraFace={cameraFace}
                                    onCameraFaceChange={setCameraFace}
                                />
                            </div>
                        )}

                        {error && (
                            <div className="text-red-600 dark:text-red-400 text-sm text-center">{error}</div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

