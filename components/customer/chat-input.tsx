'use client';

import { type FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useChatContext } from './chat-provider';

// 입력 위젯: context에서 sendMessage/status/stop/ready를 읽어 전송·중단 UI 제공.
export function ChatInput() {
  const { sendMessage, status, stop, ready } = useChatContext();
  const [input, setInput] = useState('');

  const busy = status === 'submitted' || status === 'streaming';

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !ready || busy) return;
    sendMessage({ text });
    setInput('');
  }

  return (
    <form onSubmit={handleSubmit} className='flex w-full gap-2'>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='메시지를 입력하세요'
        disabled={!ready || busy}
      />
      {busy ? (
        <Button type='button' variant='secondary' onClick={() => stop()}>
          중단
        </Button>
      ) : (
        <Button type='submit' disabled={!ready || !input.trim()}>
          전송
        </Button>
      )}
    </form>
  );
}
