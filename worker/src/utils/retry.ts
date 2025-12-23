export interface RetryOptions {
  maxRetries: number;
  delays: number[]; // 재시도 간격 (ms)
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * 재시도 로직 (1초, 2초, 4초 간격)
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, delays: [1000, 2000, 4000] }
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < options.maxRetries) {
        const delay = options.delays[attempt] || options.delays[options.delays.length - 1];
        
        if (options.onRetry) {
          options.onRetry(lastError, attempt + 1);
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}










