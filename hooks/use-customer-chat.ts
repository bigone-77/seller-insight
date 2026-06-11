'use client';

import { useEffect, useRef, useState } from 'react';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

// 손님 챗봇의 비즈니스 로직: useChat + transport + visitorId/conversationId 왕복.
export function useCustomerChat() {
  const visitorIdRef = useRef<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  const [ready, setReady] = useState(false);

  // visitorId: 최초 1회 생성해 localStorage에 영속, 이후 재사용
  useEffect(() => {
    let id = localStorage.getItem('visitorId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('visitorId', id);
    }
    visitorIdRef.current = id;
    setReady(true);
  }, []);

  // transport는 1회만 생성. 내부 클로저는 ref를 읽어 항상 최신 값을 사용한다.
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        // 응답 헤더 X-Conversation-Id를 읽어 다음 요청에 반영
        fetch: async (req, init) => {
          const res = await fetch(req, init);
          const cid = res.headers.get('X-Conversation-Id');
          if (cid) conversationIdRef.current = cid;
          return res;
        },
        // visitorId/conversationId를 매 요청 body에 동봉
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            messages,
            visitorId: visitorIdRef.current,
            conversationId: conversationIdRef.current,
          },
        }),
      }),
  );

  const { messages, sendMessage, status, stop } = useChat({ transport });

  return { messages, sendMessage, status, stop, ready };
}
