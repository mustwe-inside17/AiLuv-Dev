
import { GameState, Job, Workout } from '../types';
import { JOBS_LIST, WORKOUT_LIST } from '../constants';
import { calculateWorkOutcome, calculateGymOutcome, getEnergyRegenConfig } from './buffMechanics';

// Types mimicking Server Response
export interface TaskResult {
  success: boolean;
  newGameState: Partial<GameState>; // Only returns what changed
  rewards: {
    gold: number;
    exp: number;
    maxEnergyGain?: number;
  };
  message: string;
  isCritical: boolean;
}

export const processTaskCompletion = (
  gameState: GameState,
  taskId: string,
  taskType: 'work' | 'gym'
): TaskResult => {
  
  // 1. VALIDATION
  let taskDef: Job | Workout | undefined;
  if (taskType === 'work') taskDef = JOBS_LIST.find(j => j.id === taskId);
  else if (taskType === 'gym') taskDef = WORKOUT_LIST.find(w => w.id === taskId);

  if (!taskDef) {
    throw new Error("Invalid Task ID.");
  }

  if (!gameState.activeTask || gameState.activeTask.id !== taskId) {
     throw new Error("No active task matches this completion request.");
  }

  // 2. CALCULATION (Delegated to buffMechanics)
  const stats = gameState.stats;
  const buffs = gameState.activeBuffs;
  const performanceScore = gameState.activeTask.performanceScore || 0;
  const equippedStyleId = gameState.equippedStyle;
  
  let goldReward = 0;
  let expReward = 0;
  let maxEnergyGain = 0;
  let message = "";
  let isCritical = false;
  let consumedBuffs: string[] = [];

  if (taskType === 'work') {
      const job = taskDef as Job;
      const result = calculateWorkOutcome(job.goldReward, job.expReward, buffs, stats, performanceScore, equippedStyleId);
      
      goldReward = result.gold;
      expReward = result.exp;
      isCritical = result.isCritical;
      message = result.messages.join(" ");
      if (!message) message = "Work Complete!";

  } else if (taskType === 'gym') {
      const workout = taskDef as Workout;
      const result = calculateGymOutcome(workout.maxEnergyGain, workout.expReward, buffs, stats, performanceScore, equippedStyleId);

      maxEnergyGain = result.maxEnergyGain;
      expReward = result.exp;
      isCritical = result.isCritical;
      consumedBuffs = result.consumedBuffs;
      message = result.messages.join(" ");
      if (!message) message = "Workout Complete!";
  }

  // 3. STATE UPDATE PREPARATION
  let newExp = gameState.currentExp + expReward;
  let newLevel = gameState.level;
  let newReqExp = gameState.requiredExp;
  let newStatPoints = gameState.stats.points;

  // Level Up Loop
  while (newExp >= newReqExp) {
      newLevel++;
      newExp -= newReqExp;
      newReqExp = Math.floor(newReqExp * 1.2);
      newStatPoints++;
  }

  // Cooldowns
  const now = Date.now();
  const newJobCooldowns = { ...gameState.jobCooldowns };
  const newWorkoutCooldowns = { ...gameState.workoutCooldowns };

  if (taskDef.cooldownMinutes) {
      // [MARCUS VIP]: Reduce Cooldown by 30% if VIP
      let cooldownMs = taskDef.cooldownMinutes * 60 * 1000;
      if (gameState.isVip) {
          cooldownMs = Math.ceil(cooldownMs * 0.7);
      }

      if (taskType === 'work') newJobCooldowns[taskId] = now + cooldownMs;
      if (taskType === 'gym') newWorkoutCooldowns[taskId] = now + cooldownMs;
  }

  // Update Buffs (Remove consumed)
  let newBuffs = [...buffs];
  if (consumedBuffs.length > 0) {
      newBuffs = newBuffs.filter(b => !consumedBuffs.includes(b.type));
  }

  if (taskType === 'gym') {
      const workout = taskDef as Workout;
      if (workout.buffReward) {
          newBuffs = newBuffs.filter(b => b.type !== workout.buffReward!.type);
          newBuffs.push({
              id: `gym_buff_${Date.now()}`,
              type: workout.buffReward.type,
              value: workout.buffReward.value,
              expiresAt: Date.now() + workout.buffReward.durationMinutes * 60 * 1000,
              sourceName: workout.name
          });
          message += ` (Buff: ${workout.buffReward.value} OverCharge)`;
      }
  }

  const newTotalWork = taskType === 'work' ? (gameState.totalWorkCount || 0) + 1 : gameState.totalWorkCount || 0;
  const newTotalGym = taskType === 'gym' ? (gameState.totalGymCount || 0) + 1 : gameState.totalGymCount || 0;

  return {
      success: true,
      message,
      isCritical,
      rewards: {
          gold: goldReward,
          exp: expReward,
          maxEnergyGain
      },
      newGameState: {
          gold: Math.floor(gameState.gold + goldReward),
          totalGoldEarned: Math.floor((gameState.totalGoldEarned || 0) + goldReward),
          maxEnergy: Math.floor(gameState.maxEnergy + maxEnergyGain),
          currentExp: Math.floor(newExp),
          level: newLevel,
          requiredExp: Math.floor(newReqExp),
          stats: { ...stats, points: newStatPoints },
          jobCooldowns: newJobCooldowns,
          workoutCooldowns: newWorkoutCooldowns,
          activeBuffs: newBuffs,
          activeTask: null,
          hasTrainedVisit: taskType === 'gym' ? true : gameState.hasTrainedVisit,
          totalWorkCount: newTotalWork,
          totalGymCount: newTotalGym
      }
  };
};

export const calculateEnergyRegen = (gameState: GameState): Partial<GameState> | null => {
    const now = Date.now(); 
    const lastUpdate = gameState.lastEnergyUpdate;
    
    // Delegate to Mechanics (Uses Effective Max Energy internally)
    const { tickRate, regenCap } = getEnergyRegenConfig(
        gameState.maxEnergy, 
        gameState.unlockedSkills, 
        gameState.activeBuffs, 
        gameState.isSleeping,
        gameState.equippedStyle
    );

    const timeDiff = now - lastUpdate;

    if (timeDiff < tickRate) {
        return null;
    }

    const currentEnergy = Math.floor(gameState.energy);

    // Logic: If already full (or overfilled due to manual consumable), just update timestamp
    if (currentEnergy >= regenCap) {
        return { lastEnergyUpdate: now };
    }

    // Calculate Ticks
    const ticks = Math.floor(timeDiff / tickRate);
    const potentialEnergy = currentEnergy + ticks;
    const newEnergy = Math.floor(Math.min(regenCap, potentialEnergy));
    
    const remainder = timeDiff % tickRate;

    return { 
        energy: newEnergy, 
        lastEnergyUpdate: now - remainder 
    };
};
