# AiLuv — Key Story / NYX Radio (ทดลอง)

> AI Studio Dev: อ่านไฟล์นี้ก่อน จากนั้นอ่าน `Story_Thread_Creation_Guide.md`, `Story_Flag_CMS_Template.xlsx` และ `constants/storyThreads.ts` ตามลำดับ

## Source of Truth และวิธีส่งต่อ

- `Story_Flag_CMS_Template.xlsx` คือ **Content Authoring Source** ที่ปอนใช้เพิ่ม/แก้ Story Thread, Key, Node, Flag และ Hint
- `constants/storyThreads.ts` คือ **Runtime Source of Truth** ที่ตัวเกมอ่านจริงในรุ่นนี้
- การเพิ่มแถวใน Google Sheet **ยังไม่ทำให้เกมเปลี่ยนอัตโนมัติ** ต้องให้ AI Studio Dev แปลงเฉพาะแถว `dev_status = READY_TO_BUILD` เป็น TypeScript แล้วรัน validation/tests
- ห้ามให้ AI สร้างบทพูดเป็นผู้แจก item หรือปลด flag เอง AI มีหน้าที่แสดงอารมณ์และถ้อยคำจาก `facts` เท่านั้น ส่วน `storyEngine.ts` เป็นผู้ตรวจเงื่อนไขและ Commit state
- ทุก ID ที่เคยปล่อยแล้ว (`thread_id`, `node_id`, `flag_id`, `item_id`) ต้องถือว่า immutable หากจำเป็นต้องเปลี่ยน ต้องเขียน save migration ก่อน
- ช่องที่ใส่หลายค่าใช้เครื่องหมาย `|` เช่น `radio.found|radio.episode_complete` ช่องว่างหมายถึงไม่มีค่า ห้ามใช้ comma เพราะข้อความเนื้อเรื่องอาจมี comma ได้

### Checklist สำหรับ AI Studio Dev

1. อ่านแถวใหม่ที่ `dev_status = READY_TO_BUILD` และตรวจ `enabled = TRUE`
2. ตรวจ ID ซ้ำ, Character/Location ที่มีจริง, ลำดับ Node และ prerequisite ที่ต้องเกิดก่อน grant
3. เพิ่มข้อมูลใน `KEY_STORY_ITEMS`, `STORY_THREADS`, `STORY_NODES` โดยไม่ hardcode บทพูดตอบกลับ
4. แปลง `facts` เป็น facts ที่ตัวละครนั้นรู้จริง และ `required_mentions` เป็นกลุ่มคำตรวจคำตอบ AI
5. เพิ่ม wrong-recipient policy จาก `Character_Hints`; คนที่ไม่รู้ต้องไม่เล่าความลับ และ Key ต้องไม่หาย
6. เพิ่ม migration หากแก้ schema/ID เดิม และเพิ่ม tests สำหรับ success, locked, wrong character, repeat, AI failure/retry และ save reload
7. รัน `npm test`, `npm run lint`, `npm run build` แล้วรายงานไฟล์ที่เปลี่ยนและข้อจำกัด

รุ่นนี้เพิ่ม Key 1 ชิ้น และฉาก 3 ช่วงในตอนเดียว: เฟียร์ → วิทยุ → เอริน ไม่ใช่ไอเทมเริ่มต้น 3 ชิ้น เนื้อหาเหตุการณ์วิทยุเป็นบทขยายใหม่ตามไอเดียผู้เล่น ส่วนความสัมพันธ์เอริน–ลูคัสและ Midnight City อิงแกนเรื่องที่ให้มา ควรตรวจบทอีกครั้งก่อนปล่อยจริง

## Revision 2 — Feedback UX/UI และบทพูด AI

