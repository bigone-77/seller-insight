import { type NextRequest, NextResponse } from 'next/server';

import { createServerClient } from '@supabase/ssr';

// 비로그인 전용 경로: 이미 로그인했으면 /admin으로 돌려보낸다.
const GUEST_ONLY = ['/admin/login'];
// 로그인 필요 경로: user 없으면 /admin/login으로. (GUEST_ONLY는 자동 제외)
const AUTH_REQUIRED = ['/admin'];

/**
 * 매 요청마다 Supabase 세션(access token)을 refresh하고
 * 갱신된 쿠키를 request·response 양쪽에 다시 심어주는 미들웨어 유틸.
 *
 * 세션 갱신 후 getUser()로 검증된 user 기준으로 경로별 접근을 통제한다.
 * (쿠키 존재가 아니라 검증된 user로 판단 — 보안). 손님 챗봇(/) 등 분류에
 * 걸리지 않는 경로는 그대로 통과시킨다.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // request·response 양쪽에 써야 갱신된 토큰이 전파된다.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 주의: createServerClient와 getUser 사이에 코드를 넣지 말 것.
  // getUser 호출이 토큰을 검증·refresh한다. (getSession이 아닌 getUser 사용)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // redirect 시에도 supabaseResponse에 심긴 갱신 토큰 쿠키를 유지한다.
  const redirectKeepingCookies = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  };

  const { pathname } = request.nextUrl;
  const matches = (paths: string[]) =>
    paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const isGuestOnly = matches(GUEST_ONLY);
  // /admin/login은 AUTH_REQUIRED('/admin')에도 걸리지만 isGuestOnly로 먼저
  // 제외해 무한 리다이렉트를 막는다.
  const isAuthRequired = !isGuestOnly && matches(AUTH_REQUIRED);

  if (user && isGuestOnly) return redirectKeepingCookies('/admin');
  if (!user && isAuthRequired) return redirectKeepingCookies('/admin/login');

  // 주의: supabaseResponse 객체를 그대로 반환할 것.
  // 새 NextResponse를 만들면 갱신된 쿠키가 유실된다.
  return supabaseResponse;
}
