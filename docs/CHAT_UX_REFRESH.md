# AiLuv 0.9 — Chat UX Refresh

This build adds the new chat presentation layer while preserving the existing game stores, AI flow, economy, quests, saves, inventory, relationship progression, and character assets.

## Included

- Floating character identity card over the lower edge of the character image on mobile
- Character avatar, name, mood, Love score, voice and story controls in the floating card
- A single lightning-button action hub with four balanced choices: Special Action, Give Gift, Invite on Date, and Invite to Party / Dismiss
- Special-action and gift submenus stay inside the same panel, with clear Back and Close controls so legacy menus cannot overlap
- Gift giving now uses a safe tactile flow: confirm the item or express price, drag the floating item upward to the character, then consume inventory/currency only after a successful handoff
- Confirming a gift hides the action menu for a clear drag-to-character handoff; cancelling the held item returns to the same gift list
- Delivered gifts appear as their real artwork directly in the conversation without a player chat bubble
- Presented Story Keys also appear as standalone artwork and open into a large inspectable view
- Story Flag scenes use short 2–4 bubble performances with character-specific action, emotion and optional inner thought
- Story bubbles now arrive sequentially with the existing typing indicator between each beat
- Key artwork opens in an asset-only lightbox without resizing the information modal
- Episode completion shows the matching Story Journal cover with a green `CLEAR` stamp and plays `public/audio/Ailuvsuccess.mp3`
- Chat gifts and gacha rewards use the local item artwork in `public/assets/items` instead of generic emoji artwork
- Express gifts that exceed the player's current Gold or Diamond balance are visibly disabled before confirmation
- Cancelling gift confirmation or a staged handoff returns to the same open gift menu
- Date lock aligned to Friend tier and Chemistry 60+
- Party slot protection so inviting another character cannot silently replace the current companion
- Mobile touch targets, visible locked-state explanations, keyboard focus rings, and reduced-motion compatibility

## Run locally

1. Copy `.env.example` to `.env.local` and add the required Firebase and Gemini values.
2. Install dependencies with `npm install` or `pnpm install`.
3. Start development mode with `npm run dev` or `pnpm dev`.
4. Create a production export with `npm run build` or `pnpm build`.

The production export is written to `dist/`.
