import assert from 'node:assert/strict';
import test from 'node:test';
import { RelationshipTier } from '../types';
import { canInviteOnDate, getPartyQuickActionState } from '../domain/chat/quickActions';

test('date quick action requires Friend tier or higher and Chemistry 60', () => {
    assert.equal(canInviteOnDate(RelationshipTier.ACQUAINTANCE, 100), false);
    assert.equal(canInviteOnDate(RelationshipTier.FRIEND, 59), false);
    assert.equal(canInviteOnDate(RelationshipTier.FRIEND, 60), true);
    assert.equal(canInviteOnDate(RelationshipTier.BEST_FRIEND, 80), true);
});

test('party quick action distinguishes empty, current, and occupied slots', () => {
    assert.equal(getPartyQuickActionState('fia', null), 'empty');
    assert.equal(getPartyQuickActionState('fia', 'fia'), 'current');
    assert.equal(getPartyQuickActionState('fia', 'miguel'), 'occupied');
});
