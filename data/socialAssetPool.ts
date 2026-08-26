
import { CharacterId } from '../types';

// --- DATA STRUCTURE ---
export interface SocialAsset {
    url: string; // Can be https://... (Unsplash) OR Social_Feed/charId/category/filename.jpg (Firebase)
    tags: string[]; // Context tags for AI selection
    allowedChars: CharacterId[] | 'all'; // Permission
    captions: string[]; // Pool of captions
}

// --- ASSET DATABASE (HYBRID: FIREBASE + UNSPLASH) ---
export const SOCIAL_ASSETS: SocialAsset[] = [
    
    // ==========================================
    // 😺 MIGUEL: PET (Tofu Collection 1-8)
    // ==========================================
    
    // Group 1: Standing / Walking / Cute Posing (1-4)
    {
        url: "Social_Feed/miguel/pet/tofu_1.png",
        tags: ['pet', 'cat', 'cute', 'stand', 'pose', 'morning'],
        allowedChars: ['miguel'],
        captions: ["ยืนงงในดงแมว... 🐱", "Model pose! วันนี้เต้าหู้ขอเป็นนายแบบครับ", "ความน่ารักระดับ 10 ริกเตอร์"]
    },
    {
        url: "Social_Feed/miguel/pet/tofu_2.png",
        tags: ['pet', 'cat', 'walk', 'explore', 'curious'],
        allowedChars: ['miguel'],
        captions: ["เดินตรวจงานรอบห้อง... เจ้านายตัวจริงมาแล้ว", "Patrol duty. ใครอนุญาตให้ห้องรก?", "Walking fluffball ☁️"]
    },
    {
        url: "Social_Feed/miguel/pet/tofu_3.png",
        tags: ['pet', 'cat', 'stare', 'cute', 'waiting'],
        allowedChars: ['miguel'],
        captions: ["จ้องหน้าแบบนี้... จะเอาขนมใช่ไหม?", "สายตาอ้อนวอน (หรือกดดัน?)", "Looking at you looking at me."]
    },
    {
        url: "Social_Feed/miguel/pet/tofu_4.png",
        tags: ['pet', 'cat', 'walk', 'fluffy', 'lovely'],
        allowedChars: ['miguel'],
        captions: ["ก้อนขนเดินได้...", "วันสบายๆ ของคุณชายเต้าหู้", "Just being cute."]
    },

    // Group 2: Playing / Toys (5-6)
    {
        url: "Social_Feed/miguel/pet/tofu_5.png",
        tags: ['pet', 'cat', 'play', 'active', 'toy', 'fun'],
        allowedChars: ['miguel'],
        captions: ["ของเล่นใหม่เห่อได้ 5 นาที... 🧶", "พลังเหลือล้นจริงๆ เจ้าก้อน", "Catch me if you can!"]
    },
    {
        url: "Social_Feed/miguel/pet/tofu_6.png",
        tags: ['pet', 'cat', 'play', 'jump', 'crazy'],
        allowedChars: ['miguel'],
        captions: ["ซนจนแจกันแตก... ยังจะมาทำหน้าแบ๊วใส่อีก!", "Playtime! 🧶 วิ่งทั่วห้องเลยจับไม่ทัน", "Cat tornado incoming! 🌪️"]
    },

    // Group 3: Sleeping (7-8)
    {
        url: "Social_Feed/miguel/pet/tofu_7.png",
        tags: ['pet', 'cat', 'sleep', 'night', 'tired'],
        allowedChars: ['miguel'],
        captions: ["ท่านอนกินบ้านกินเมืองมาก... 😴", "แบตหมดแล้วครับ... ชาร์จพลังแป๊บ", "Goodnight world 💤"]
    },
    {
        url: "Social_Feed/miguel/pet/tofu_8.png",
        tags: ['pet', 'cat', 'sleep', 'bed', 'comfort', 'dream'],
        allowedChars: ['miguel'],
        captions: ["เต้าหู้ยึดเตียงไปแล้ว... มิเกลต้องนอนโซฟาหรอ?", "My little sleeping angel. 🐱", "ความอบอุ่น(และหนัก)"]
    },

    // ==========================================
    // ☕ MIGUEL: CAFE
    // ==========================================
    {
        url: "Social_Feed/miguel/cafe/cafe_1.png",
        tags: ['cafe', 'cat', 'coffee', 'cheating'],
        allowedChars: ['miguel'],
        captions: [
            "แอบนอกใจเต้าหู้มาคาเฟ่แมว... อย่าฟ้องเขานะ 🤫🐱", 
            "น้องตัวนี้ขี้อ้อนเหมือนเต้าหู้เลย",
            "Cat therapy day."
        ]
    },
    {
        url: "Social_Feed/miguel/cafe/cafe_2.png",
        tags: ['cafe', 'coffee', 'peat', 'chill'],
        allowedChars: ['miguel'],
        captions: [
            "แวะมาอุดหนุนพี่ชายคนเก่ง @Cat&Cup ☕", 
            "กาแฟร้านพี่พีทอร่อยที่สุดในโลก!",
            "มุมโปรดร้านเดิม เพิ่มเติมคือกาแฟแก้วใหม่"
        ]
    },

    // ==========================================
    // 🍲 MIGUEL: FOOD
    // ==========================================
    {
        url: "Social_Feed/miguel/food/food_1.png",
        tags: ['food', 'lunch', 'spicy', 'thai', 'basil'],
        allowedChars: ['miguel'],
        captions: [
            "กะเพราหมูสับไข่ดาว อาหารสิ้นคิดที่รักที่สุด 🍳🌶️", 
            "เติมพลังมื้อเที่ยงครับ",
            "เผ็ดแต่อร่อย! สู้ตายค่ะ"
        ]
    },
    {
        url: "Social_Feed/miguel/food/food_2.png",
        tags: ['food', 'dinner', 'night', 'yummy', 'noodle'],
        allowedChars: ['miguel'],
        captions: [
            "ผัดไทยต้มยำมื้อดึก... พรุ่งนี้ค่อยลดนะ 🍜", 
            "รางวัลของคนทำงานหนัก",
            "ดึกแล้วลงรูปของกินได้!"
        ]
    },

    // ==========================================
    // 🛋️ MIGUEL: LIFESTYLE
    // ==========================================
    {
        url: "Social_Feed/miguel/lifestyle/lifestyle_1.png",
        tags: ['lifestyle', 'sweet', 'cat', 'funny', 'cake'],
        allowedChars: ['miguel'],
        captions: [
            "สายตาอาฆาต... ไม่ได้นะเต้าหู้ อันนี้ของแม่! 🍰🐱", 
            "ความกดดันระดับ 10 ริกเตอร์ จากแมวข้างๆ",
            "Tea time with (hungry) Tofu."
        ]
    },
    {
        url: "Social_Feed/miguel/lifestyle/lifestyle_2.png",
        tags: ['lifestyle', 'cat', 'tofu', 'plant', 'curious'],
        allowedChars: ['miguel'],
        captions: [
            "อย่ากินน้องนะ! นั่นต้นไม้ฟอกอากาศลูก 🌿", 
            "ความสงสัยของแมวอ้วนกับต้นไม้",
            "Gardening assistant (?) หรือตัวป่วน"
        ]
    },

    // ==========================================
    // 🏙️ MIGUEL: OUTDOOR
    // ==========================================
    {
        url: "Social_Feed/miguel/outdoor/outdoor_1.png",
        tags: ['outdoor', 'view', 'city', 'morning', 'fresh'],
        allowedChars: ['miguel'],
        captions: [
            "Morning AiLuv City ☀️ วันนี้อากาศดีจัง", 
            "รับลมที่ระเบียงก่อนเริ่มงาน",
            "ท้องฟ้าเช้านี้สวยมาก"
        ]
    },
    {
        url: "Social_Feed/miguel/outdoor/outdoor_2.png",
        tags: ['outdoor', 'city', 'traffic', 'evening', 'busy'],
        allowedChars: ['miguel'],
        captions: [
            "เมืองเริ่มวุ่นวายแล้ว... ดีใจที่ทำงานที่ห้อง 🚗", 
            "City vibes. รถติดยาวเหยียดเลย",
            "มองจากตรงนี้สวยดีนะ (แต่ข้างล่างคงร้อนน่าดู)"
        ]
    },
    {
        url: "Social_Feed/miguel/outdoor/outdoor_3.png",
        tags: ['outdoor', 'rain', 'mood', 'dark', 'storm'],
        allowedChars: ['miguel'],
        captions: [
            "ฝนตกอีกแล้ว... บรรยากาศน่านอนมากกว่าทำงาน 🌧️", 
            "Rainy mood. เหงาๆ นิดนึงนะ",
            "ฟ้าครึ้มมาเลย... รีบเก็บผ้าด่วน!"
        ]
    },

    // ==========================================
    // 📸 MIGUEL: SELFIE
    // ==========================================
    {
        url: "Social_Feed/miguel/selfie/selfie_1.png",
        tags: ['selfie', 'pajamas', 'night', 'cute', 'tofu'],
        allowedChars: ['miguel'],
        captions: [
            "ชุดนอนพร้อมนอน (แต่ตายังไม่หลับ) Goodnight world 💤", 
            "เต้าหู้มาแย่งซีนตลอด",
            "Pajama party for one (and a cat)."
        ]
    },
    {
        url: "Social_Feed/miguel/selfie/selfie_2.png",
        tags: ['selfie', 'relax', 'sofa', 'home', 'sister', 'mia'],
        allowedChars: ['miguel'],
        captions: [
            "วันพักผ่อน... (มีอาแอบถ่าย) 📸", 
            "Chilling on sofa. ไม่อยากลุกไปไหนเลย",
            "หน้าสดก็มั่นใจ... มั้งนะ"
        ]
    },

    // ==========================================
    // 📖 MIGUEL: STORY (Lore)
    // ==========================================
    {
        url: "Social_Feed/miguel/story/story_1.png",
        tags: ['story', 'work', 'design', 'sketch', 'vandal', 'jellie'],
        allowedChars: ['miguel'],
        captions: [
            "Draft งาน VANDAL... คุณเจลลี่เป็นแบบที่วาดสนุกมาก 👗✨", 
            "Work in progress. หวังว่าจะผ่านนะ",
            "Fashion sketch time. 🎨"
        ]
    },
    {
        url: "Social_Feed/miguel/story/story_2.png",
        tags: ['story', 'sister', 'mia', 'rare', 'family', 'love'],
        allowedChars: ['miguel'],
        captions: [
            "นานๆ ทีจะมีแขกมาเยี่ยม... น้องสาวคนสวย @Mia 🥰", 
            "Sister time. คิดถึงจังเลย",
            "มีอาแวะมาหา พร้อมขนมเต็มมือ!"
        ]
    },

    // ==========================================
    // 💻 MIGUEL: WORK
    // ==========================================
    {
        url: "Social_Feed/miguel/work/work_1.png",
        tags: ['work', 'desk', 'messy', 'creative', 'computer'],
        allowedChars: ['miguel'],
        captions: [
            "สภาพโต๊ะทำงานวันนี้... รกแปลว่ากำลังใช้ความคิด 🖥️", 
            "My Creative Zone. (ห้ามใครแตะ!)",
            "พร้อมลุยงานยาวๆ คืนนี้"
        ]
    },
    {
        url: "Social_Feed/miguel/work/work_2.png",
        tags: ['work', 'focus', 'candid', 'sister'],
        allowedChars: ['miguel'],
        captions: [
            "Focus mode. (Photo by Mia) 🤓", 
            "ปั่นงานไฟลุก! Deadline is watching.",
            "ตั้งใจทำงานอยู่นะคะ ไม่ได้อู้นะ"
        ]
    },
    {
        url: "Social_Feed/miguel/work/work_3.png",
        tags: ['work', 'drawing', 'art', 'paper', 'sketch'],
        allowedChars: ['miguel'],
        captions: [
            "Sketching ideas... ชอบฟีลลิ่งดินสอบนกระดาษจัง ✏️", 
            "Back to basics. พักสายตาจากหน้าจอ",
            "Drafting VANDAL Poster."
        ]
    },

    // ==========================================
    // 🏋️‍♀️ FIA: UNSPLASH MOCKS
    // ==========================================
    {
        url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
        tags: ['gym', 'workout', 'weights', 'focus'],
        allowedChars: ['fia'],
        captions: ["Empty gym = My paradise. 💪", "มาก่อนเปิดร้านตลอด... เพื่อความสงบ", "Focus on the goal."]
    },
    {
        url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop",
        tags: ['food', 'healthy', 'salad', 'clean'],
        allowedChars: ['fia'],
        captions: ["Fuel for the body. 🥗 (จริงๆ อยากกินหมูกระทะ)", "Clean eating day 45.", "Green power!"]
    },
    {
        url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2069&auto=format&fit=crop",
        tags: ['outdoor', 'run', 'shoes', 'morning'],
        allowedChars: ['fia'],
        captions: ["Morning cardio done. 🏃‍♀️", "รองเท้าคู่ใจกับถนนโล่งๆ", "Start strong."]
    },
    {
        url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop",
        tags: ['gym', 'late', 'tired', 'night'],
        allowedChars: ['fia'],
        captions: ["Last one standing. ปิดยิมค่ะ 🌙", "เหนื่อยแต่คุ้ม", "Leg day destroyed me."]
    },

    // ==========================================
    // ☕ PEAT: UNSPLASH MOCKS
    // ==========================================
    {
        url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop",
        tags: ['cafe', 'coffee', 'pour', 'barista'],
        allowedChars: ['peat'],
        captions: ["Perfect pour. ☕", "ตั้งใจทำทุกแก้วครับ", "Morning brew at Cat & Cup."]
    },
    {
        url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2070&auto=format&fit=crop",
        tags: ['cafe', 'interior', 'cozy', 'empty'],
        allowedChars: ['peat'],
        captions: ["มุมสงบก่อนร้านเปิด... 🌿", "Waiting for you all.", "ร้านเงียบๆ ก็สวยไปอีกแบบนะครับ"]
    },
    {
        url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop",
        tags: ['food', 'bakery', 'croissant', 'cafe'],
        allowedChars: ['peat'],
        captions: ["อบเสร็จร้อนๆ ครับ 🥐", "กลิ่นเนยหอมฟุ้งทั้งร้านเลย", "ทานคู่กาแฟร้อนคือดีที่สุด"]
    },
    {
        url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop",
        tags: ['pet', 'cat', 'cafe', 'sleep'],
        allowedChars: ['peat'],
        captions: ["พนักงานต้อนรับหลับอู้งานอีกแล้ว... 😺", "เจ้าลมหนาว (Lom Nhao) ประจำร้าน", "ใครแวะมาอย่าลืมเกาคางน้องนะครับ"]
    },

    // ==========================================
    // 💼 MARCUS: UNSPLASH MOCKS
    // ==========================================
    {
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
        tags: ['work', 'office', 'view', 'rich'],
        allowedChars: ['marcus'],
        captions: ["Late night at the office. 🏙️", "วิวเดิมๆ แต่งานไม่เคยเหมือนเดิม", "Building the empire."]
    },
    {
        url: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=2574&auto=format&fit=crop",
        tags: ['lifestyle', 'car', 'drive', 'luxury'],
        allowedChars: ['marcus'],
        captions: ["Heading home. 🚗", "Traffic therapy.", "Finally some quiet time."]
    },
    {
        url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1974&auto=format&fit=crop",
        tags: ['work', 'coffee', 'laptop', 'focus'],
        allowedChars: ['marcus'],
        captions: ["Morning meeting prep. ☕", "กาแฟดำไม่ใส่น้ำตาล เหมือนชีวิตตอนนี้", "Strategy session."]
    },
    {
        url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop",
        tags: ['night', 'bar', 'drink', 'relax'],
        allowedChars: ['marcus'],
        captions: ["Closing the deal. 🥃", "Private lounge.", "Sometimes you just need a drink."]
    },

    // ==========================================
    // 🎧 LUCAS: UNSPLASH MOCKS
    // ==========================================
    {
        url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop",
        tags: ['music', 'studio', 'dark', 'synth'],
        allowedChars: ['lucas'],
        captions: ["Cooking up something new. 🎹", "3 AM vibe.", "The basement never sleeps."]
    },
    {
        url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2070&auto=format&fit=crop",
        tags: ['mood', 'rain', 'window', 'dark'],
        allowedChars: ['lucas'],
        captions: ["Rain noise... best sample. 🌧️", "Mood.", "ไม่อยากออกไปไหนเลย"]
    },
    {
        url: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=1887&auto=format&fit=crop",
        tags: ['pet', 'cat', 'black', 'glitz'],
        allowedChars: ['lucas'],
        captions: ["Glitz (ไอ้ถ่าน) จ้องอะไร... 🐈‍⬛", "My only roommate.", "Guardian of the studio."]
    },
    {
        url: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop",
        tags: ['lifestyle', 'surf', 'sea', 'escape'],
        allowedChars: ['lucas'],
        captions: ["หนีมาทะเลแป๊บ... 🌊", "Need fresh air.", "Sound hunting at the beach."]
    },

    // ==========================================
    // 🛍️ JELLIE: UNSPLASH MOCKS
    // ==========================================
    {
        url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        tags: ['shopping', 'fashion', 'rich', 'bags'],
        allowedChars: ['jellie'],
        captions: ["VANDAL New Collection research. 🛍️", "ไม่ได้ช็อปนะ แค่ดูงาน (จริงๆ)", "My kind of cardio."]
    },
    {
        url: "https://images.unsplash.com/photo-1512418490979-92798cec1380?q=80&w=2070&auto=format&fit=crop",
        tags: ['work', 'design', 'sketch', 'fashion'],
        allowedChars: ['jellie'],
        captions: ["Next season is gonna be 🔥", "Drafting dreams.", "ห้ามก๊อปนะยะ!"]
    },
    {
        url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop",
        tags: ['lifestyle', 'luxury', 'home', 'decor'],
        allowedChars: ['jellie'],
        captions: ["Home sweet home. ✨", "Interior goals.", "พักผ่อนแบบตัวแม่"]
    },
    {
        url: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=2029&auto=format&fit=crop",
        tags: ['party', 'event', 'champagne', 'social'],
        allowedChars: ['jellie'],
        captions: ["Cheers to success! 🥂", "Launch party vibes.", "เหนื่อยปั้นหน้าแต่ก็ต้องมา"]
    },

    // ==========================================
    // 🐾 SOUL: UNSPLASH MOCKS
    // ==========================================
    {
        url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2070&auto=format&fit=crop",
        tags: ['pet', 'dog', 'walk', 'nature'],
        allowedChars: ['soul'],
        captions: ["พานิกกิมาเดินเล่นครับ 🐕", "She loves the grass.", "Peaceful evening."]
    },
    {
        url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop",
        tags: ['work', 'hospital', 'clean', 'white'],
        allowedChars: ['soul'],
        captions: ["Clinic is quiet today. 🏥", "Ready for night shift.", "Clean space, clear mind."]
    },
    {
        url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2070&auto=format&fit=crop",
        tags: ['lifestyle', 'book', 'reading', 'quiet'],
        allowedChars: ['soul'],
        captions: ["Reading helps me recharge. 📖", "Lost in philosophy.", "ช่วงเวลาพักผ่อนของหมอ"]
    },
    {
        url: "https://images.unsplash.com/photo-1596796929737-97d8cc693766?q=80&w=2070&auto=format&fit=crop",
        tags: ['pet', 'cat', 'rescue', 'healing'],
        allowedChars: ['soul'],
        captions: ["คนไข้ตัวน้อยวันนี้... 🐱", "Healing nicely.", "สู้ๆ นะตัวเล็ก"]
    },

    // ==========================================
    // 🎭 MIA: UNSPLASH MOCKS
    // ==========================================
    {
        url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2070&auto=format&fit=crop",
        tags: ['maid', 'food', 'dessert', 'cute'],
        allowedChars: ['mia'],
        captions: ["Oishii! อิคุระร่ายมนต์ใส่แล้วนะ 🍰✨", "Sweet treat for Master.", "Maid cafe special."]
    },
    {
        url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2070&auto=format&fit=crop",
        tags: ['spy', 'city', 'night', 'dark'],
        allowedChars: ['mia'],
        captions: ["Night watch. 🌃", "The city hides many secrets.", "Mission started."]
    },
    {
        url: "https://images.unsplash.com/photo-1522335789203-abd652327ed8?q=80&w=2087&auto=format&fit=crop",
        tags: ['fashion', 'makeup', 'mirror', 'beauty'],
        allowedChars: ['mia'],
        captions: ["Getting ready... 💄", "Mask on.", "Perfect look for tonight."]
    },
    {
        url: "https://images.unsplash.com/photo-1533228876829-65c94e7b5025?q=80&w=2070&auto=format&fit=crop",
        tags: ['party', 'cocktail', 'luxury', 'observe'],
        allowedChars: ['mia'],
        captions: ["Observing from the shadows. 🍸", "Blend in.", "Target sighted."]
    },

    // ==========================================
    // 💃 ERIN: UNSPLASH (Additional)
    // ==========================================
    // ==========================================
    // ✨ BAM: FIREBASE STORAGE
    // ==========================================
    {
        url: "Social_Feed/bam/cafe/cafe_1.png",
        tags: ['cafe', 'coffee', 'study', 'morning'],
        allowedChars: ['bam'],
        captions: ["Morning coffee to start the brain ☕", "หาที่สงบๆ อ่านหนังสือ", "พร้อมลุยอ่านหนังสือแล้ว!"]
    },
    {
        url: "Social_Feed/bam/cafe/cafe_2.png",
        tags: ['cafe', 'relax', 'chill'],
        allowedChars: ['bam'],
        captions: ["ชิลๆ ที่คาเฟ่โปรด 🍰", "Cafe hopping day.", "หลบมุมมาพักใจ"]
    },
    {
        url: "Social_Feed/bam/food/food_1.png",
        tags: ['food', 'sweets', 'dessert', 'cafe'],
        allowedChars: ['bam'],
        captions: ["เติมน้ำตาลเข้าเส้นเลือด 🍓", "ของหวานเยียวยาทุกสิ่ง", "อร่อยจนหยุดไม่ได้จริงๆ"]
    },
    {
        url: "Social_Feed/bam/food/food_2.png",
        tags: ['food', 'dinner', 'yummy'],
        allowedChars: ['bam'],
        captions: ["มื้อเย็นจัดเต็ม! 🍲", "Food is happiness.", "กินคาวไม่กินหวานสันดานไพร่"]
    },
    {
        url: "Social_Feed/bam/lifestyle/lifestyle_1.png",
        tags: ['lifestyle', 'chill', 'day'],
        allowedChars: ['bam'],
        captions: ["วันสบายๆ 🌸", "Chill day.", "พักผ่อนบ้างอะไรบ้าง"]
    },
    {
        url: "Social_Feed/bam/lifestyle/lifestyle_2.png",
        tags: ['lifestyle', 'hobby', 'fun'],
        allowedChars: ['bam'],
        captions: ["กิจกรรมยามว่าง 🎨", "ทำในสิ่งที่รัก", "My comfort zone."]
    },
    {
        url: "Social_Feed/bam/outdoor/outdoor_1.png",
        tags: ['outdoor', 'nature', 'park', 'relax'],
        allowedChars: ['bam'],
        captions: ["แวะมาสูดอากาศบริสุทธิ์หน่อย 🍃", "Nature therapy.", "อยากหยุดเวลาไว้ตรงนี้จัง"]
    },
    {
        url: "Social_Feed/bam/outdoor/outdoor_2.png",
        tags: ['outdoor', 'walk', 'sun', 'fresh'],
        allowedChars: ['bam'],
        captions: ["เดินเล่นรับแดด ☀️", "Sunny day vibes.", "ท้องฟ้าวันนี้สวยจัง"]
    },
    {
        url: "Social_Feed/bam/selfie/selfie_1.png",
        tags: ['selfie', 'smile', 'face'],
        allowedChars: ['bam'],
        captions: ["แวะมาทักทายค่ะ 😊", "Selfie time!", "ยิ้มรับวันใหม่"]
    },
    {
        url: "Social_Feed/bam/selfie/selfie_2.png",
        tags: ['selfie', 'cute', 'mood'],
        allowedChars: ['bam'],
        captions: ["วันนี้แต่งหน้าโอเคไหม? ✨", "Feeling good today.", "เซลฟี่ซะหน่อยก่อนออกบ้าน"]
    },
    {
        url: "Social_Feed/bam/story/story_1.png",
        tags: ['story', 'night', 'stars', 'dream', 'sky'],
        allowedChars: ['bam'],
        captions: ["Look at the stars... ✨", "Dreaming big.", "คืนนี้ดาวสวยจัง"]
    },
    {
        url: "Social_Feed/bam/story/story_2.png",
        tags: ['story', 'mood', 'thoughts'],
        allowedChars: ['bam'],
        captions: ["ดึกแล้วคิดอะไรเพลินๆ 🌙", "Night thoughts.", "พรุ่งนี้ต้องดีกว่าเดิม"]
    },
    {
        url: "Social_Feed/bam/work/work_1.png",
        tags: ['work', 'focus', 'grind'],
        allowedChars: ['bam'],
        captions: ["ลุยงานต่อไม่รอแล้วนะ 💻", "Focus mode on.", "ใกล้ความจริงแล้ว!"]
    },
    {
        url: "Social_Feed/bam/work/work_2.png",
        tags: ['work', 'tired', 'effort'],
        allowedChars: ['bam'],
        captions: ["ทำงานจนตาแฉะ 😵", "Hard work pays off.", "ขอกำลังใจหน่อยค่า"]
    },

    // ==========================================
    // 👗 ERIN: FIREBASE STORAGE
    // ==========================================
    {
        url: "Social_Feed/erin/lifestyle/lifestyle_1.png",
        tags: ['lifestyle', 'fashion', 'style', 'day', 'shoot'],
        allowedChars: ['erin'],
        captions: ["Take me back to Italy... 🇮🇹", "Vacation mood.", "Wanderlust."]
    },
    {
        url: "Social_Feed/erin/lifestyle/lifestyle_2.png",
        tags: ['lifestyle', 'chill', 'luxury'],
        allowedChars: ['erin'],
        captions: ["Sunday brunch vibes. 🥂", "Living my best life.", "Elegance is an attitude."]
    },
    {
        url: "Social_Feed/erin/selfie/selfie_1.png",
        tags: ['selfie', 'face', 'glamour'],
        allowedChars: ['erin'],
        captions: ["Just checking in. ✨", "Golden hour.", "Felt cute."]
    },
    {
        url: "Social_Feed/erin/selfie/selfie_2.png",
        tags: ['selfie', 'makeup', 'look'],
        allowedChars: ['erin'],
        captions: ["Flawless. 💋", "Ready for the night.", "Makeup by me."]
    },
    {
        url: "Social_Feed/erin/story/story_1.png",
        tags: ['story', 'night', 'drink', 'bar', 'friends'],
        allowedChars: ['erin'],
        captions: ["Girls night out! 🥂", "Sipping something good.", "A little fun never killed nobody."]
    },
    {
        url: "Social_Feed/erin/story/story_2.png",
        tags: ['story', 'party', 'event'],
        allowedChars: ['erin'],
        captions: ["What an event! 🎉", "The energy here is insane.", "Living for these moments."]
    },
    {
        url: "Social_Feed/erin/work/work_1.png",
        tags: ['work', 'model', 'shoot'],
        allowedChars: ['erin'],
        captions: ["Behind the scenes. ✨", "Strike a pose.", "Work hard, shine harder."]
    },
    {
        url: "Social_Feed/erin/work/work_2.png",
        tags: ['work', 'glamour', 'set'],
        allowedChars: ['erin'],
        captions: ["On set today. 📸", "Making magic happen.", "Love what I do."]
    }
];

