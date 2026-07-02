# CHIT HOLE Song Request

เว็บ MVP สำหรับให้ลูกค้าสแกน QR Code ที่โต๊ะแล้วส่งคำขอเพลงขึ้นหน้าจอนักดนตรีแบบ realtime

## สิ่งที่มี

- `/request?table=1` หน้าลูกค้าขอเพลงตามเลขโต๊ะ
- `/musician` หน้าคิวนักดนตรี เห็นเฉพาะเพลงที่รอเล่น
- Supabase table `song_requests`
- Realtime subscribe พร้อม fallback refresh ทุก 5 วินาที
- กันส่งรัวจากเครื่องเดิม 1 ครั้งต่อ 3 นาทีด้วย `localStorage`

## 1. สร้าง Supabase project

1. เข้า [Supabase](https://supabase.com) แล้วสร้าง project ใหม่
2. เปิด Project Settings > API
3. เก็บค่า Project URL และ anon public key ไว้

## 2. รัน SQL schema

1. เปิด Supabase > SQL Editor
2. คัดลอก SQL จาก `supabase/schema.sql`
3. กด Run
4. ไปที่ Database > Replication แล้วเช็กว่า table `song_requests` เปิด realtime แล้ว

หมายเหตุ: เวอร์ชัน MVP เปิด policy สำหรับ insert/select/update/delete แบบ public เพื่อให้ใช้งานได้ทันทีโดยไม่ต้อง login หน้า `/musician` ในงานจริงควรเพิ่มรหัสผ่านหรือ auth ให้หน้าจอนักดนตรี

## 3. ใส่ environment variables

สร้างไฟล์ `.env.local` จาก `.env.example`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. รันในเครื่อง

```bash
npm install
npm run dev
```

เปิด:

- `http://localhost:3000/request?table=1`
- `http://localhost:3000/musician`

## 5. Deploy ฟรีบน Vercel

1. Push โปรเจกต์ขึ้น GitHub
2. เข้า [Vercel](https://vercel.com) แล้ว Import project
3. ใส่ Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. กด Deploy

## 6. สร้าง QR Code ตามโต๊ะ

หลัง deploy แล้ว ใช้ URL รูปแบบนี้ไปสร้าง QR Code:

- `https://your-domain.vercel.app/request?table=1`
- `https://your-domain.vercel.app/request?table=2`
- `https://your-domain.vercel.app/request?table=3`

ทำ QR Code ได้จากเว็บสร้าง QR ฟรีทั่วไป แล้วพิมพ์ติดแต่ละโต๊ะ
