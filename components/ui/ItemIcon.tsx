import React, { useState } from 'react';
import { EmojiIcon } from './EmojiIcon';

interface ItemIconProps {
    itemId: string;
    fallbackEmoji: string;
    className?: string;
}

export const ItemIcon: React.FC<ItemIconProps> = ({ itemId, fallbackEmoji, className = '' }) => {
    const [hasError, setHasError] = useState(false);
    
    // Path to the custom PNG icon in public/assets/items/
    const customIconPath = `/assets/items/${itemId}.png`;

    if (!hasError) {
        return (
            <div className={`relative inline-flex items-center justify-center ${className}`}>
                <img 
                    src={customIconPath} 
                    alt={itemId} 
                    className="w-full h-full object-contain"
                    onError={() => setHasError(true)}
                />
            </div>
        );
    }

    // Fallback to original EmojiIcon if the PNG fails to load
    return <EmojiIcon emoji={fallbackEmoji} className={className} />;
};
