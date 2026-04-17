import { createClient as createSbClient } from "@supabase/supabase-js";

/**
 * 서버 전용 관리자 클라이언트 (service role).
 * - 학생 계정 일괄 생성, 비밀번호 초기화 등 RLS 우회가 필요한 서버 작업에만 사용.
 * - 절대 브라우저로 내려가지 않도록 API/Server Action 내부에서만 import.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) {
    throw new Error("Supabase 관리자 환경변수가 설정되지 않았습니다.");
  }
  return createSbClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export function studentEmailFromLoginId(loginId: string) {
  const domain = process.env.STUDENT_EMAIL_DOMAIN || "booklog.local";
  return `${loginId.toLowerCase()}@${domain}`;
}
