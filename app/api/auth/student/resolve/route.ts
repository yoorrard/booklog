import { NextResponse } from "next/server";
import { createAdminClient, studentEmailFromLoginId } from "@/lib/supabase/admin";

/**
 * 학생 아이디 -> 내부 이메일 해석.
 * RLS 로 보호된 students 테이블을 아이디 기반으로 조회하기 위해 관리자 클라이언트 사용.
 * 존재 여부만 간접적으로 흘러나가는 것을 막기 위해, 존재해도 동일한 응답 구조를 돌려준다.
 */
export async function POST(req: Request) {
  const { login_id } = await req.json().catch(() => ({ login_id: "" }));
  const id = String(login_id || "").trim();
  if (!id) return NextResponse.json({ error: "아이디가 필요합니다." }, { status: 400 });

  const admin = createAdminClient();
  const { data } = await admin.from("students").select("login_id").eq("login_id", id).maybeSingle();
  if (!data) return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });

  return NextResponse.json({ email: studentEmailFromLoginId(data.login_id) });
}
