import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = (body.name ?? "").toString().trim();
  const school = (body.school ?? "").toString().trim() || null;
  if (!name) return NextResponse.json({ error: "이름이 필요합니다." }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const admin = createAdminClient();
  const { error: e1 } = await admin.from("profiles").upsert({
    id: user.id, role: "teacher", display_name: name
  });
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  const { error: e2 } = await admin.from("teachers").upsert({ id: user.id, school });
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
