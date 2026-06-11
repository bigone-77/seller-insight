/**
 * 어드민 전역 공통 에러/응답 유틸. sonner 등 브라우저 전용 의존성이 없는
 * 순수 모듈이라 서버 액션·route handler·클라이언트 어디서나 import 가능하다.
 * 토스트 표시는 lib/toast.ts가 담당한다.
 */

/** 커스텀 에러: 사용자용 message + 선택적 식별 code. */
export class AppError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

/** API/서버 액션의 통일된 성공·실패 응답 형태. */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string; code?: string } };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });

export const fail = (message: string, code?: string): Result<never> => ({
  ok: false,
  error: { message, code },
});

/** 임의의 throw 값을 사용자에게 보여줄 메시지로 정규화한다. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return '알 수 없는 오류가 발생했습니다.';
}
