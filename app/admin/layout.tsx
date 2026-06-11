export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex min-h-screen flex-col'>
      <header className='border-b'>
        <div className='mx-auto w-full max-w-5xl p-4 font-semibold'>
          셀러 인사이트
        </div>
      </header>
      <main className='mx-auto w-full max-w-5xl flex-1 p-4'>{children}</main>
    </div>
  );
}
