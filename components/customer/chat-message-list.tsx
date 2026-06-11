'use client';

import { useEffect, useRef } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

import { ChatMessage } from './chat-message';
import { useChatContext } from './chat-provider';

// 메시지 목록 위젯: context에서 messages/status를 읽어 렌더 + 자동 스크롤.
export function ChatMessageList() {
  const { messages, status } = useChatContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  // 새 토큰/상태 변화 시 하단으로 부드럽게 추종
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  return (
    <ScrollArea className='h-[60vh] pr-4'>
      <div className='flex flex-col gap-3'>
        {messages.length === 0 && status !== 'submitted' ? (
          <p className='text-muted-foreground'>무엇을 도와드릴까요?</p>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              streaming={
                index === messages.length - 1 &&
                message.role !== 'user' &&
                status === 'streaming'
              }
            />
          ))
        )}

        {/* 첫 토큰 도착 전 대기 표시: assistant 톤 버블 안 skeleton 2줄 */}
        {status === 'submitted' && (
          <div className='flex justify-start'>
            <div className='bg-muted flex w-3/5 max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2'>
              <Skeleton className='bg-muted-foreground/20 h-3 w-full' />
              <Skeleton className='bg-muted-foreground/20 h-3 w-2/3' />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
