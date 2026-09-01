export default function ConfigNotice() {
  return (
    <div className="card p-6 text-sm leading-relaxed">
      <h2 className="mb-2 text-lg font-bold text-brand-dark">
        ⚠️ ยังไม่ได้เชื่อมต่อฐานข้อมูล
      </h2>
      <p className="mb-3 text-gray-600">
        เว็บทำงานได้แล้ว แต่ยังไม่ได้ตั้งค่า Supabase — ทำตามนี้ครับ:
      </p>
      <ol className="list-decimal space-y-1 pl-5 text-gray-700">
        <li>
          สมัคร/สร้างโปรเจคที่{" "}
          <a
            className="text-brand-dark underline"
            href="https://supabase.com"
            target="_blank"
          >
            supabase.com
          </a>
        </li>
        <li>
          ไปที่ <b>SQL Editor</b> แล้ว Run ไฟล์{" "}
          <code className="rounded bg-pink-50 px-1">supabase_schema.sql</code>
        </li>
        <li>
          คัดลอก URL + anon key จาก <b>Project Settings → API</b> ใส่ในไฟล์{" "}
          <code className="rounded bg-pink-50 px-1">.env.local</code>
        </li>
        <li>
          รันใหม่ <code className="rounded bg-pink-50 px-1">npm run dev</code>
        </li>
      </ol>
    </div>
  );
}
