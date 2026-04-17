import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, studentEmailFromLoginId } from "@/lib/supabase/admin";

/**
 * 학급에 학생들을 일괄 생성.
 * 요청: { students: [{ number: 1, name: "홍길동", login_id?: "2024-3-2-01" }, ...] }
 * - login_id 미지정 시 {class.join_code}-{번호2자리} 로 자동 생성
 * - 초기 비밀번호: 123456 / must_change_password = true
 */
export async function POST(req: Request, ctx: { params: { id: string } }) {
  const classId = ctx.params.id;
  const body = await req.json().catch(() => ({}));
  const list: Array<{ number: number; name: string; login_id?: string }> = body.students ?? [];
  if (!Array.isArray(list) || list.length === 0) {
    return NextResponse.json({ error: "학생 목록이 비어 있습니다." }, { status: 400 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  // 권한 확인: 본인 소유 학급인지
  const { data: klass, error: classErr } = await supabase
    .from("classes").select("id, teacher_id, join_code").eq("id", classId).single();
  if (classErr || !klass) return NextResponse.json({ error: "학급을 찾을 수 없습니다." }, { status: 404 });
  if (klass.teacher_id !== user.id) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  const admin = createAdminClient();
  const created: Array<{ login_id: string; name: string; number: number }> = [];
  const failures: Array<{ login_id: string; name: string; number: number; reason: string }> = [];

  for (const s of list) {
    const number = Number(s.number);
    const name = String(s.name || "").trim();
    if (!number || !name) {
      failures.push({ login_id: s.login_id ?? "", name, number, reason: "이름/번호 누락" });
      continue;
    }
    const loginId = (s.login_id && s.login_id.trim()) || `${klass.join_code}-${String(number).padStart(2, "0")}`;
    const email = studentEmailFromLoginId(loginId);

    // 1) auth 사용자 생성
    const { data: created1, error: e1 } = await admin.auth.admin.createUser({
      email,
      password: "123456",
      email_confirm: true,
      user_metadata: { role: "student", display_name: name, login_id: loginId }
    });
    if (e1 || !created1.user) {
      failures.push({ login_id: loginId, name, number, reason: e1?.message ?? "auth 생성 실패" });
      continue;
    }
    const uid = created1.user.id;

    // 2) profiles + students
    const { error: e2 } = await admin.from("profiles").insert({
      id: uid, role: "student", display_name: name
    });
    if (e2) {
      try { await admin.auth.admin.deleteUser(uid); } catch {}
      failures.push({ login_id: loginId, name, number, reason: e2.message });
      continue;
    }
    const { error: e3 } = await admin.from("students").insert({
      id: uid,
      class_id: classId,
      student_number: number,
      login_id: loginId,
      must_change_password: true
    });
    if (e3) {
      try { await admin.auth.admin.deleteUser(uid); } catch {}
      try { await admin.from("profiles").delete().eq("id", uid); } catch {}
      failures.push({ login_id: loginId, name, number, reason: e3.message });
      continue;
    }

    created.push({ login_id: loginId, name, number });
  }

  return NextResponse.json({ created, failures });
}

/**
 * 학생 계정 비밀번호 초기화 (서비스 롤 필요).
 * body: { student_id: uuid }
 */
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const classId = ctx.params.id;
  const body = await req.json().catch(() => ({}));
  const studentId = String(body.student_id || "");
  if (!studentId) return NextResponse.json({ error: "학생 ID가 필요합니다." }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { data: klass } = await supabase.from("classes").select("teacher_id").eq("id", classId).single();
  if (!klass || klass.teacher_id !== user.id) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  const admin = createAdminClient();
  const { data: student } = await admin.from("students").select("class_id").eq("id", studentId).single();
  if (!student || student.class_id !== classId) return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });

  await admin.auth.admin.updateUserById(studentId, { password: "123456" });
  await admin.from("students").update({ must_change_password: true }).eq("id", studentId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  const classId = ctx.params.id;
  const url = new URL(req.url);
  const studentId = url.searchParams.get("student_id");
  if (!studentId) return NextResponse.json({ error: "student_id 필요" }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const { data: klass } = await supabase.from("classes").select("teacher_id").eq("id", classId).single();
  if (!klass || klass.teacher_id !== user.id) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const admin = createAdminClient();
  const { data: student } = await admin.from("students").select("class_id").eq("id", studentId).single();
  if (!student || student.class_id !== classId) return NextResponse.json({ error: "학생 없음" }, { status: 404 });

  try { await admin.auth.admin.deleteUser(studentId); } catch {}
  return NextResponse.json({ ok: true });
}
