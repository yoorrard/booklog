import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 이메일 인증 링크 / Google OAuth 공통 콜백.
 * - ?code=... 를 세션으로 교환
 * - 교사 프로필이 없으면 자동 생성 (OAuth / 이메일 인증 첫 진입 포함)
 * - 학생 프로필이면 학생 홈으로
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") || "";
  const errorDesc = searchParams.get("error_description");
  if (errorDesc) {
    return NextResponse.redirect(`${origin}/login/teacher?error=${encodeURIComponent(errorDesc)}`);
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/login/teacher?error=missing_code`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login/teacher?error=${encodeURIComponent(error.message)}`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login/teacher?error=no_user`);

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles").select("id, role").eq("id", user.id).maybeSingle();

  if (!profile) {
    // OAuth / 첫 이메일 인증으로 진입한 신규 사용자 → 교사 프로필 자동 생성
    const meta = (user.user_metadata || {}) as Record<string, any>;
    const displayName =
      meta.display_name ||
      meta.full_name ||
      meta.name ||
      (user.email ? user.email.split("@")[0] : "선생님");
    const school = meta.school ?? null;

    const { error: pe } = await admin.from("profiles").insert({
      id: user.id, role: "teacher", display_name: displayName
    });
    if (pe) {
      return NextResponse.redirect(`${origin}/login/teacher?error=${encodeURIComponent(pe.message)}`);
    }
    await admin.from("teachers").insert({ id: user.id, school });
    return NextResponse.redirect(`${origin}${nextParam || "/teacher"}`);
  }

  // 이미 프로필이 있으면 역할에 맞게 이동
  if (profile.role === "student") {
    return NextResponse.redirect(`${origin}${nextParam.startsWith("/student") ? nextParam : "/student"}`);
  }
  return NextResponse.redirect(`${origin}${nextParam || "/teacher"}`);
}
