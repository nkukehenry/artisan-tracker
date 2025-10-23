import { useState } from 'react';
import { X } from 'lucide-react';

interface DurationInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (duration: number) => void;
    action: string;
    actionLabel: string;
}

export default function DurationInputModal({
    isOpen,
    onClose,
    onConfirm,
    actionLabel,
}: DurationInputModalProps) {
    const [duration, setDuration] = useState(30);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (duration < 1 || duration > 3600) {
            setError('Duration must be between 1 and 3600 seconds (1 hour)');
            return;
        }

        onConfirm(duration);
        onClose();
    };

    const handleClose = () => {
        setDuration(30);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-blue-900/20 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl max-w-md w-full mx-4 border border-white/20">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Set Duration for {actionLabel}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (seconds)
                            </label>
                            <input
                                id="duration"
                                type="number"
                                min="1"
                                max="3600"
                                value={duration}
                                onChange={(e) => {
                                    setDuration(parseInt(e.target.value) || 0);
                                    setError('');
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter duration in seconds"
                                autoFocus
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Range: 1 - 3600 seconds (1 hour)
                            </p>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm">{error}</div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
