# Push AiLuv Revision 2 ขึ้น GitHub เดิม

ไฟล์ ZIP นี้ไม่มี `.git` เพื่อไม่ทับประวัติ Repository เดิม ให้นำไฟล์ไปวางทับในโฟลเดอร์โปรเจกต์เดิมที่เคย clone จาก GitHub

## วิธีที่แนะนำ

1. สำรองโฟลเดอร์เดิมหนึ่งชุด หรือสร้าง branch ก่อน
2. แตก `AiLuv_0.8_Story_Keys_Radio_Rev2_With_CMS.zip`
3. คัดลอกทุกไฟล์จาก ZIP ไปทับในโฟลเดอร์ Repository เดิม โดย **อย่าลบโฟลเดอร์ `.git`**
4. เปิด Terminal ที่โฟลเดอร์ Repository เดิม แล้วรัน:

```bash
git status
git switch -c feature/story-key-radio
npm install
npm test
npm run lint
npm run build
git add .
git commit -m "feat: add AI-driven key story flag system"
git push -u origin feature/story-key-radio
```

จากนั้นเปิด Pull Request บน GitHub เพื่อ merge เข้า branch หลัก วิธีนี้ย้อนกลับง่ายและตรวจไฟล์ที่เปลี่ยนได้ก่อน

หากมี branch นี้อยู่แล้ว ใช้ `git switch feature/story-key-radio` แทน `git switch -c ...`

## ถ้าต้องการ Push เข้า branch หลักโดยตรง

ตรวจชื่อ branch ก่อนด้วย `git branch --show-current` แล้วใช้:

```bash
git add .
git commit -m "feat: add AI-driven key story flag system"
git push origin main
```

ถ้า branch หลักชื่อ `master` ให้เปลี่ยน `main` เป็น `master` ไม่ควรใช้ `git push --force`
