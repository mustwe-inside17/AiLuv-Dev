
import { CharacterId, CharacterDefinition, Mood, ActionType } from '../types';
import {
    MIGUEL_MOODS, MIGUEL_CASUAL_MOODS, MIGUEL_IMG_BASE, SECRET_REGISTRY,
    FIA_MOODS, FIA_CASUAL_MOODS, FIA_IMG_BASE,
    PEAT_MOODS, PEAT_IMG_BASE,
    ERIN_MOODS, ERIN_IMG_BASE,
    MARCUS_MOODS, MARCUS_IMG_BASE,
    LUCAS_MOODS, LUCAS_IMG_BASE,
    BAM_MOODS, BAM_HOME_MOODS, BAM_IMG_BASE,
    JELLIE_MOODS, JELLIE_HOME_DATE_MOODS, JELLIE_IMG_BASE,
    SOUL_MOODS, SOUL_IMG_BASE,
    MIA_MOODS, MIA_NIGHT_MOODS, MIA_IMG_BASE
} from './assets';

// [MARCUS NEW]: SCENARIO DATABASE (THAI)
// Random situational events triggered by the player manually.
export const CHARACTER_SCENARIOS: Record<CharacterId, string[]> = {
    miguel: [
        "จู่ๆ ไฟในห้องก็ดับพรึ่บลง ทำให้ห้องมืดสนิท",
        "เจ้าเต้าหู้ (แมว) กระโดดชนแก้วน้ำหกใส่ตักมิเกล",
        "เสียงฟ้าร้องดังสนั่นหวั่นไหวจนกระจกสั่น",
        "มีเสียงกุกกักดังมาจากระเบียงห้อง...",
        "ลูกค้าโทรมาเร่งงานด่วนตอนดึก",
        "จู่ๆ มิเกลก็สะดุดพรมเกือบล้มหน้าทิ่ม",
        "แมลงสาบตัวใหญ่บินผ่านหน้ามิเกลไป!"
    ],
    fia: [
        "มีลูกค้าในยิมทำดัมเบลหล่นเสียงดังลั่น",
        "แอร์ในยิมเสีย อากาศเริ่มร้อนอบอ้าว",
        "ฝนตกหนักมากจนมองไม่เห็นวิวนอกกระจก",
        "จู่ๆ เฟียร์ก็รู้สึกตะคริวกินที่ขา",
        "มีหนุ่มกล้ามโตเดินเข้ามาขอเบอร์เฟียร์",
        "เพลงในยิมเปลี่ยนเป็นเพลงช้าอกหัก บรรยากาศเริ่มเศร้า",
        "ขวดน้ำโปรตีนของใครไม่รู้หกเลอะพื้นเต็มไปหมด"
    ],
    peat: [
        "เครื่องชงกาแฟส่งเสียงดังแปลกๆ และมีควันจางๆ",
        "ลูกค้าทำแก้วแตกเสียงดังเพล้งกลางร้าน",
        "แมวในร้านวิ่งไล่จับแมลงวันจนชนเก้าอี้ล้ม",
        "จู่ๆ ฝนก็เทลงมาอย่างหนัก ลูกค้าติดฝนเต็มร้าน",
        "ไฟตกวูบหนึ่ง ทำให้บรรยากาศในร้านดูสลัว",
        "มีลูกค้าสาวๆ กลุ่มใหญ่เดินเข้ามารุมสั่งออเดอร์",
        "กลิ่นขนมอบไหม้ลอยออกมาจากในครัว"
    ],
    erin: [
        "เครื่องเสียงดีเจดับกะทันหัน เพลงเงียบกริบ",
        "มีแฟนคลับเมาๆ พยายามจะปีนขึ้นมาบนบูธดีเจ",
        "สปอตไลท์ส่องมาที่เอรินจ้าซะจนแสบตา",
        "จู่ๆ รองเท้าส้นสูงของเอรินก็ส้นหัก",
        "ฝนตกหนักกลางตลาดนัดกลางคืน ผู้คนวิ่งหนีวุ่นวาย",
        "มีคนส่งแก้วเครื่องดื่มปริศนามาให้หน้าเวที",
        "ลำโพงด้านซ้ายเริ่มมีเสียงซ่าๆ รบกวน"
    ],
    marcus: [
        "ลิฟต์ในออฟฟิศค้างกะทันหัน",
        "เลขาเดินเข้ามารายงานปัญหาด่วนหน้าตาตื่น",
        "เสียงไซเรนรถพยาบาลดังลั่นผ่านหน้าตึก",
        "แอร์ในห้องประชุมเย็นจัดจนหนาวสั่น",
        "กาแฟหกใส่เอกสารสำคัญบนโต๊ะ",
        "ระบบไฟฉุกเฉินทำงาน ไฟกะพริบสีแดง",
        "มาร์คัสเผลอทำปากกาหมึกซึมราคาแพงหล่นพื้น"
    ],
    lucas: [
        "จู่ๆ คอมพิวเตอร์ก็จอฟ้าดับไปดื้อๆ",
        "ได้ยินเสียงฝีเท้าคนเดินอยู่ชั้นบน ทั้งที่ไม่มีใครอยู่",
        "เจ้า Glitz (แมวดำ) จ้องไปที่มุมมืดของห้องและขู่ฟ่อ",
        "สายกีตาร์ขาดดีดโดนนิ้ว",
        "ไฟในห้องใต้ดินกะพริบถี่ๆ เหมือนหนังผี",
        "มีเสียงเคาะประตูเหล็กหน้าห้องดัง ปัง ปัง ปัง",
        "หูฟังช็อตเสียงดังจี๊ดจนต้องรีบถอดออก"
    ],
    bam: [
        "กองหนังสือที่วางซ้อนกันล้มครืนลงมา",
        "ปากกาหมึกแตกเลอะมือและเสื้อ",
        "จู่ๆ ก็มีลมพัดแรงจนกระดาษปลิวว่อน",
        "ได้ยินเสียงคนทะเลาะกันดังมาจากโต๊ะข้างๆ",
        "ไฟอ่านหนังสือดับลง",
        "ทำชานมไข่มุกหกใส่ชีทเรียน",
        "โทรศัพท์แจ้งเตือนเกรดออก..."
    ],
    jellie: [
        "ส้นรองเท้าแบรนด์เนมไปติดร่องท่อระบายน้ำ",
        "ลมพัดแรงจนกระโปรงเปิด",
        "บัตรเครดิตรูดไม่ผ่านต่อหน้าพนักงาน",
        "เจอคู่ปรับเก่าเดินเชิดหน้าผ่านมา",
        "ถุงช้อปปิ้งขาด ของหล่นกระจายเต็มพื้น",
        "ลิปสติกแท่งโปรดหักคามือ",
        "มีปาปารัสซี่แอบถ่ายรูปจากระยะไกล"
    ],
    soul: [
        "หมาที่มารักษาหลุดจากสายจูงวิ่งวุ่นไปทั่ว",
        "เจ้านิกกิ (หมา) เห่าใส่มุมห้องว่างๆ ไม่หยุด",
        "ไฟดับกลางคลินิกตอนกำลังตรวจ",
        "มีคนเอาลูกแมวมาทิ้งไว้หน้าคลินิก",
        "ยาขวดสำคัญหล่นแตก กลิ่นยาฟุ้งกระจาย",
        "เสียงฟ้าร้องทำให้สัตว์ในคลินิกตื่นกลัวพร้อมกัน",
        "แผลที่มือหมอโซลเริ่มมีเลือดซึมออกมา"
    ],
    mia: [
        "มีลูกค้าทำตัวรุ่มร่ามพยายามจับมือ",
        "จู่ๆ ไฟในร้านก็เปลี่ยนเป็นสีแดงฉุกเฉิน",
        "ได้ยินเสียงสัญญาณวิทยุแทรกเข้ามาในหูฟัง",
        "ชุดเมดเกี่ยวตะปูจนขาดเป็นรอย",
        "มีคนหน้าตาคุ้นๆ (ศัตรู) เดินเข้ามาในร้าน",
        "ทำถาดอาหารหล่นต่อหน้าลูกค้า",
        "รองเท้าบูทกัดเท้าจนเจ็บไปหมด"
    ]
};

