import { type UIMessage } from 'ai';

import { Markdown } from '@/components/ui/markdown';
import { extractTextFromMessage } from '@/lib/message';
import { cn } from '@/lib/utils';

// 말풍선 1개. user는 평문, assistant는 마크다운으로 렌더한다.
// 스트리밍 커서는 이 호출 측에서 처리한다(Markdown은 순수 렌더).
export function ChatMessage({
  message,
  streaming,
}: {
  message: UIMessage;
  streaming: boolean;
}) {
  const isUser = message.role === 'user';
  const text = extractTextFromMessage(message);

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-3 py-2',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
          // Markdown이 display:contents라 마지막 문단이 인라인이 되면
          // 뒤의 커서가 텍스트 끝에 붙는다.
          streaming && '[&_p:last-child]:inline',
        )}
      >
        {isUser ? (
          <span className='whitespace-pre-wrap'>{text}</span>
        ) : (
          <>
            <Markdown>{text}</Markdown>
            {streaming && (
              <span className='animate-blink ml-0.5 inline-block'>▍</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
