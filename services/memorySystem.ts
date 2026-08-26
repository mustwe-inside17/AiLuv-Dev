
import { Memory, MemoryTier } from '../types';

/**
 * Creates a new structured memory object.
 */
export const createMemory = (text: string, tier: MemoryTier = 'active'): Memory => ({
  id: Date.now().toString(36) + Math.random().toString(36).substr(2),
  text,
  tier,
  timestamp: Date.now(),
  lastAccess: Date.now(),
  importance: tier === 'core' ? 10 : tier === 'active' ? 5 : 1
});

/**
 * Prunes memories based on their tier and last access time.
 * - Core: Never Deleted.
 * - Active: Deleted if not accessed for 14 days.
 * - Sensory: Deleted after 1 day (Short-term noise).
 */
export const pruneMemories = (memories: Memory[]): Memory[] => {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  return memories.filter(m => {
    if (m.tier === 'core') return true; // Never delete core
    
    // Sensory: Delete after 1 day regardless of access
    if (m.tier === 'sensory') {
        return (now - m.timestamp) < ONE_DAY;
    }
    
    // Active: Delete after 14 days of no access (Decay)
    if (m.tier === 'active') {
        return (now - m.lastAccess) < (14 * ONE_DAY);
    }
    
    return true;
  }).sort((a, b) => b.timestamp - a.timestamp); // Keep sorted new to old
};

/**
 * Updates the 'lastAccess' timestamp for memories that were just recalled.
 * This simulates "remembering" and strengthens the memory against decay.
 */
export const updateMemoryAccess = (memories: Memory[], accessedIds: string[]): Memory[] => {
    if (!accessedIds || accessedIds.length === 0) return memories;
    const now = Date.now();
    return memories.map(m => {
        if (accessedIds.includes(m.id)) {
            return { ...m, lastAccess: now };
        }
        return m;
    });
};
