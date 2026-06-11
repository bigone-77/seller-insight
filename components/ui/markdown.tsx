import ReactMarkdown from 'react-markdown';

import remarkGfm from 'remark-gfm';

// 범용 마크다운 렌더(순수). 최소 타이포만 — descendant 변이로 처리(커스텀 색 없음).
// 래퍼는 display:contents라 자체 박스를 만들지 않아, 호출 측에서 뒤에 인라인 요소(커서 등)를
// 마지막 텍스트 끝에 자연스럽게 붙일 수 있다.
export function Markdown({ children }: { children: string }) {
  return (
    <div className='contents [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_strong]:font-medium [&_ul]:list-disc [&_ul]:pl-5'>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
