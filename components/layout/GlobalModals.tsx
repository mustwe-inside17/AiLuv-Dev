
import React from 'react';
import { WelcomeModal } from '../WelcomeModal';
import { ItemConsumptionModal } from '../ItemConsumptionModal';
import { DiamondShopModal } from '../DiamondShopModal';
import { StoryOverlay } from '../StoryOverlay';
import { DailyLoginModal } from '../DailyLoginModal';
import { VipPassModal } from '../VipPassModal';
import { LevelUpModal } from '../LevelUpModal'; 
import { SecretUnlockModal } from '../SecretUnlockModal';
import { QuestRedemptionModal } from '../QuestRedemptionModal';
import { QuestChoiceModal } from '../QuestChoiceModal'; // NEW IMPORT
import { LoadingScreen } from '../LoadingScreen';
import { CharacterQuestChoice, GameState, QuestOption } from '../../types';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';

interface GlobalModalsProps {
    // Welcome
    playerName: string;
    onStartTutorial: () => void;

    // Item Consumption
    consumptionResult: any;
    setConsumptionResult: (res: any) => void;

    // Story
    handleStoryClaim: (chapterId: number) => void;
    gameState: GameState;

    // Loading
    isLoadingProfile: boolean;
    authLoading: boolean;

    // Quest Handlers
    onCollectQuestReward: () => void;
    onSelectQuestOption: (option: CharacterQuestChoice | QuestOption) => void;
    onCloseQuestChoice: () => void;
}

export const GlobalModals: React.FC<GlobalModalsProps> = ({
    playerName, onStartTutorial,
    consumptionResult, setConsumptionResult,
    handleStoryClaim, gameState,
    isLoadingProfile, authLoading,
    onCollectQuestReward,
    onSelectQuestOption,
    onCloseQuestChoice
}) => {
    // Access UI Store
    const { 
        showWelcomeModal, setShowWelcomeModal,
        showDiamondShop, setShowDiamondShop,
        showStory, setShowStory,
        showDailyLogin, setShowDailyLogin,
        showVipModal, setShowVipModal,
        levelUpData, setLevelUpData
    } = useUIStore();

    // Access secret data from store directly
    const { 
        secretUnlockData, 
        setSecretUnlockData, 
        pendingQuestReward, 
        activeQuestChoiceSession
    } = useGameStore(useShallow(state => ({
        secretUnlockData: state.secretUnlockData,
        setSecretUnlockData: state.setSecretUnlockData,
        pendingQuestReward: state.pendingQuestReward,
        activeQuestChoiceSession: state.activeQuestChoiceSession
    })));
    
    if (authLoading || isLoadingProfile) return <LoadingScreen />;

    return (
        <>
            {showWelcomeModal && <WelcomeModal playerName={playerName} onClose={() => { setShowWelcomeModal(false); onStartTutorial(); }} />}
            <ItemConsumptionModal result={consumptionResult} onClose={() => setConsumptionResult(null)} />
            {showDiamondShop && <DiamondShopModal onClose={() => setShowDiamondShop(false)} />}
            {showStory && <StoryOverlay gameState={gameState} onClose={() => setShowStory(false)} onClaimChapter={handleStoryClaim} />}
            {showDailyLogin && <DailyLoginModal onClose={() => setShowDailyLogin(false)} />}
            {showVipModal && <VipPassModal onClose={() => setShowVipModal(false)} />}
            {levelUpData && <LevelUpModal newLevel={levelUpData} onClose={() => setLevelUpData(null)} />}
            {secretUnlockData && <SecretUnlockModal data={secretUnlockData} onClose={() => setSecretUnlockData(null)} />}
            
            {/* QUEST CHOICE MODAL */}
            {activeQuestChoiceSession && (
                <QuestChoiceModal 
                    session={activeQuestChoiceSession} 
                    onSelect={onSelectQuestOption} 
                    onClose={onCloseQuestChoice}
                />
            )}

            {/* QUEST REDEMPTION MODAL */}
            {pendingQuestReward && <QuestRedemptionModal reward={pendingQuestReward} onCollect={onCollectQuestReward} />}
        </>
    );
};
