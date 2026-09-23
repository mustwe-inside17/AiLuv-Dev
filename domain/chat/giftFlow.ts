import { ActionType } from '../../types';

export type GiftCurrency = 'gold' | 'diamond';

export interface GiftIntent {
    actionType: ActionType;
    itemId: string;
    itemName: string;
    emoji: string;
    source: 'inventory' | 'express';
    cost: number;
    currency: GiftCurrency;
}

export const getExpressGiftCost = (baseCost: number): number =>
    Math.ceil(Math.max(0, baseCost) * 1.3);

export const canAffordGiftPurchase = (
    currency: GiftCurrency,
    cost: number,
    gold: number,
    diamonds: number
): boolean => currency === 'diamond' ? diamonds >= cost : gold >= cost;

export const isGiftDropAccepted = (verticalDelta: number, minimumDistance = 108): boolean =>
    verticalDelta <= -Math.abs(minimumDistance);

