import React from 'react';
import { MessageSquare, MapPin, Phone, Users, Image as ImageIcon } from 'lucide-react';

interface MetricsCardsProps {
    counts: {
        messages: number;
        locations: number;
        calls: number;
        contacts: number;
        mediaFiles: number;
    };
}

const Card = ({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: number; color: string }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} bg-opacity-10`}>{icon}</div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    </div>
);

export default function MetricsCards({ counts }: MetricsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card icon={<MessageSquare className="w-6 h-6 text-blue-600" />} title="Messages" value={counts.messages} color="text-blue-600" />
            <Card icon={<MapPin className="w-6 h-6 text-green-600" />} title="Locations" value={counts.locations} color="text-green-600" />
            <Card icon={<Phone className="w-6 h-6 text-amber-600" />} title="Calls" value={counts.calls} color="text-amber-600" />
            <Card icon={<Users className="w-6 h-6 text-violet-600" />} title="Contacts" value={counts.contacts} color="text-violet-600" />
            <Card icon={<ImageIcon className="w-6 h-6 text-rose-600" />} title="Media Files" value={counts.mediaFiles} color="text-rose-600" />
        </div>
    );
}


