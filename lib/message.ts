import type { UIMessage } from 'ai';

/** UIMessage의 text part들만 이어붙여 평문 문자열로 추출한다. */
export function extractTextFromMessage(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('')
    .trim();
}