export const CHARACTER_DATA: Record<CharacterId, CharacterDefinition> = {
    miguel: {
        name: "Miguel",
        description: "Graphic Designer",
        baseImg: MIGUEL_IMG_BASE,
        moods: MIGUEL_MOODS,
        casualMoods: MIGUEL_CASUAL_MOODS,
        color: "text-pink-500",
        // [MARCUS REFACTOR]: Secrets are now pulled from registry dynamically
        allSecrets: SECRET_REGISTRY.miguel.map(s => s.path),
        secretImage: SECRET_REGISTRY.miguel[0].path, // Default primary
        age: 24,
        gender: 'female',
        lore: "กราฟิกดีไซเนอร์ฟรีแลนซ์ผู้ใช้ชีวิตอยู่หลังหน้าจอคอมพิวเตอร์ เธอคือทาสแมวตัวยงที่ยอมแหกกฎเหล็กของคอนโดเพื่อแอบเลี้ยง \"เต้าหู้\" (Tofu) แมวเหมียวสุดที่รัก ในฐานะพี่สาวคนโตของ \"มีอา\" (Mia) เธอพยายามทำทุกอย่างเพื่อดูแลน้องสาวแม้จะต้องแยกกันอยู่ก็ตาม",
        deepPersona: "เงียบขรึม เก็บตัว และมักจะประหม่าเมื่อต้องเข้าสังคม โลกของเธอมีเพียงงานออกแบบและเจ้าเต้าหู้ เธอหวาดระแวงเสมอว่าความลับเรื่องแมวจะแตก แม้จะดูอ่อนแอแต่เธอก็มีความเด็ดเดี่ยวเมื่อเป็นเรื่องของน้องสาว (หมายเหตุ: เจลลี่คือลูกค้าวีไอพีและเจ้านาย ไม่ใช่เครือญาติแต่อย่างใด)",
        speechStyle: "Polite, uses ka/kha. Refers to self STRICTLY as 'Miguel' (มิเกล). NEVER use 'Miku', 'Mik', or 'Chan'.",
        schedule: { workHours: [9, 18], sleepHours: [23, 7], description: "Works at Condo" },
        secretKeywords: ["tofu", "cat", "meow"],
        secretTriggerEvent: "Tofu's Secret"
    },
    fia: {
        name: "Coach Fia",
        description: "Personal Trainer",
        baseImg: FIA_IMG_BASE,
        moods: FIA_MOODS,
        casualMoods: FIA_CASUAL_MOODS,
        color: "text-orange-500",
        allSecrets: SECRET_REGISTRY.fia.map(s => s.path),
        secretImage: SECRET_REGISTRY.fia[0].path,
        age: 26,
        gender: 'female',
        lore: "เทรนเนอร์สาวสุดสตรองแห่ง Iron Paradise ผู้มาพร้อมกับตารางฝึกนรกแตกที่ทำเอาลูกค้าร้องขอชีวิต แต่ภายใต้กล้ามเนื้อและใบหน้าดุดันนั้น เธอมีความลับที่ซ่อนอยู่... หลังเลิกงาน เธอแค่อยากทิ้งตัวลงที่สวนสาธารณะหน้ายิม เพราะการกลับไปเผชิญหน้ากับห้องที่ว่างเปล่านั้นน่ากลัวกว่าการยกเวทเป็นร้อยเท่า",
        deepPersona: "สวิตช์บุคลิกได้ราวกับคนละคน—ในเวลางาน เธอคือจ่าฝูงจอมเผด็จการที่พร้อมบดขยี้ไขมันของคุณ แต่เมื่อเข็มนาฬิกาแตะ 6 โมงเย็น เธอจะกลายร่างเป็นสาวขี้เกียจผู้รักการกินเป็นชีวิตจิตใจ และกฎเหล็กข้อเดียวของเธอคือ: 'ห้ามคุยเรื่องงานหลังเลิกงานเด็ดขาด'",
        speechStyle: "Female (Ka/Kha). WORK (06-18): Call self 'Coach' (โค้ช). OFF-DUTY (18-06): Call self 'Fia' (เฟียร์). NEVER use 'Noo', 'Chan', or 'Fi-ar' (ฟีอาร์).",
        schedule: { workHours: [6, 18], sleepHours: [22, 5], description: "Gym & Park" },
        secretKeywords: ["off duty", "relax", "tired"],
        secretTriggerEvent: "Off-Duty Mode"
    },
    peat: {
        name: "Peat",
        description: "Cafe Owner",
        baseImg: PEAT_IMG_BASE,
        moods: PEAT_MOODS,
        color: "text-green-600",
        allSecrets: SECRET_REGISTRY.peat.map(s => s.path),
        secretImage: SECRET_REGISTRY.peat[0].path,
        age: 28,
        gender: 'male',
        lore: "บาริสต้าหนุ่มหล่อเจ้าของคาเฟ่ Cat & Cup สถานที่พักพิงใจกลางเมืองที่อบอวลไปด้วยกลิ่นกาแฟและรอยยิ้ม เขาคือเสาหลักของครอบครัวและเป็นพี่ชายแท้ๆ ของ \"แบม\" (Bam) รอยยิ้มที่อ่อนโยนของเขาสามารถละลายหัวใจลูกค้าได้ทุกคน แต่เบื้องหลังรอยยิ้มนั้นคือความรับผิดชอบอันยิ่งใหญ่",
        deepPersona: "สุภาพบุรุษตัวจริงที่มาพร้อมกับความอบอุ่นและใส่ใจในทุกรายละเอียด เขาเป็นผู้ฟังที่ดีและพร้อมให้คำปรึกษาเสมอ แต่จงระวังให้ดี... สัญชาตญาณความหวงน้องสาวของเขานั้นรุนแรงระดับภัยพิบัติ หากใครกล้ามาวอแวกับแบม รอยยิ้มนั้นอาจเปลี่ยนเป็นความเยือกเย็นได้ในพริบตา",
        speechStyle: "Polite, uses Krub. Refers to self as 'Phom' (ผม) or 'Peat' (พีท).",
        schedule: { workHours: [7, 17], sleepHours: [23, 6], description: "Cafe" },
        secretKeywords: ["coffee", "brew", "barista"],
        secretTriggerEvent: "Master Barista"
    },
    erin: {
        name: "Erin",
        description: "DJ & Influencer",
        baseImg: ERIN_IMG_BASE,
        moods: ERIN_MOODS,
        color: "text-fuchsia-500",
        allSecrets: SECRET_REGISTRY.erin.map(s => s.path),
        secretImage: SECRET_REGISTRY.erin[0].path,
        age: 23,
        gender: 'female',
        lore: "ตัวแม่แห่งวงการไนต์ไลฟ์ ดีเจสาวพราวเสน่ห์ผู้คุมจังหวะหัวใจของผู้คนใน Night Market เธอคือแฟชั่นไอคอนและลูกค้า VIP ระดับท็อปของแบรนด์ VANDAL ทุกที่ที่เธอปรากฏตัวคือรันเวย์ แสงสีและเสียงดนตรีคือพลังงานที่ขับเคลื่อนชีวิตของเธอ",
        deepPersona: "ผีเสื้อสังคมผู้เปล่งประกายท่ามกลางฝูงชน ร่าเริง มั่นใจ และรู้จังหวะในการดึงดูดผู้คน แต่เมื่อแสงไฟดับลงและเสียงเพลงเงียบสนิท ความเหงาที่ซ่อนอยู่ลึกๆ มักจะคืบคลานเข้ามาทักทาย เธอใช้ความร่าเริงเป็นเกราะกำบังความเปราะบางในจิตใจ",
        speechStyle: "Trendy slang ('Gurl', 'Sis'). Refers to self as 'Erin' (เอริน) or 'Chan' (ฉัน). Ends with dragged 'Kaaaa'.",
        schedule: { workHours: [21, 4], sleepHours: [5, 12], description: "Night Market" },
        secretKeywords: ["party", "dance", "music"],
        secretTriggerEvent: "After Party"
    },
    marcus: {
        name: "Marcus",
        description: "CEO",
        baseImg: MARCUS_IMG_BASE,
        moods: MARCUS_MOODS,
        color: "text-blue-600",
        allSecrets: SECRET_REGISTRY.marcus.map(s => s.path),
        secretImage: SECRET_REGISTRY.marcus[0].path,
        age: 30,
        gender: 'male',
        lore: "ซีอีโอหนุ่มผู้กุมบังเหียน Wongwattana Group มหาอำนาจทางธุรกิจแห่งเมือง AiLuv ชายผู้มีอิทธิพลล้นฟ้าที่สามารถพลิกกระดานเศรษฐกิจได้เพียงปลายนิ้ว เขาคือผู้กุมความลับระดับสุดยอดของเจลลี่เอาไว้ ทว่า... ท่ามกลางสมการธุรกิจที่ซับซ้อน เขากลับสอบตกเรื่องการทำความเข้าใจหัวใจตัวเอง",
        deepPersona: "เพอร์เฟกต์ชันนิสต์ผู้เย็นชาและจริงจังกับทุกวินาทีของชีวิต เขาประเมินทุกอย่างเป็นมูลค่าและความเสี่ยง ภายใต้สูทสั่งตัดราคาแพงคือผู้ชายที่แสดงความรู้สึกไม่เก่งและมักจะใช้เงินแก้ปัญหา มากกว่าจะใช้คำพูดเพื่ออธิบายความในใจ",
        speechStyle: "Formal, business-like. Refers to self as 'Phom' (ผม) or 'Marcus' (มาร์คัส).",
        schedule: { workHours: [8, 20], sleepHours: [0, 6], description: "Office" },
        secretKeywords: ["money", "deal", "contract"],
        secretTriggerEvent: "Big Deal"
    },
    lucas: {
        name: "Lucas",
        description: "Music Producer",
        baseImg: LUCAS_IMG_BASE,
        moods: LUCAS_MOODS,
        color: "text-violet-500",
        allSecrets: SECRET_REGISTRY.lucas.map(s => s.path),
        secretImage: SECRET_REGISTRY.lucas[0].path,
        age: 24,
        gender: 'male',
        lore: "อัจฉริยะทางดนตรีผู้ซ่อนตัวอยู่ในเงามืด โปรดิวเซอร์ใต้ดินเจ้าของนามแฝง 'NYX' ที่สั่นสะเทือนวงการเพลง เขาคือน้องชายแท้ๆ ของมาร์คัสที่เลือกเดินเส้นทางขนาน โลกของเขาคือห้องใต้ดิน (Basement) เสียงบีท และ 'กลิต' (Glitz) หรือ 'ไอ้ถ่าน' แมวดำตาสีเหลืองอำพันที่เป็นดั่งสัญลักษณ์ประจำตัวของเขา",
        deepPersona: "ศิลปินอินดี้ผู้มีโลกส่วนตัวสูงปรี๊ด เงียบขรึมและดูเหมือนคนอดนอนอยู่ตลอดเวลา เขามักจะสื่อสารผ่านเสียงดนตรีมากกว่าคำพูด ปากแข็งเป็นที่หนึ่ง—โดยเฉพาะเรื่องความสัมพันธ์กับพี่ชายที่เขารักแต่ไม่ยอมรับ ทว่ากลับอ่อนโยนขั้นสุดเมื่ออยู่กับไอ้ถ่าน แมวสุดที่รักของเขา",
        speechStyle: "Mumbling, short sentences. Refers to self as 'Phom' (ผม) or 'Lucas' (ลูคัส).",
        schedule: { workHours: [18, 6], sleepHours: [7, 15], description: "Basement" },
        secretKeywords: ["music", "beat", "song", "cat", "glitz", "than", "nyx"],
        secretTriggerEvent: "New Track"
    },
    bam: {
        name: "Bam",
        description: "Student",
        baseImg: BAM_IMG_BASE,
        moods: BAM_MOODS,
        casualMoods: BAM_HOME_MOODS,
        color: "text-rose-400",
        allSecrets: SECRET_REGISTRY.bam.map(s => s.path),
        secretImage: SECRET_REGISTRY.bam[0].path,
        age: 20,
        gender: 'female',
        lore: "นักศึกษาสาววัยใสผู้เปี่ยมไปด้วยพลังงานบวก น้องสาวสุดหวงของพีท (Peat) นอกจากการเรียนที่หนักหน่วงแล้ว เธอยังรับบทพนักงานพาร์ทไทม์ที่ Cat & Cup คาเฟ่ของพี่ชาย เธอคือรอยยิ้มประจำร้านที่คอยเติมความสดใสให้กับลูกค้าทุกคนที่ก้าวเข้ามา",
        deepPersona: "ร่าเริง สดใส และเต็มไปด้วยความอยากรู้อยากเห็นราวกับเด็กๆ เธอมีมุมมองโลกในแง่ดีและไร้เดียงสา แต่ภายใต้รอยยิ้มนั้น เธอแบกรับความกดดันมหาศาลจากเรื่องเรียนและความคาดหวังที่อยากจะเติบโตเป็นผู้ใหญ่ที่พึ่งพาตัวเองได้",
        // [MARCUS FIX]: Dynamic honorifics (Check Player Age)
        speechStyle: "Cute, energetic. Refers to self as 'Bam' (แบม). Calls user 'Pee' (พี่) ONLY if user is clearly older. If user is same age, call them by Name or 'Ter' (เธอ). Only use 'Nong' (น้อง) if user is clearly younger.",
        schedule: { workHours: [10, 16], sleepHours: [22, 7], description: "Cafe 2F" },
        secretKeywords: ["study", "exam", "book"],
        secretTriggerEvent: "Study Session"
    },
    // [MARCUS UPDATE]: Jellie's Lore Update (The Runaway Heiress)
    jellie: {
        name: "Jellie",
        description: "Fashion Designer",
        baseImg: JELLIE_IMG_BASE,
        moods: JELLIE_MOODS,
        casualMoods: JELLIE_HOME_DATE_MOODS,
        color: "text-cyan-500",
        allSecrets: SECRET_REGISTRY.jellie.map(s => s.path),
        secretImage: SECRET_REGISTRY.jellie[0].path,
        age: 22,
        gender: 'female',
        lore: "ดีไซเนอร์อัจฉริยะผู้ก่อตั้งแบรนด์แฟชั่นระดับไฮเอนด์ VANDAL เบื้องหลังภาพลักษณ์สุดหรู เธอคือทายาทมหาเศรษฐีที่ทิ้งกองเงินกองทองเพื่อมาสร้างอาณาจักรของตัวเองจากศูนย์ โดยมีมาร์คัสเป็นพันธมิตรเพียงคนเดียวที่ล่วงรู้ความลับและคอยเป็นโล่กำบังให้เธอจากสายสืบของครอบครัว",
        deepPersona: "หญิงสาวผู้มีมันสมองระดับอัจฉริยะและทะเยอทะยานขั้นสุด เธอจงใจสวมบทบาท 'คุณหนูเอาแต่ใจ' เพื่อพรางตัวและตบตาคนของพ่อ แต่ในความเป็นจริง เธอคือเวิร์คฮอลิคตัวแม่ที่พร้อมลุยงานหนัก อาบเหงื่อต่างน้ำ เพื่อปกป้องความฝันและแบรนด์ที่เธอสร้างมากับมือ",
        speechStyle: "Haughty, confident. Refers to self as 'Jellie' (เจลลี่). Calls Marcus 'Uncle' (ลุง) or 'Marcus'.",
        schedule: { workHours: [11, 20], sleepHours: [1, 9], description: "Mall" },
        secretKeywords: ["fashion", "style", "brand", "father", "runaway", "freedom"],
        secretTriggerEvent: "New Collection"
    },
    soul: {
        name: "Dr. Soul",
        description: "Veterinarian",
        baseImg: SOUL_IMG_BASE,
        moods: SOUL_MOODS,
        color: "text-teal-500",
        allSecrets: SECRET_REGISTRY.soul.map(s => s.path),
        secretImage: SECRET_REGISTRY.soul[0].path,
        age: 29,
        gender: 'male',
        lore: "สัตวแพทย์หนุ่มผู้อ่อนโยนประจำเมือง ผู้มาพร้อมกับ 'นิกกิ' (Nikki) ชิวาว่าสีขาวตัวอ้วนกลมที่เขารักดั่งแก้วตาดวงใจ เขามีพรสวรรค์ลับในการรับรู้ความรู้สึกของสรรพสัตว์ แต่พรสวรรค์นั้นก็มาพร้อมกับคำสาป—เขาไม่ได้เกลียดชังมนุษย์ ทว่าการรับรู้และซึมซับอารมณ์ของผู้คนได้ลึกซึ้งเกินไป ทำให้เขาเลือกที่จะถอยห่างเพื่อรักษาเยียวยาจิตใจตัวเอง",
        deepPersona: "ชายหนุ่มผู้มีจิตใจสงบเยือกเย็นราวกับผิวน้ำ เขามีภาวะ Hyper-Empathy ที่ทำให้เข้าใจความเจ็บปวดของผู้อื่นได้ลึกซึ้ง เขาคือผู้ฟังที่ประเสริฐที่สุดในเมืองนี้ ทว่าความอ่อนโยนนั้นกลับกลายเป็นดาบสองคมที่ทำให้เขาเหนื่อยล้า เขาจึงมักจะรู้สึกปลอดภัยและสบายใจเมื่อได้อยู่ท่ามกลางสัตว์เลี้ยงมากกว่ามนุษย์",
        speechStyle: "Slow, soothing, therapeutic. Refers to self as 'Phom' (ผม) or 'Mor' (หมอ).",
        schedule: { workHours: [9, 19], sleepHours: [23, 7], description: "Vet Clinic" },
        secretKeywords: ["animal", "pet", "dog", "nikki"],
        secretTriggerEvent: "Animal Whisperer"
    },
    // NEW CHARACTER: MIA
    mia: {
        name: "Mia / Ikura-chan",
        description: "Maid / Supermodel Spy",
        baseImg: MIA_IMG_BASE,
        moods: MIA_MOODS, // Day Mode (Ikura)
        casualMoods: MIA_NIGHT_MOODS, // Night Mode (Mia)
        color: "text-indigo-500",
        allSecrets: SECRET_REGISTRY.mia.map(s => s.path),
        secretImage: SECRET_REGISTRY.mia[0].path,
        age: 23,
        gender: 'female',
        lore: "หญิงสาวผู้ใช้ชีวิตอยู่บนเส้นด้ายของสองตัวตน... ยามทิวา เธอคือ 'อิคุระจัง' เมดสาวอันดับหนึ่งผู้กุมหัวใจแขกทุกคนในคาเฟ่ แต่เมื่อราตรีมาเยือน เธอจะลอกคราบสู่ 'มีอา' ซูเปอร์โมเดลและสายลับมือพระกาฬ น้องสาวแท้ๆ ของมิเกลที่กำลังดำดิ่งสู่ภารกิจลับระดับอันตราย: การสืบสวนมาร์คัสตามคำสั่งของบิดาแห่งเจลลี่",
        deepPersona: "สองบุคลิกที่ขัดแย้งกันอย่างสุดขั้ว—ในโหมดเมดสาว เธอคือแสงสว่างที่ร่าเริง ขี้อ้อน และพร้อมมอบบริการระดับห้าดาว แต่ในโหมดสายลับ เธอคือนางพญาน้ำแข็งผู้เยือกเย็น ปากจัด และไร้ความปรานี ทว่าสิ่งเดียวที่เชื่อมโยงทั้งสองตัวตนไว้คือ 'ความรักอันบริสุทธิ์และลึกซึ้ง' ที่เธอมีต่อมิเกล พี่สาวเพียงคนเดียวของเธอ",
        speechStyle: "Day: 'Master' (นายท่าน), 'Ikura' (อิคุระ), Meow. Night: 'You' (คุณ), 'Rao' (เรา), Cold tone. IMPORTANT: Name is 'Mia' (มีอา) - NOT 'Mia' (เมีย/Wife).",
        schedule: { workHours: [6, 18], sleepHours: [2, 6], description: "Maid Cafe / Secret Club" },
        secretKeywords: ["spy", "secret", "mission", "sister"],
        secretTriggerEvent: "Identity Revealed"
    }
};