- **Notes เป็นแอพจริงใน Mobile**: อยู่ใน App Grid แบบเดียวกับ AiGram, Mail และ Wallet มี badge เมื่อพบเบาะแสใหม่ ไม่ใช้แถบ widget บนหน้า Home แล้ว
- **หน้าแชทเหลือเพียงไอคอน Key**: อยู่บน Header ข้างปุ่มระบบเดิม มีจุดแจ้งเตือนเมื่อมีฉากให้ตาม กดแล้วเปิดเมนูขนาดเล็ก และปิดได้ด้วยการแตะด้านนอกหรือ Escape
- **ข้อความ Story แบบพิเศษ**: ใช้รูปทรง Bubble เดิม แต่เพิ่มพื้นม่วงอ่อน เส้น Accent บาง และชื่อความทรงจำ ไม่ใช้แสงหรือป้ายขนาดใหญ่
- **AI แสดงบทบาททั้งหมด**: ตอนพบของ ให้ถูกคน ให้ผิดคน ปฏิเสธ และถามซ้ำ ระบบส่งเพียง facts ที่ได้รับอนุญาต พร้อมบริบทแชท อารมณ์ และความสัมพันธ์ ให้ตัวละครเลือกถ้อยคำ/ท่าทางเอง
- **Code ยังเป็นผู้ตัดสินผล**: AI ไม่มีสิทธิ์แจก Key, ปลด flag, เปลี่ยน Love/Energy หรือแต่ง canon ใหม่ หาก AI ล้มเหลว flag จะยังไม่เดินหน้าและผู้เล่นกด Retry ได้

## AiLuv Life 01 — เสียงเคาะประตูปริศนา

ประเภท `AILUV LIFE` · Thread ID `cat_food_knock` · เรื่องเล็กในเมืองที่ทิ้งเบาะแสไปยัง Aurelia โดยยังไม่เปิดเส้น Canon หลัก

**Entry Trigger:** พบมิเกลที่ `condo`, Love มิเกลตั้งแต่ 200 ขึ้นไป และคุยเรื่องห้อง คอนโด ฝ่ายนิติ หรือเพื่อนบ้าน ผู้เล่นกดปุ่มเรื่องราวแทนการพิมพ์ได้เมื่อผ่านเงื่อนไขแล้ว

| Node ID | ตัวละคร / สถานที่ | เงื่อนไขก่อนเริ่ม | ผลสำเร็จ |
| --- | --- | --- | --- |
| `cat_food_hear_knock` | `miguel` / `condo` | Miguel Love ≥ 200 | `cat_food.knock_heard` |
| `cat_food_open_door` | `miguel` / `condo` | `cat_food.knock_heard`, Love ≥ 200 | `cat_food.box_found`, `key_cat_cafe_receipt` |
| `cat_food_bam_receipt` | `bam` / `cafe_2f` | `cat_food.box_found`, ถือใบเสร็จ | `cat_food.receipt_traced`, `key_ikura_maid_charm` |
| `cat_food_miguel_charm` | `miguel` / `condo` | `cat_food.receipt_traced`, ถือพวงกุญแจ, Love ≥ 200 | `cat_food.ikura_identified`, `key_ikura_photo` |
| `cat_food_mia_photo` | `mia` / `maid_cafe` | `cat_food.ikura_identified`, ถือภาพถ่าย | `cat_food.mia_cleared`, `key_ikura_vip_card` |
| `cat_food_soul_vip` | `soul` / `vet` | `cat_food.mia_cleared`, ถือบัตร VIP | `cat_food.soul_confessed`, `cat_food.episode_complete` |

Key ทั้ง 4 ชิ้นเป็นของถาวรและไม่หายเมื่อมอบให้ถูกคน ผิดคน หรือเล่นฉากซ้ำ:

- `key_cat_cafe_receipt`: ใบเสร็จมอคค่าคาราเมลจาก Cat & Cup
- `key_ikura_maid_charm`: พวงกุญแจน้องเมดจิ๋วรุ่นลิมิเต็ด
- `key_ikura_photo`: ภาพถ่ายอิคุระจัง
- `key_ikura_vip_card`: บัตร VIP อิคุระจัง

ความจริงปลายตอน: หมอโซลเป็นคนวางอาหารแมวให้ Tofu เขาเห็นชายชุดดำป้วนเปี้ยนแถวห้องมิเกลและตามไปไม่ทัน รถของคนเหล่านั้นมีคำว่า `Aurelia Group` ปมนี้เป็นเพียงเบาะแสท้ายตอน ห้าม AI เปิดเผยตัวคนวางอาหารหรือ Aurelia ก่อน `cat_food.soul_confessed`

สมุดเรื่องราวรองรับหลาย Thread แล้ว ผู้เล่นเลือกดู `AiLuv Life` แต่ละเรื่องได้ในแถบรายการแนวนอน โดยเรื่องนี้แสดง Love 200/คะแนนปัจจุบันอย่างตรงไปตรงมา ส่วนหน้าแชทแสดงปุ่มเหตุการณ์เฉพาะเมื่อผ่าน Love และอยู่กับตัวละคร/สถานที่ถูกต้อง

