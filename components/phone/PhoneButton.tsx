
import React, { useState, useRef, useEffect } from 'react';
import { Smartphone } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const PhoneButton: React.FC = () => {
    const { togglePhone, unreadSocialPosts, mails, isVip, vipDailyClaimed } = useGameStore();
    const todayStr = new Date().toDateString();
    const isVipDailyClaimable = isVip && vipDailyClaimed !== todayStr;
    const unreadMails = (mails || []).filter(m => !m.isRead || (m.rewards && !m.isClaimed)).length;
    const totalNotifications = (unreadSocialPosts || 0) + unreadMails + (isVipDailyClaimable ? 1 : 0);
    
    // Initial position (Bottom Right, slightly offset)
    const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 100 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ x: number, y: number } | null>(null);
    const initialPosRef = useRef<{ x: number, y: number } | null>(null);
    const hasMovedRef = useRef(false);

    // Update position on resize to keep it on screen
    useEffect(() => {
        const handleResize = () => {
            setPosition(prev => ({
                x: Math.min(prev.x, window.innerWidth - 80),
                y: Math.min(prev.y, window.innerHeight - 100)
            }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePointerDown = (e: React.PointerEvent) => {
        // Only left click or touch
        if (e.button !== 0) return;
        
        setIsDragging(true);
        hasMovedRef.current = false;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        initialPosRef.current = { ...position };
        
        // Capture pointer to track outside element
        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !dragStartRef.current || !initialPosRef.current) return;

        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;

        // If moved more than 5px, consider it a drag
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            hasMovedRef.current = true;
        }

        // Calculate new position
        const newX = initialPosRef.current.x + dx;
        const newY = initialPosRef.current.y + dy;

        // Boundary constraints
        const maxX = window.innerWidth - 60;
        const maxY = window.innerHeight - 60;
        
        setPosition({
            x: Math.max(10, Math.min(maxX, newX)),
            y: Math.max(10, Math.min(maxY, newY))
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        (e.target as Element).releasePointerCapture(e.pointerId);
        
        // If it was a click (not a drag), toggle phone
        if (!hasMovedRef.current) {
            togglePhone();
        }
    };

    return (
        <div 
            className="fixed z-[500] touch-none select-none"
            style={{ 
                left: position.x, 
                top: position.y,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            <div className={`
                w-14 h-14 rounded-full flex items-center justify-center 
                bg-gradient-to-br from-indigo-500 to-violet-600 
                text-white
                border-2 border-white/20
                shadow-[0_8px_32px_rgba(99,102,241,0.4)]
                transition-transform duration-100 ease-out
                ${isDragging ? 'scale-110 shadow-2xl' : 'hover:scale-105'}
                animate-bounce-soft
            `}>
                <div className="relative">
                    <Smartphone size={24} className="text-white drop-shadow-md" />
                    {totalNotifications > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">
                            {totalNotifications > 99 ? '99+' : totalNotifications}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
