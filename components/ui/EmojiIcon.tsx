import React from 'react';

interface EmojiIconProps {
    emoji: string;
    className?: string;
}

export const EmojiIcon: React.FC<EmojiIconProps> = ({ emoji, className = '' }) => {
    if (emoji.startsWith('http') || emoji.startsWith('/') || emoji.startsWith('./')) {
        return (
            <img 
                src={emoji} 
                alt="emoji" 
                className={`inline-block object-contain w-[1em] h-[1em] ${className}`} 
                referrerPolicy="no-referrer"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                        const span = document.createElement('span');
                        span.innerText = '🎁';
                        span.className = className;
                        parent.appendChild(span);
                    }
                }}
            />
        );
    }
    return <span className={className}>{emoji}</span>;
};
