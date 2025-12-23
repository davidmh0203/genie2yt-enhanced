import { ConvertLogRepository } from '../src/repositories/ConvertLogRepository';
import type { ConvertLog } from '../src/types';

// Mock D1Database
class MockD1Database {
  private data: ConvertLog[] = [];

  prepare(query: string) {
    return {
      bind: (...args: any[]) => {
        return {
          first: async <T>(): Promise<T | null> => {
            // 간단한 mock 구현
            return null;
          },
          all: async <T>(): Promise<{ results: T[] }> => {
            // getErrorLogs 쿼리 파싱
            if (query.includes('fail_count > 0 OR error_msg IS NOT NULL')) {
              let filtered = this.data.filter(
                (log) => log.fail_count > 0 || log.error_msg !== null
              );

              // userId 필터링
              if (query.includes('user_id = ?')) {
                const userId = args[0];
                filtered = filtered.filter((log) => log.user_id === userId);
              }

              // LIMIT 적용
              const limit = args[args.length - 1];
              filtered = filtered.slice(0, limit);

              return { results: filtered as T[] };
            }
            return { results: [] };
          },
          run: async () => {},
        };
      },
    };
  }
}

describe('TC-05: ConvertLogRepository.getErrorLogs() - MCDC Test', () => {
  let repository: ConvertLogRepository;
  let mockDb: MockD1Database;

  beforeEach(() => {
    mockDb = new MockD1Database();
    repository = new ConvertLogRepository(mockDb as any);
  });

  // Part 1: userId가 없는 경우 (OR 조건)
  describe('Part 1: userId가 없는 경우 (C1 || C2)', () => {
    beforeEach(() => {
      // 테스트 데이터 설정
      (mockDb as any).data = [
        {
          log_id: 1,
          user_id: 1,
          src_playlist: 'test1',
          fail_count: 5,
          error_msg: 'error',
          success_count: 0,
          total_count: 5,
          created_at: '2024-01-01',
        },
        {
          log_id: 2,
          user_id: 1,
          src_playlist: 'test2',
          fail_count: 3,
          error_msg: null,
          success_count: 0,
          total_count: 3,
          created_at: '2024-01-02',
        },
        {
          log_id: 3,
          user_id: 1,
          src_playlist: 'test3',
          fail_count: 0,
          error_msg: 'error',
          success_count: 5,
          total_count: 5,
          created_at: '2024-01-03',
        },
        {
          log_id: 4,
          user_id: 1,
          src_playlist: 'test4',
          fail_count: 0,
          error_msg: null,
          success_count: 5,
          total_count: 5,
          created_at: '2024-01-04',
        },
      ];
    });

    // TC-05-01: C1=참, C2=참 → 결과=참
    test('TC-05-01: C1=true, C2=true → result=true', async () => {
      const result = await repository.getErrorLogs(undefined, 50);
      // fail_count > 0 AND error_msg IS NOT NULL인 로그가 포함되어야 함
      const hasBoth = result.some((log) => log.fail_count > 0 && log.error_msg !== null);
      expect(hasBoth).toBe(true);
    });

    // TC-05-02: C1=참, C2=거짓 → 결과=참
    test('TC-05-02: C1=true, C2=false → result=true', async () => {
      const result = await repository.getErrorLogs(undefined, 50);
      // fail_count > 0 AND error_msg IS NULL인 로그가 포함되어야 함
      const hasFailCount = result.some((log) => log.fail_count > 0 && log.error_msg === null);
      expect(hasFailCount).toBe(true);
    });

    // TC-05-03: C1=거짓, C2=참 → 결과=참
    test('TC-05-03: C1=false, C2=true → result=true', async () => {
      const result = await repository.getErrorLogs(undefined, 50);
      // fail_count = 0 AND error_msg IS NOT NULL인 로그가 포함되어야 함
      const hasErrorMsg = result.some((log) => log.fail_count === 0 && log.error_msg !== null);
      expect(hasErrorMsg).toBe(true);
    });

    // TC-05-04: C1=거짓, C2=거짓 → 결과=거짓
    test('TC-05-04: C1=false, C2=false → result=false', async () => {
      const result = await repository.getErrorLogs(undefined, 50);
      // fail_count = 0 AND error_msg IS NULL인 로그는 포함되지 않아야 함
      const hasNeither = result.some((log) => log.fail_count === 0 && log.error_msg === null);
      expect(hasNeither).toBe(false);
    });
  });

  // Part 2: userId가 있는 경우 (복합 조건)
  describe('Part 2: userId가 있는 경우 ((C1 || C2) && C3)', () => {
    beforeEach(() => {
      (mockDb as any).data = [
        {
          log_id: 5,
          user_id: 123,
          src_playlist: 'test5',
          fail_count: 5,
          error_msg: 'error',
          success_count: 0,
          total_count: 5,
          created_at: '2024-01-05',
        },
        {
          log_id: 6,
          user_id: 123,
          src_playlist: 'test6',
          fail_count: 3,
          error_msg: null,
          success_count: 0,
          total_count: 3,
          created_at: '2024-01-06',
        },
        {
          log_id: 7,
          user_id: 123,
          src_playlist: 'test7',
          fail_count: 0,
          error_msg: 'error',
          success_count: 5,
          total_count: 5,
          created_at: '2024-01-07',
        },
        {
          log_id: 8,
          user_id: 123,
          src_playlist: 'test8',
          fail_count: 0,
          error_msg: null,
          success_count: 5,
          total_count: 5,
          created_at: '2024-01-08',
        },
        {
          log_id: 9,
          user_id: 456, // 다른 userId
          src_playlist: 'test9',
          fail_count: 5,
          error_msg: 'error',
          success_count: 0,
          total_count: 5,
          created_at: '2024-01-09',
        },
      ];
    });

    // TC-05-05: (C1||C2)=참, C3=참 → 결과=참
    test('TC-05-05: (C1||C2)=true, C3=true → result=true', async () => {
      const result = await repository.getErrorLogs(123, 50);
      // userId=123이고 (fail_count > 0 OR error_msg IS NOT NULL)인 로그가 포함되어야 함
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((log) => log.user_id === 123)).toBe(true);
      expect(result.some((log) => log.fail_count > 0 || log.error_msg !== null)).toBe(true);
    });

    // TC-05-06: (C1||C2)=참, C3=참 → 결과=참
    test('TC-05-06: (C1||C2)=true (C1 only), C3=true → result=true', async () => {
      const result = await repository.getErrorLogs(123, 50);
      // userId=123이고 fail_count > 0인 로그가 포함되어야 함
      const hasFailCount = result.some((log) => log.user_id === 123 && log.fail_count > 0);
      expect(hasFailCount).toBe(true);
    });

    // TC-05-07: (C1||C2)=참, C3=참 → 결과=참
    test('TC-05-07: (C1||C2)=true (C2 only), C3=true → result=true', async () => {
      const result = await repository.getErrorLogs(123, 50);
      // userId=123이고 error_msg IS NOT NULL인 로그가 포함되어야 함
      const hasErrorMsg = result.some((log) => log.user_id === 123 && log.error_msg !== null);
      expect(hasErrorMsg).toBe(true);
    });

    // TC-05-08: (C1||C2)=거짓, C3=참 → 결과=거짓
    test('TC-05-08: (C1||C2)=false, C3=true → result=false', async () => {
      const result = await repository.getErrorLogs(123, 50);
      // userId=123이지만 fail_count = 0 AND error_msg IS NULL인 로그는 포함되지 않아야 함
      const hasNeither = result.some(
        (log) => log.user_id === 123 && log.fail_count === 0 && log.error_msg === null
      );
      expect(hasNeither).toBe(false);
    });

    // TC-05-09: (C1||C2)=참, C3=거짓 → 결과=거짓
    test('TC-05-09: (C1||C2)=true, C3=false → result=false', async () => {
      const result = await repository.getErrorLogs(456, 50);
      // userId=456인 로그는 포함되지만, userId=123인 로그는 포함되지 않아야 함
      expect(result.every((log) => log.user_id === 456)).toBe(true);
      expect(result.some((log) => log.user_id === 123)).toBe(false);
    });
  });
});










