import React from 'react';
import { BadgeCheck, DoorOpen, Image as ImageIcon, KeyRound, Radio, ReceiptText } from 'lucide-react';
import type { KeyStoryItem, StoryThread } from '../../domain/story/types';

export function StoryItemIcon({ icon, size = 24 }: { icon: KeyStoryItem['icon']; size?: number }) {
  if (icon === 'receipt') return <ReceiptText size={size} aria-hidden="true" />;
  if (icon === 'maid_charm') return <KeyRound size={size} aria-hidden="true" />;
  if (icon === 'photo') return <ImageIcon size={size} aria-hidden="true" />;
  if (icon === 'vip_card') return <BadgeCheck size={size} aria-hidden="true" />;
  return <Radio size={size} aria-hidden="true" />;
}

export function StoryThreadIcon({ icon, size = 28 }: { icon: StoryThread['icon']; size?: number }) {
  return icon === 'door' ? <DoorOpen size={size} aria-hidden="true" /> : <Radio size={size} aria-hidden="true" />;
}
