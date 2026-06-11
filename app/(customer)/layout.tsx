export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex min-h-screen flex-col'>
      <header className='border-b'>
        <div className='mx-auto w-full max-w-3xl p-4 font-semibold'>
          쇼핑몰 챗봇
        </div>
      </header>
      <main className='mx-auto w-full max-w-3xl flex-1 p-4'>{children}</main>
    </div>
  );
}