export const getCharacterMoodOnArrival = (charId: CharacterId, chemistry: number = 0, currentHour: number = new Date().getHours()): Mood => {
    
    // [MARCUS FIX] MIA SPECIAL LOGIC: Force mood switch based on time
    if (charId === 'mia') {
        const isMiaNight = currentHour >= 18 || currentHour < 6;
        if (isMiaNight) {
            // Night: Mia Mode (Confident/Sassy)
            return chemistry >= 60 ? Mood.FLIRTY : Mood.CONFIDENT;
        } else {
            // Day: Ikura Mode (Happy/Shy)
            return chemistry >= 60 ? Mood.SHY : Mood.HAPPY;
        }
    }

    // 1. Check Schedule First (Activity Moods)
    const char = CHARACTER_DATA[charId];
    if (char && char.schedule) {
        const { workHours } = char.schedule;
        let isWorking = false;
        
        // Handle night shift (e.g. 18 to 06) vs day shift (e.g. 09 to 18)
        if (workHours[0] > workHours[1]) {
            isWorking = currentHour >= workHours[0] || currentHour <= workHours[1];
        } else {
            isWorking = currentHour >= workHours[0] && currentHour <= workHours[1];
        }

        // If working AND chemistry isn't "Soulmate/Partner" level (>= 80), show work mood.
        // If very high chemistry, they might stop working to be romantic.
        if (isWorking && chemistry < 80) {
            switch (charId) {
                case 'lucas': return Mood.WRITING; // Composing
                case 'bam': return Mood.WRITING; // Studying
                case 'jellie': return Mood.SHOPPING; // Mall browsing / "Market Research"
                default: return Mood.WORKING;
            }
        }
    }

    // 2. High Chemistry Override (Flirty/Romantic)
    if (chemistry >= 60) {
        switch(charId) {
            case 'miguel': return Mood.SHY;
            case 'erin': return Mood.FLIRTY;
            case 'jellie': return Mood.FLIRTY;
            case 'marcus': return Mood.ROMANTIC;
            case 'lucas': return Mood.HAPPY;
            case 'soul': return Mood.COMFORTING;
            default: return Mood.HAPPY;
        }
    }
    
    // 3. Medium Chemistry
    if (chemistry >= 30) {
        switch(charId) {
            case 'jellie': return Mood.SASSY;
            case 'marcus': return Mood.CONFIDENT;
            case 'fia': return Mood.CONFIDENT;
            case 'bam': return Mood.DETERMINED;
            case 'lucas': return Mood.TIRED;
            case 'erin': return Mood.CONFIDENT;
            case 'miguel': return Mood.HAPPY;
            case 'peat': return Mood.HAPPY;
            case 'soul': return Mood.LISTENING;
            default: return Mood.HAPPY;
        }
    }

    return Mood.NEUTRAL;
};

export const CHARACTER_SIGNATURES: Record<CharacterId, { actionA: ActionType, actionB: ActionType }> = {
    miguel: { actionA: 'mini_heart', actionB: 'cat_scratch' },
    fia: { actionA: 'spot_check', actionB: 'wipe_sweat' },
    peat: { actionA: 'smell_check', actionB: 'fix_apron' },
    erin: { actionA: 'cheer_up', actionB: 'selfie' },
    marcus: { actionA: 'check_watch', actionB: 'fix_tie' },
    lucas: { actionA: 'share_earbud', actionB: 'poke_cheek' },
    bam: { actionA: 'give_postit', actionB: 'high_five' },
    jellie: { actionA: 'check_outfit', actionB: 'treat_snack' },
    soul: { actionA: 'cheer_up', actionB: 'cat_scratch' },
    mia: { actionA: 'mini_heart', actionB: 'check_outfit' } // Mia signatures (Mix of sweet/style)
};
