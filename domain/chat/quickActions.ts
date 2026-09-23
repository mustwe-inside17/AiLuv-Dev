import { CharacterId, RelationshipTier } from '../../types';

const DATE_ALLOWED_TIERS = new Set<RelationshipTier>([
    RelationshipTier.FRIEND,
    RelationshipTier.FLIRTING,
    RelationshipTier.PARTNER,
    RelationshipTier.SOULMATE,
    RelationshipTier.ETERNAL,
    RelationshipTier.BEST_FRIEND,
    RelationshipTier.SOUL_SIBLING
]);

export type PartyQuickActionState = 'empty' | 'current' | 'occupied';

export const canInviteOnDate = (tier: RelationshipTier, chemistryScore: number): boolean =>
    DATE_ALLOWED_TIERS.has(tier) && chemistryScore >= 60;

export const getPartyQuickActionState = (
    characterId: CharacterId,
    partyMemberId?: CharacterId | null
): PartyQuickActionState => {
    if (partyMemberId === characterId) return 'current';
    if (partyMemberId) return 'occupied';
    return 'empty';
};
