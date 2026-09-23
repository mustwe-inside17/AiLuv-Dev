# Story System patch — 14 September 2026

Changes:
- Added a dedicated Story Router before normal chat, energy charges and date recognition. Invalid button payloads never become ordinary AI prompts.
- Active Story Session records the next node and is reconstructed from validated receipts on reload, including old saves. Other started threads can resume after completion.
- Every playable node has a visible continuation action above chat input. Steps requiring another location/character link to the story journal. Terminal nodes show completion feedback.
- Typed action labels and authored player actions work identically to buttons. Short confirmations such as “ต่อเลย”, “เปิดเลยค่ะ” and “continue” use the active session. Negated/hypothetical free text does not advance the story.
- Incomplete/invalid AI output, offline errors and a 20-second timeout use the existing authored scene. State is committed only after rechecking account, location, prerequisites and receipts. AI does not grant rewards or canonical flags.
- Typed actions record source=chat. Buttons record source=button. Keys remain non-consumable and repeated commands do not duplicate rewards.
- Refreshed the previously out-of-sync package-lock.json to enable dependency installation.

Validation:
- TypeScript check passed.
- 35 automated tests passed: both threads through Trigger → Flag → Key Item → Completion using button payloads, typed labels and authored actions; save migration, fallback, timeout, malformed payloads, wrong recipients, locked locations, duplicate grants and spoiler checks.
- Production build passed. Existing bundle-size and mixed-import warnings remain.
- No live Gemini credentials were provided. Real model performance and authenticated cloud/browser play were not tested. Offline and malformed-model behavior was tested with controlled responses.

Run:
  npm ci --legacy-peer-deps
  npm test
  npm run lint
  npm run build

Thread routes (unchanged canon):
- NYX: Fia at gym → open locker → key_nyx_radio → Erin at market → radio.episode_complete. Love 0.
- Cat food: Miguel at condo (Love 200) → open door → receipt → Bam at cafe_2f → maid charm → Miguel → photo → Mia at maid_cafe → VIP card → Soul at vet → cat_food.episode_complete.

The original source documents are retained as project reference material. This patch implements the user's requested fallback and session behavior where older documents describe the previous behavior.
