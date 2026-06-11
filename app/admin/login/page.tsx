import { LoginForm } from '@/components/admin/login-form';

export default function Page() {
  return (
    <div className='mx-auto flex max-w-sm flex-col gap-6 py-12'>
      <h1 className='text-center text-xl font-semibold'>셀러 로그인</h1>
      <LoginForm />
    </div>
  );
}
