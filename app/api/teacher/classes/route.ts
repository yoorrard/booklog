import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomCode } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const grade = String(body.grade || "").trim() || null;
  if (!name) return NextResponse.json({ error: "학급 이름이 필요합니다." }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { data, error } = await supabase
    .from("classes")
    .insert({ teacher_id: user.id, name, grade, join_code: randomCode(6) })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ class: data });
}
