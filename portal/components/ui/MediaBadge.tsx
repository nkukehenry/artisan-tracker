import { FileAudio, FileImage, FileVideo, FileText, ExternalLink } from 'lucide-react';
import { Media } from '@/types/callLog';
import { formatFileSize } from '@/types/media';

interface MediaBadgeProps {
  media: Media;
  showSize?: boolean;
  className?: string;
}

const getMediaIcon = (fileType: string) => {
  switch (fileType) {
    case 'AUDIO':
      return FileAudio;
    case 'PHOTO':
      return FileImage;
    case 'VIDEO':
      return FileVideo;
    default:
      return FileText;
  }
};

const getMediaColor = (fileType: string) => {
  switch (fileType) {
    case 'AUDIO':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'PHOTO':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'VIDEO':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export default function MediaBadge({ media, showSize = true, className = '' }: MediaBadgeProps) {
  const Icon = getMediaIcon(media.fileType);
  const colorClass = getMediaColor(media.fileType);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-md text-xs ${colorClass} ${className}`}>
      <Icon className="h-4 w-4" />
      <div className="flex flex-col">
        <span className="font-medium truncate max-w-[150px]" title={media.fileName}>
          {media.fileName}
        </span>
        {showSize && (
          <span className="text-xs opacity-75">
            {formatFileSize(media.fileSize)}
          </span>
        )}
      </div>
      <ExternalLink className="h-3 w-3 opacity-50" />
    </div>
  );
}

