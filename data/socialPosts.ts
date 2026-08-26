
import { CharacterId } from '../types';
import { CHARACTER_DATA } from '../constants';

export interface SocialPost {
    id: string;
    characterId: CharacterId;
    imageUrl: string;
    caption: string;
    likes: number;
    timestamp: string;
    location?: string;
    hashtags: string[];
    isLiked?: boolean;
    comments?: { user: string, text: string }[];
}

export const MOCK_STORIES: CharacterId[] = ['miguel', 'erin', 'fia', 'lucas', 'jellie'];

export const MOCK_POSTS: SocialPost[] = [
    {
        id: 'post_miguel_1',
        characterId: 'miguel',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop',
        caption: 'แอบถ่ายตอนหลับ... อย่าฟ้องเจ้าของหอนะ 🤫🐱',
        likes: 142,
        timestamp: '2h ago',
        location: 'My Condo',
        hashtags: ['#TofuTheCat', '#CatLover', '#Secret'],
        comments: [
            { user: 'lucas', text: 'แมวน่ารักครับ...' },
            { user: 'bam', text: 'งื้ออออ อยากไปเล่นด้วยยย' }
        ]
    },
    {
        id: 'post_fia_1',
        characterId: 'fia',
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop',
        caption: 'No Pain No Gain! 💪 วันนี้ใครเบี้ยวคลาส เดี๋ยวจะโดนทำโทษนะ!',
        likes: 856,
        timestamp: '5h ago',
        location: 'Iron Paradise Gym',
        hashtags: ['#FitnessMotivation', '#LegDay', '#CoachFia'],
        comments: [
            { user: 'erin', text: 'เบาๆ หน่อยแม่ กระดูกจะหัก' }
        ]
    },
    {
        id: 'post_erin_1',
        characterId: 'erin',
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop',
        caption: 'Tonight was lit! 🔥 ขอบคุณทุกคนที่มาจอยกันนะ Love u all!',
        likes: 2400,
        timestamp: '1d ago',
        location: 'Night Sky Market',
        hashtags: ['#PartyQueen', '#NightLife', '#DJLife'],
        comments: []
    },
    {
        id: 'post_marcus_1',
        characterId: 'marcus',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
        caption: 'Another day, another deal. ความสำเร็จไม่ได้มาเพราะโชคช่วย.',
        likes: 56,
        timestamp: '1d ago',
        location: 'Co-Working Space',
        hashtags: ['#Hustle', '#Business', '#CEO'],
        comments: [
            { user: 'jellie', text: 'ลุงคะ โอนงบเพิ่มด้วยค่ะ' }
        ]
    },
    {
        id: 'post_lucas_1',
        characterId: 'lucas',
        imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop',
        caption: 'New beat. Coming soon. 🎧',
        likes: 120,
        timestamp: '2d ago',
        location: 'The Basement',
        hashtags: ['#Producer', '#LoFi', '#NYX'],
        comments: []
    },
    {
        id: 'post_jellie_1',
        characterId: 'jellie',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
        caption: 'VANDAL New Collection. เตรียมเงินให้พร้อมนะพวกยาจก 🛍️✨',
        likes: 8900,
        timestamp: '3h ago',
        location: 'Fashion Mall',
        hashtags: ['#VANDAL', '#Fashion', '#RichLife'],
        comments: [
            { user: 'erin', text: 'ส่งมาให้ลองหน่อยสิ' },
            { user: 'jellie', text: '@erin ซื้อเองสิยะ!' }
        ]
    }
];