## วิธีลองเล่น

1. แตก ZIP, รัน `npm ci`, ตั้ง API key ตาม README เดิมถ้าต้องการแชท AI แล้วรัน `npm run dev` เข้าบัญชีและผ่านบทสอนเดิมก่อน
2. เปิดโทรศัพท์ → **สมุดเรื่องราว · Key Story** อ่านวิธีเล่นและขั้นตอนถัดไป กดไปหาเฟียร์ที่ Iron Paradise
3. พิมพ์ “เฟียร์ ในตู้เก็บของมีเสียงอะไร” หรือกดไอคอน **Key** บนหัวแชท แล้วเลือกหัวข้อชวนคุย
4. พิมพ์ “เปิดตู้เก็บของ” หรือเปิดเมนู Key แล้วเลือกหัวข้อ ได้ **วิทยุเก่าติดสติกเกอร์ NYX** ของจริงในเกมหลัง AI ตอบสำเร็จ
5. ดูแท็บ **Key** ในกระเป๋าหรือสมุด จะมีคำใบ้ให้ไปหาเอรินที่ Night Sky Market
6. ลองหยิบให้เฟียร์หรือคนอื่นดู: ได้คำใบ้ ของไม่หาย จากนั้นไปหาเอริน กดปุ่มหยิบวิทยุให้ดู หรือพิมพ์ “ยื่นวิทยุให้เอรินดู”
7. เอรินเล่าความทรงจำและคืนวิทยุ สมุดบันทึกฉากที่ผ่านแล้ว กลับมาอ่านหรือหยิบให้ดูซ้ำได้

ทั้ง 3 ฉากใช้ Love 0 และไม่หัก Energy/ให้เงินหรือ Love ซ้ำ การเดินทางยังใช้ Energy ตามระบบเดิม ฉากต้องไปพบตัวละครที่สถานที่ของเขา ไม่ปลดจาก AiGram/แชทออนไลน์หรือขณะทำกิจกรรมอื่น

## รายการ flag ทั้งหมด

| Node ID | ตัวละคร / สถานที่ | เงื่อนไขก่อนเริ่ม | ผลสำเร็จ |
| --- | --- | --- | --- |
| `radio_hear_noise` | `fia` / `gym` | Love ≥ 0 | `radio.noise_heard` |
| `radio_open_locker` | `fia` / `gym` | `radio.noise_heard`, Love ≥ 0 | `radio.found` และ `key_nyx_radio` |
| `radio_erin_recall` | `erin` / `market` | `radio.found`, ถือ `key_nyx_radio`, Love ≥ 0 | `radio.erin_recalled`, `radio.episode_complete` |

Key ID: `key_nyx_radio` · ชนิด `type: 'key'` · ไม่ใช้ร่วมกับของกิน/ของขวัญทั่วไป · ไม่ขาย ไม่รีไซเคิล ไม่หายเมื่อใช้ · ได้ครั้งเดียว

`radio.noise_heard`: รู้ว่ามีเสียงซ่า แต่ยังไม่รู้สิ่งที่อยู่ในตู้

`radio.found`: พบวิทยุและได้รับอนุญาตจากเฟียร์ให้นำไปถามเอริน

`radio.erin_recalled`: เอรินจำวิทยุที่ใช้ลองเดโมและเล่าช่วงทำ Midnight City กับลูคัส

`radio.episode_complete`: จบตอนทดลอง ยังไม่เปิดเผยตัวตน NYX หรือแจกของชิ้นถัดไป

แกนเรื่อง, สรุปสมุด และข้อเท็จจริงที่ AI ได้รับอนุญาตให้นำไปแสดง อยู่ใน `constants/storyThreads.ts` ส่วนถ้อยคำ `dialogue`/`repeatDialogue` เดิมเก็บไว้เป็นข้อมูลอ้างอิง แต่ Revision 2 ไม่แสดงเป็นคำตอบสำเร็จรูป

## เพิ่ม Key / flag ในอนาคต

เพิ่มข้อมูลใน `constants/storyThreads.ts`:

