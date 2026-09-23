import assert from 'node:assert/strict';
import test from 'node:test';
import { canAffordGiftPurchase, getExpressGiftCost, isGiftDropAccepted } from '../domain/chat/giftFlow';

test('express gifts add the existing 30 percent delivery fee', () => {
    assert.equal(getExpressGiftCost(100), 130);
    assert.equal(getExpressGiftCost(101), 132);
    assert.equal(getExpressGiftCost(-50), 0);
});

test('gift delivery requires a deliberate upward drag', () => {
    assert.equal(isGiftDropAccepted(-107), false);
    assert.equal(isGiftDropAccepted(-108), true);
    assert.equal(isGiftDropAccepted(108), false);
});

test('gift purchase locks against the correct wallet before selection', () => {
    assert.equal(canAffordGiftPurchase('gold', 130, 129, 999), false);
    assert.equal(canAffordGiftPurchase('gold', 130, 130, 0), true);
    assert.equal(canAffordGiftPurchase('diamond', 130, 999, 129), false);
    assert.equal(canAffordGiftPurchase('diamond', 130, 0, 130), true);
});
