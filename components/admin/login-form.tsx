'use client';

import { type FormEvent, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppError } from '@/lib/error';
import { createClient } from '@/lib/supabase/client';
import { showError, showSuccess } from '@/lib/toast';

// 로그인 위젯: supabase 브라우저 클라이언트로 비밀번호 로그인.
// 성공/실패는 공통 에러 패턴(AppError + showError/showSuccess) 경유.
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password || loading) return;

    try {
      setLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // 자격증명 오류는 사용자 친화적 메시지로 변환.
        const friendly =
          error.code === 'invalid_credentials' ||
          error.message.includes('Invalid login credentials')
            ? '이메일 또는 비밀번호가 올바르지 않습니다.'
            : error.message;
        throw new AppError(friendly, error.code);
      }

      showSuccess('로그인되었습니다.');
      router.refresh(); // 서버가 새 세션을 인지하도록 먼저 갱신
      router.push('/admin'); // 그 다음 대시보드로 이동
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='email'>이메일</Label>
            <Input
              id='email'
              type='email'
              autoComplete='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='password'>비밀번호</Label>
            <Input
              id='password'
              type='password'
              autoComplete='current-password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <Button
            type='submit'
            className='w-full'
            disabled={loading || !email.trim() || !password}
          >
            {loading ? '로그인 중…' : '로그인'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