1. เพิ่มของใน `KEY_STORY_ITEMS` ใช้ ID ไม่ซ้ำ ใส่ชื่อ รายละเอียด `hintCharacter`, `hintLocation`, คำใบ้เมื่อให้ผิดคน และ `defaultHint` ไอคอนรุ่นนี้รองรับวิทยุ หากต้องการภาพชนิดอื่นให้ขยาย `KeyStoryItem.icon` และ `StoryKeys`
2. เพิ่มฉากใน `STORY_NODES` ตามลำดับก่อน–หลัง ใช้ `characterId`/`locationId` ที่มีจริง เงื่อนไขทั้งหมดเป็น AND
3. `requires.flags`: ต้องผ่าน flag เหล่านี้ทั้งหมด; `minLove`: คะแนนที่ต้องถึง; `itemId`: Key ที่ต้องถือ (ถ้ามี)
4. `grants.flags`: flag ที่ปลด; `grants.items`: Key ที่ได้ (ถ้ามี) ตั้งชื่อ flag ให้บอกสิ่งที่เกิดขึ้นแล้ว
5. `facts`: จังหวะเรื่องและข้อเท็จจริงที่ AI ต้องถ่ายทอด; `requiredMentions`: คำสำคัญอย่างน้อยหนึ่งคำในแต่ละกลุ่มที่คำตอบต้องมี เพื่อไม่ให้ AI ตอบสวยแต่ทำเนื้อเรื่องตกหล่น; `summary`: บันทึกสมุด; `guide`: ขั้นตอนที่ผู้เล่นทำได้จริง
6. `textCues`: regex จับการกระทำในแชท ใส่หลายรูปแบบได้ ปุ่ม `actionLabel` เป็นทางออกเมื่อระบบไม่เข้าใจข้อความ
7. รัน `npm test`, `npm run lint`, `npm run build` และเล่นตั้งแต่เซฟใหม่/เซฟเดิม

ตัวอย่างโครงฉากต่อจากตอนวิทยุ (ยังไม่ได้เพิ่มในเกม):

```ts
{
  id: 'radio_next_memory', threadId: 'nyx_radio',
  title: 'ชื่อฉากใหม่', characterId: 'erin', locationId: 'market',
  trigger: 'conversation', actionLabel: 'ถามถึงความทรงจำต่อ',
  playerAction: 'อยากฟังเรื่องวันนั้นต่อ',
  requires: { flags: ['radio.episode_complete'], minLove: 30 },
  textCues: ['ฟัง.*วันนั้น.*ต่อ'],
  dialogue: 'บทพูดฉากใหม่', repeatDialogue: 'บทพูดเมื่อถามซ้ำ',
  summary: 'สิ่งที่ผู้เล่นเรียนรู้', facts: ['ข้อเท็จจริงใหม่'],
  guide: 'กลับมาคุยกับเอรินเมื่อ Love ถึง 30',
  grants: { flags: ['radio.next_memory_known'] },
}
```

สมุดแสดงคะแนนปัจจุบัน/คะแนนที่ต้องถึงให้อัตโนมัติ ห้ามเปลี่ยนหรือลบ ID ของฉากที่ปล่อยไปแล้วโดยไม่มี migration เพราะเซฟอ้าง ID เหล่านี้

ข้อจำกัดการขยาย: UI สมุดรุ่นนี้แสดงเรื่องแรกใน `STORY_THREADS` และแผงแชทเลือกเรื่อง `nyx_radio` เป็นค่าเริ่มต้น เพิ่มฉากในตอนเดียวได้ด้วยข้อมูล แต่หากเพิ่มหลายเรื่องแยกกัน ต้องเพิ่มหน้ารายการเลือกเรื่องและส่ง `threadId` เข้า `getNextStoryNode` ก่อน

## โครงสร้างระบบและเซฟ

