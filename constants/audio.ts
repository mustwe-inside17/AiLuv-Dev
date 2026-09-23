
import { LocationId } from '../types';

export const DATE_BGM = '/audio/bgm_date.mp3'; // Romantic / RnB / Jazz
export const EVENT_BGM = '/audio/bgm_event.mp3'; // Tension / Urgent / Story

// [MARCUS NEW]: Mia's Dual Theme
export const MIA_DAY_BGM = '/audio/bgm_maid_day.mp3'; // Cute / Pop / Maid Theme
export const MIA_NIGHT_BGM = '/audio/bgm_maid_night.mp3'; // Cool / Jazz / Spy Theme

export const LOCATION_BGM: Record<LocationId, string> = {
    home: '/audio/bgm_home.mp3',       // Relaxing / Lo-Fi
    condo: '/audio/bgm_condo.mp3',     // Soft Acoustic
    gym: '/audio/bgm_gym.mp3',         // Upbeat / Phonk
    cafe: '/audio/bgm_cafe.mp3',       // Jazz / Bossa Nova (Busy Cafe)
    office: '/audio/bgm_office.mp3',   // Light Classical / Focus
    market: '/audio/bgm_market.mp3',   // City Pop / Night Vibes
    basement: '/audio/bgm_basement.mp3', // Deep House / Ambient
    cafe_2f: '/audio/bgm_cafe_2f.mp3',  // Acoustic / Piano (Quiet Study Zone)
    mall: '/audio/bgm_mall.mp3',       // Trendy Pop
    gacha_shop: '/audio/bgm_gacha.mp3', // Arcade / Funky
    vet: '/audio/bgm_vet.mp3',          // Healing / Calm
    maid_cafe: '/audio/bgm_maid_day.mp3' // Default fallback (Logic handled in AudioManager)
};

export const SFX = {
    chat_send: '/audio/sfx_send.mp3',
    chat_typing: '/audio/sfx_typing.mp3',
    chat_receive: '/audio/sfx_receive.mp3',
    event_alert: '/audio/sfx_event.mp3',
    task_complete: '/audio/sfx_success.mp3',
    bubble_pop: '/audio/sfx_pop.mp3',
    bubble_wrong: '/audio/sfx_wrong.mp3',
    gacha_roll: '/audio/sfx_gacha_roll.mp3',
    gacha_reveal: '/audio/sfx_gacha_reveal.mp3',
    level_up: '/audio/sfx_levelup.mp3', // NEW: Level Up Sound
    story_item_received: '/audio/sfx_gacha_reveal.mp3',
    story_completed: '/audio/Ailuvsuccess.mp3',
    story_node_success: '/audio/sfx_success.mp3'
};
