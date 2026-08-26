
import React, { useState } from 'react';
import { GameState, CharacterId, RelationshipTier } from '../types';
import { Heart } from 'lucide-react';
import { RelationshipCard } from './relationship/RelationshipCard';
import { CharacterDetailView } from './relationship/CharacterDetailView';
import { SECRET_REGISTRY } from '../constants'; // Import Registry

interface RelationshipStatsProps {
  gameState: GameState;
  onImageClick?: (url: string) => void;
  onSocialChat?: (id: CharacterId) => void;
  onTutorialClick?: (id: CharacterId) => void;
}

export const RelationshipStats: React.FC<RelationshipStatsProps> = ({ gameState, onImageClick, onSocialChat, onTutorialClick }) => {
  const [selectedChar, setSelectedChar] = useState<CharacterId | null>(null);

  // List of all characters
  const charIds: CharacterId[] = ['miguel', 'fia', 'peat', 'erin', 'marcus', 'lucas', 'bam', 'jellie', 'soul', 'mia'];

  // Tutorial check
  const isTutorialTap = gameState.tutorialStep === 'relationships_tap';

  const handleCardClick = (id: CharacterId) => {
      if (isTutorialTap) {
          if (id === 'miguel') {
              onTutorialClick?.(id);
              setSelectedChar(id);
          }
      } else {
          setSelectedChar(id);
      }
  };

  return (
    <div className="relative h-full overflow-hidden bg-gray-50/50 dark:bg-slate-900/50">
      <div className="p-4 md:p-8 space-y-6 overflow-y-auto h-full pb-24 custom-scrollbar">
        <div className="mb-2 max-w-4xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span className="bg-rose-100 dark:bg-rose-900/50 p-2 rounded-xl text-rose-500 dark:text-rose-300 shadow-sm"><Heart size={24} fill="currentColor" /></span>
                AiLuv Relationships
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">ปลดล็อกระดับความสัมพันธ์เพื่อสานสัมพันธ์ให้ลึกซึ้งยิ่งขึ้น</p>
        </div>
        
        {/* GRID LAYOUT FOR DESKTOP */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5 max-w-4xl mx-auto w-full relative pb-4">
           {charIds.map(id => {
               const isMiguel = id === 'miguel';
               const highlightStyle = 'z-[220] relative scale-105 shadow-[0_0_30px_rgba(236,72,153,0.6)] ring-4 ring-pink-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 rounded-2xl animate-pulse';
               const dimmedStyle = 'opacity-30 pointer-events-none filter blur-[1px]';

               // Calculate Secrets Progress
               const charSecrets = SECRET_REGISTRY[id] || [];
               const totalSecrets = charSecrets.length;
               const unlockedCount = charSecrets.filter(s => (gameState.unlockedSecrets || []).includes(s.path)).length;

               return (
                   <div key={id} className={`transition-all duration-500 h-full ${isTutorialTap ? (isMiguel ? highlightStyle : dimmedStyle) : ''}`}>
                       <RelationshipCard 
                            id={id}
                            isMet={(gameState.metCharacters || []).includes(id)}
                            loveScore={gameState.loveScores[id] || 0}
                            tier={gameState.relationshipTiers[id] || RelationshipTier.STRANGER}
                            onSelect={handleCardClick}
                            // Pass Secret Data
                            totalSecretsCount={totalSecrets}
                            unlockedSecretsCount={unlockedCount}
                       />
                   </div>
               );
           })}
        </div>
      </div>
      
      {selectedChar && (
          <CharacterDetailView 
              id={selectedChar} 
              gameState={gameState} 
              onClose={() => setSelectedChar(null)} 
              onImageClick={onImageClick}
              onSocialChat={onSocialChat}
          />
      )}
    </div>
  );
};
