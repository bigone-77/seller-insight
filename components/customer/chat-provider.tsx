'use client';

import { type ReactNode, createContext, useContext } from 'react';

import { useCustomerChat } from '@/hooks/use-customer-chat';

type ChatContextValue = ReturnType<typeof useCustomerChat>;

const ChatContext = createContext<ChatContextValue | null>(null);

// 채팅 상태(useCustomerChat)를 context로 공유하는 클라이언트 경계.
export function ChatProvider({ children }: { children: ReactNode }) {
  const chat = useCustomerChat();
  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return ctx;
}