- `domain/story/types.ts`: ชนิด Key, Node, Progress, Command
- `domain/story/storyEngine.ts`: ตรวจเงื่อนไข แจกของ/flag ครั้งเดียว จับข้อความและโหลดเซฟ
- `store/gameStore.ts`: คำสั่ง `performStoryAction`, ตรวจการพบตัวละคร/กิจกรรม, เก็บ `story`
- `hooks/useStoryInteraction.ts`: Preview เงื่อนไข → ให้ AI แสดงบทบาท → ตรวจคำตอบ → Commit flag/Key เมื่อสำเร็จ พร้อม Retry โดยไม่แจกของล่วงหน้า
- `services/storyDialogue.ts`: สร้าง Story Performance Context และตรวจคำตอบ AI โดยไม่ให้ model มีอำนาจแก้ state
- `hooks/useGameInteractions.ts`: จับข้อความอิสระหรือคำสั่งจากไอคอน Key แล้วส่งต่อให้ Story Interaction
- `components/story/StoryChatPanel.tsx`, `StoryKeys.tsx`: ปุ่มในแชทและรายการ Key
- `components/phone/apps/StoryJournalApp.tsx`: สมุด ไกด์ เงื่อนไขและประวัติฉาก
- `services/storyContext.ts`: ข้อเท็จจริงที่ปลดแล้วและตัวกรองเนื้อหาตอนทดลอง
- `services/storyCheckpoint.ts`, `hooks/useCloudSync.ts`: สำรองเฉพาะ story ในเครื่องแยกตามบัญชีและรวมกับเซฟ cloud

เซฟเก่าไม่มี `story` จะเริ่มเรื่องใหม่โดยคงระบบเดิม ความคืบหน้าสร้างจาก `receipts` ที่ตรวจลำดับแล้ว ไม่อ่านจากข้อความที่ AI แต่ง ไม่หายเมื่อประวัติแชทถูกล้างประจำวัน เซฟ cloud ใช้รอบเดิมประมาณ 30 วินาที; checkpoint ในเครื่องเขียนทันทีเมื่อ story เปลี่ยน หากพื้นที่ในเครื่องเต็มหรือปิดการเก็บข้อมูล ต้องรอ cloud บันทึกสำเร็จ การเริ่มเกมใหม่ล้าง checkpoint ของบัญชีนั้น

นี่เป็นกติกาฝั่ง client ตามโครงเกมเดิม ไม่ใช่ระบบป้องกันผู้เล่นแก้เซฟหรือ DevTools ฝั่ง server

## ขอบเขต AI และสิ่งที่ต้องทดสอบต่อ

การพิมพ์อิสระใช้ตัวจับข้อความแบบระมัดระวังเพื่อเลือก command ที่ถูกต้อง แล้วจึงให้ AI แสดงบทสนทนา ไม่ใช้ AI เป็นผู้ตัดสินว่าจะปลด flag หรือไม่ ข้อความคลุมเครือ/ปฏิเสธ/สมมติจะไม่ปลด และใช้ไอคอน Key เป็นทางเลือกเมื่อจับไม่ได้

มี prompt สำหรับข้อความและเสียง พร้อมตัวกรองคำตอบข้อความเกี่ยวกับ NYX/ความเชื่อมโยงวิทยุก่อนปลด แต่ไม่รับประกันว่าจะกันคำอ้อมทุกแบบได้ ระบบความลับเก่าของเกมยังเป็นอีกระบบหนึ่ง ตัวกรอง pilot ปิดข้อความที่กล่าว Lucas และ NYX ร่วมกัน แม้เซฟเก่าอาจเคยรู้มาก่อน ต้องออกแบบสิทธิ์ของความลับเก่าร่วมกันก่อนขยายเป็นเนื้อเรื่องหลักทั้งหมด การคุยเสียงไม่แจก Key/flag และยังไม่มีตัวกรองเสียงหลังสร้าง

ตรวจอัตโนมัติ: 22 tests (รวม AI orchestration, failure/retry, store integration และ quest เดิม), TypeScript และ production build ผ่าน ตรวจ Browser ด้วย AI response จำลองครบทั้ง Notes app, Key menu, ให้ผิดคน, retry หลัง 429, ฉากเอริน, Light/Dark และจอ 320 px แล้ว โดยไม่ใช้ Gemini quota จริง ยังไม่ได้เชื่อม Firebase หรือเรียก Gemini จริงในสภาพแวดล้อมนี้

มีการนำ Gemini key ที่ฝังใน `functions/index.js` ออกจากไฟล์ส่งมอบ เปลี่ยนเป็น `process.env.GOOGLE_API_KEY` ต้องตั้งค่าที่ backend ก่อนใช้ function นั้น ส่วน frontend ใช้การตั้งค่าตาม README เดิม ไม่มี key ส่วนตัวแนบใน ZIP