// --- [MARCUS NEW]: SMART ASSET SELECTOR ---
export const getSmartSocialAsset = (charId: CharacterId, contextTags: string[]): { url: string, caption: string, tags: string[] } => {
    // 1. Filter by Character
    let candidates = SOCIAL_ASSETS.filter(asset => 
        asset.allowedChars === 'all' || asset.allowedChars.includes(charId)
    );

    // 2. Score by Tags
    const scoredCandidates = candidates.map(asset => {
        const matches = asset.tags.filter(tag => contextTags.includes(tag)).length;
        return { asset, score: matches };
    });

    // 3. Sort by Score Descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    // 4. Pick Pool (Top Score or High Score)
    let selectionPool = scoredCandidates;
    if (scoredCandidates.length > 0) {
        const maxScore = scoredCandidates[0].score;
        if (maxScore > 0) {
            selectionPool = scoredCandidates.filter(c => c.score >= Math.max(1, maxScore - 1));
        }
    }

    // Safety Fallback
    if (selectionPool.length === 0) {
        return {
            url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
            caption: "Just living life.",
            tags: ["life"]
        };
    }

    // 5. Random Select from Pool
    const selected = selectionPool[Math.floor(Math.random() * selectionPool.length)].asset;
    
    // 6. Random Caption
    const caption = selected.captions[Math.floor(Math.random() * selected.captions.length)];

    return {
        url: selected.url,
        caption: caption,
        tags: selected.tags
    };
};
