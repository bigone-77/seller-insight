import { cookies } from 'next/headers';

import { createServerClient } from '@supabase/ssr';

export async function createClient() {
  const cookieStore = await cookies(); // Next 15: cookies()는 async

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component에서 호출되면 set이 불가하다.
            // 세션 갱신은 미들웨어(updateSession)가 담당하므로 여기서는 무시한다.
          }
        },
      },
    },
  );
}

/**
 * 현재 로그인한 유저를 반환한다. 서버 컴포넌트·액션·라우트 핸들러에서
 * 인증 상태를 읽는 단일 진입점. 미인증이면 null.
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
