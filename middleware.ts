import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  const { pathname } = request.nextUrl;

  const isTeacherRoute = pathname.startsWith("/teacher");
  const isStudentRoute = pathname.startsWith("/student");

  if ((isTeacherRoute || isStudentRoute) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = isTeacherRoute ? "/login/teacher" : "/login/student";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (isTeacherRoute || isStudentRoute)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "student" && isTeacherRoute) {
      return NextResponse.redirect(new URL("/student", request.url));
    }
    if (profile?.role === "teacher" && isStudentRoute) {
      return NextResponse.redirect(new URL("/teacher", request.url));
    }

    // 학생의 최초 로그인 시 비밀번호 변경 강제
    if (profile?.role === "student" && isStudentRoute && pathname !== "/student/change-password") {
      const { data: student } = await supabase
        .from("students")
        .select("must_change_password")
        .eq("id", user.id)
        .maybeSingle();
      if (student?.must_change_password) {
        return NextResponse.redirect(new URL("/student/change-password", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*"]
};
