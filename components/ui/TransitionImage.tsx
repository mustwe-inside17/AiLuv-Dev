
import React, { useState, useEffect } from 'react';

interface TransitionImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src?: string | null;
    alt: string;
    className?: string;
    placeholderColor?: string; // Optional custom placeholder color
}

export const TransitionImage: React.FC<TransitionImageProps> = ({ src, alt, className = "", placeholderColor, ...props }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(src);

    // Reset load state when source changes significantly
    useEffect(() => {
        if (src !== currentSrc) {
            setIsLoaded(false);
            setHasError(false);
            setCurrentSrc(src);
        }
    }, [src, currentSrc]);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* 1. Placeholder / Skeleton Layer (Prevents white flash or handles errors) */}
            <div 
                className={`absolute inset-0 z-0 transition-opacity duration-500 ${(isLoaded && !hasError) ? 'opacity-0' : 'opacity-100'} ${placeholderColor ? '' : 'bg-gradient-to-br from-slate-800 via-indigo-950 to-purple-950 animate-pulse'}`}
                style={{ backgroundColor: placeholderColor }}
            />

            {/* 2. The Actual Image */}
            {src && !hasError && (
                <img
                    src={src}
                    alt={alt}
                    className={`w-full h-full object-cover relative z-10 transition-opacity duration-500 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => {
                        console.warn(`[TransitionImage] Image failed to load: ${src}`);
                        setHasError(true);
                    }}
                    {...props}
                />
            )}
        </div>
    );
};
