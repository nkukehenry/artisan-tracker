import React from 'react';
import { MessageSquare, MapPin, Phone, Users, Image as ImageIcon, LucideIcon } from 'lucide-react';

interface MetricsCardsProps {
    counts: {
        messages: number;
        locations: number;
        calls: number;
        contacts: number;
        mediaFiles: number;
    };
}

const Card = ({
    Icon,
    title,
    value,
    color,
    bgColor = 'bg-white'
}: {
    Icon: LucideIcon;
    title: string;
    value: number;
    color: string;
    bgColor?: string;
}) => {
    const isColoredBackground = bgColor !== 'bg-white';
    const textColor = isColoredBackground ? 'text-white' : 'text-gray-600';
    const valueColor = isColoredBackground ? 'text-white' : 'text-gray-900';
    const borderColor = isColoredBackground ? 'border-transparent' : 'border-gray-200';
    const iconColor = isColoredBackground ? color : 'text-white';

    return (
        <div className={`${bgColor} rounded-lg border ${borderColor} p-6 shadow-sm`}>
            <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isColoredBackground ? 'bg-white bg-opacity-25' : `${color} bg-opacity-10`}`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={2} />
                </div>
                <div className="ml-4">
                    <p className={`text-sm font-medium ${textColor}`}>{title}</p>
                    <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
                </div>
            </div>
        </div>
    );
};

export default function MetricsCards({ counts }: MetricsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card
                Icon={MessageSquare}
                title="Messages"
                value={counts.messages}
                color="text-blue-600"
                bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <Card
                Icon={MapPin}
                title="Locations"
                value={counts.locations}
                color="text-green-600"
                bgColor="bg-gradient-to-br from-green-500 to-green-600"
            />
            <Card
                Icon={Phone}
                title="Calls"
                value={counts.calls}
                color="text-amber-600"
                bgColor="bg-gradient-to-br from-amber-500 to-amber-600"
            />
            <Card
                Icon={Users}
                title="Contacts"
                value={counts.contacts}
                color="text-violet-600"
                bgColor="bg-gradient-to-br from-violet-500 to-violet-600"
            />
            <Card
                Icon={ImageIcon}
                title="Media Files"
                value={counts.mediaFiles}
                color="text-rose-600"
                bgColor="bg-gradient-to-br from-rose-500 to-rose-600"
            />
        </div>
    );
}


