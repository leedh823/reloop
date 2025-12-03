import { Failure } from '@/types';

/**
 * 메모리 기반 가짜 DB
 * 
 * 주의: 서버를 재시작하면 모든 데이터가 초기화됩니다.
 * 프로덕션 환경에서는 실제 데이터베이스(PostgreSQL, MongoDB 등)를 사용하는 것을 권장합니다.
 */
let failures: Failure[] = [];

export function getAllFailures(): Failure[] {
  return failures.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getFailureById(id: string): Failure | undefined {
  return failures.find(f => f.id === id);
}

export function createFailure(failure: Omit<Failure, 'id' | 'createdAt'>): Failure {
  const newFailure: Failure = {
    ...failure,
    id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
    createdAt: new Date(),
  };
  failures.push(newFailure);
  return newFailure;
}

