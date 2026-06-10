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
            // 세션 갱신은 추후 미들웨어가 담당하므로 여기서는 무시한다.
          }
        },
      },
    },
  );
}
