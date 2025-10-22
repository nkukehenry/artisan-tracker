import { useState } from 'react';
import { ExternalLink, Map, Globe } from 'lucide-react';

type Props = {
    latitude: number;
    longitude: number;
    address?: string;
};

export default function MapView({ latitude, longitude, address }: Props) {
    const [showEmbeddedMap, setShowEmbeddedMap] = useState(true);

    // Generate URLs for external map providers
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const appleMapsUrl = `https://maps.apple.com/?q=${latitude},${longitude}`;
    const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;

    // OpenStreetMap embedded URL
    const embeddedMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;

    return (
        <div className="space-y-4">
            {/* Location Information */}
            <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Coordinates:</strong> {latitude}, {longitude}
                </div>
                {address && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Address:</strong> {address}
                    </div>
                )}
            </div>

            {/* Map Toggle Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => setShowEmbeddedMap(true)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${showEmbeddedMap
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    <Map className="w-4 h-4 inline mr-1" />
                    OpenStreetMap
                </button>
                <button
                    onClick={() => setShowEmbeddedMap(false)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${!showEmbeddedMap
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    <Globe className="w-4 h-4 inline mr-1" />
                    External Maps
                </button>
            </div>

            {/* Embedded OpenStreetMap */}
            {showEmbeddedMap && (
                <div className="space-y-3">
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                        <iframe
                            src={embeddedMapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Location Map - OpenStreetMap"
                        />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Interactive map view • Click and drag to explore • Powered by OpenStreetMap
                    </div>
                </div>
            )}

            {/* External Map Options */}
            {!showEmbeddedMap && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Google Maps
                        </a>
                        <a
                            href={appleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center px-4 py-3 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Apple Maps
                        </a>
                        <a
                            href={openStreetMapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            OpenStreetMap
                        </a>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Opens in new tab • Choose your preferred map provider
                    </div>
                </div>
            )}
        </div>
    );
}