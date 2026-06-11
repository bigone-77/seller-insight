import { toast } from 'sonner';

import { getErrorMessage } from '@/lib/error';

/** 어떤 형태의 에러든 받아 사용자 친화적 토스트로 표시한다. */
export function showError(error: unknown): void {
  toast.error(getErrorMessage(error));
}

export function showSuccess(message: string): void {
  toast.success(message);
}
