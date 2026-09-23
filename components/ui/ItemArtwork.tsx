import React, { useState } from 'react';
import { Gift } from 'lucide-react';

interface ItemArtworkProps {
    itemId: string;
    name: string;
    className?: string;
}

export const getItemArtworkUrl = (itemId: string): string => `/assets/items/${encodeURIComponent(itemId)}.png`;

export const ItemArtwork: React.FC<ItemArtworkProps> = ({ itemId, name, className = '' }) => {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return <Gift aria-label={name} className={className} />;
    }

    return (
        <img
            src={getItemArtworkUrl(itemId)}
            alt={name}
            className={`object-contain ${className}`}
            draggable={false}
            onError={() => setFailed(true)}
        />
    );
};
