import { NextResponse } from 'next/server';

import { google } from '@ai-sdk/google';
import { type UIMessage, convertToModelMessages, streamText } from 'ai';

import { extractTextFromMessage } from '@/lib/message';
import { createClient } from '@/lib/supabase/server';

type ChatBody = {
  messages: UIMessage[];
  visitorId: string;
  conversationId: string | null;
};

type ProductRow = {
  name: string;
  category: string | null;
  price: number;
  stock: number;
};

const SYSTEM_PROMPT_HEAD = `당신은 패션/의류 쇼핑몰의 상담사다. 아래 [상품 목록]만 근거로 답한다.

응답 규칙:
- 카탈로그처럼 전부 나열하지 말 것. 문의에 맞는 핵심 상품 2~3개만 골라 추천한다.
- 각 상품은 한 줄로: "상품명 (가격원) — 짧은 추천 이유". 마크다운 볼드/리스트를 써도 된다.
- 전체 응답은 3~5문장 + 상품 2~3개 정도로 짧게. 한눈에 들어오게 한다.
- 찾는 상품이 목록에 없으면 솔직히 없다고 말하고, 가까운 대안을 1~2개만 제시한다.
- 마지막에 대화를 이어가는 짧은 되물음을 한 문장 덧붙인다 (예: "더 캐주얼한 쪽이 좋으세요, 깔끔한 쪽이 좋으세요?").
- 친근하되 과한 이모지와 미사여구는 줄인다.`;

function buildSystemPrompt(products: ProductRow[]): string {
  if (products.length === 0) {
    return `${SYSTEM_PROMPT_HEAD}\n\n[상품 목록]\n(현재 불러올 수 있는 상품이 없습니다.)`;
  }
  const lines = products
    .map(
      (p) =>
        `- ${p.name} / ${p.category ?? '미분류'} / ${p.price}원 / 재고 ${p.stock}개`,
    )
    .join('\n');
  return `${SYSTEM_PROMPT_HEAD}\n\n[상품 목록]\n${lines}`;
}

export async function POST(req: Request) {
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { messages, visitorId } = body;
  let conversationId = body.conversationId ?? null;

  if (!visitorId) {
    return NextResponse.json(
      { error: 'visitorId is required' },
      { status: 400 },
    );
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: 'messages is required' },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  // 1. conversation 확보 — 없으면 새로 생성. DB 실패해도 채팅은 계속.
  if (!conversationId) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ visitor_id: visitorId })
        .select('id')
        .single();
      if (error) throw error;
      conversationId = data.id as string;
    } catch (err) {
      console.error('[chat] conversation insert 실패:', err);
    }
  }

  // 2. 들어온 마지막 user 메시지 저장 (히스토리 전체 재저장 금지)
  if (conversationId) {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const content = lastUser ? extractTextFromMessage(lastUser) : '';
    if (content) {
      try {
        const { error } = await supabase.from('messages').insert({
          conversation_id: conversationId,
          role: 'user',
          content,
        });
        if (error) throw error;
      } catch (err) {
        console.error('[chat] user 메시지 저장 실패:', err);
      }
    }
  }

  // 3. 상품 목록 로드 — 실패 시 빈 목록으로 진행
  let products: ProductRow[] = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('name, category, price, stock');
    if (error) throw error;
    products = (data ?? []) as ProductRow[];
  } catch (err) {
    console.error('[chat] products 조회 실패:', err);
  }

  // 4. Gemini 스트리밍 — Gemini 실패만 하드 에러
  try {
    const modelMessages = await convertToModelMessages(messages);
    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: buildSystemPrompt(products),
      messages: modelMessages,
      onFinish: async ({ text }) => {
        if (!conversationId || !text) return;
        try {
          const { error } = await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: text,
          });
          if (error) throw error;
        } catch (err) {
          console.error('[chat] assistant 메시지 저장 실패:', err);
        }
      },
      onError: (e) => console.error('[chat] streamText error:', e),
    });

    return result.toUIMessageStreamResponse({
      headers: conversationId
        ? { 'X-Conversation-Id': conversationId }
        : undefined,
    });
  } catch (err) {
    console.error('[chat] Gemini 호출 실패:', err);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 },
    );
  }
}
