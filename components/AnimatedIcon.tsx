import React from 'react';

export type AnimatedIconType = 'coin' | 'gem' | 'heart' | 'mail' | 'crown' | 'star' | 'energy';

interface AnimatedIconProps {
    type: AnimatedIconType;
    size?: number;
    className?: string;
    loop?: boolean;
    autoplay?: boolean;
}

const getFluent3D = (folderName: string) => {
    const fileName = folderName.toLowerCase().replace(/ /g, '_');
    return `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/${encodeURIComponent(folderName)}/3D/${fileName}_3d.png`;
};

const ICON_MAP: Record<AnimatedIconType, string> = {
    coin: getFluent3D('Coin'),
    gem: getFluent3D('Gem stone'),
    heart: getFluent3D('Red heart'),
    mail: getFluent3D('Envelope'),
    crown: getFluent3D('Crown'),
    star: getFluent3D('Star'),
    energy: getFluent3D('High voltage')
};

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({ 
    type, 
    size = 24, 
    className = ''
}) => {
    return (
        <div className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            <img 
                src={ICON_MAP[type] || ICON_MAP.coin} 
                alt={`${type} icon`}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                referrerPolicy="no-referrer"
                className="drop-shadow-sm hover:scale-110 transition-transform duration-200"
            />
        </div>
    );
};
