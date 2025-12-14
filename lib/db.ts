import { Failure } from '@/types/failure';

/**
 * 메모리 기반 가짜 DB
 * 
 * 주의: 서버를 재시작하면 모든 데이터가 초기화됩니다.
 * 프로덕션 환경에서는 실제 데이터베이스(PostgreSQL, MongoDB 등)를 사용하는 것을 권장합니다.
 */
let failures: Failure[] = [];

// 더미 데이터 초기화 (서버 시작 시)
function initializeDummyData() {
  if (failures.length === 0) {
    const dummyFailures: Failure[] = [
      {
        id: 'failure_dummy_1',
        title: '프로젝트 발표 준비 실패',
        summary: '중요한 프로젝트 발표 전날 밤새 준비했지만, 프레젠테이션 파일이 손상되어 발표를 제대로 하지 못했습니다.',
        detail: '발표 전날 밤새 PPT를 완성했는데, 아침에 파일을 열어보니 일부 슬라이드가 깨져있었습니다. 백업 파일도 없어서 당황했고, 급하게 수정하려 했지만 시간이 부족했습니다. 결국 발표 중간에 슬라이드가 제대로 표시되지 않아 설명이 어려웠습니다.',
        category: 'school',
        emotion: 'anxiety',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        aiStatus: 'none',
      },
      {
        id: 'failure_dummy_2',
        title: '면접에서 답변을 제대로 못함',
        summary: '준비했던 면접 질문이 나왔지만, 긴장해서 답변을 제대로 하지 못했습니다.',
        detail: '면접 전에 충분히 준비했다고 생각했는데, 실제 면접장에 들어가니 머리가 하얗게 변했습니다. 준비했던 답변을 말하려 했지만 말이 꼬이고, 면접관의 질문에 제대로 답변하지 못했습니다. 면접 후에 생각해보니 너무 긴장했던 것 같습니다.',
        category: 'job',
        emotion: 'regret',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        aiStatus: 'none',
      },
      {
        id: 'failure_dummy_3',
        title: '팀 프로젝트에서 역할을 제대로 수행하지 못함',
        summary: '팀 프로젝트에서 맡은 부분을 제때 완성하지 못해 팀원들에게 피해를 줬습니다.',
        detail: '팀 프로젝트에서 백엔드 부분을 맡았는데, 일정을 제대로 관리하지 못했습니다. 초반에는 여유롭다고 생각했지만, 중간에 예상치 못한 문제들이 발생했고 결국 마감일을 넘겨버렸습니다. 팀원들이 기다려야 했고, 전체 일정에 영향을 줬습니다.',
        category: 'school',
        emotion: 'frustration',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        aiStatus: 'none',
      },
      {
        id: 'failure_dummy_4',
        title: '중요한 약속을 잊어버림',
        summary: '친구의 생일 파티 약속을 완전히 잊어버려서 참석하지 못했습니다.',
        detail: '친구가 한 달 전부터 생일 파티를 계획했고, 저도 참석하겠다고 약속했습니다. 그런데 그날 다른 일정이 생겨서 바빴고, 결국 약속을 완전히 잊어버렸습니다. 친구가 연락했을 때 이미 파티가 끝난 후였고, 정말 미안했습니다.',
        category: 'relationship',
        emotion: 'regret',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        aiStatus: 'none',
      },
      {
        id: 'failure_dummy_5',
        title: '시험 공부를 제대로 하지 못함',
        summary: '중간고사 시험을 앞두고 공부 계획을 세웠지만, 실행하지 못해 성적이 좋지 않았습니다.',
        detail: '시험 2주 전부터 공부 계획을 세우고 매일 조금씩 공부하기로 했습니다. 하지만 첫 주는 다른 일들로 바빠서 공부를 제대로 하지 못했고, 두 번째 주에는 너무 많은 양을 한꺼번에 공부하려다가 제대로 소화하지 못했습니다. 결국 시험에서 좋은 성적을 받지 못했습니다.',
        category: 'school',
        emotion: 'frustration',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        aiStatus: 'none',
      },
    ];
    failures = dummyFailures;
  }
}

// 초기화 실행
initializeDummyData();

export function getAllFailures(): Failure[] {
  // 더미 데이터가 없으면 다시 초기화
  const dummyCount = failures.filter(f => f.id.startsWith('failure_dummy_')).length;
  if (dummyCount < 5) {
    initializeDummyData();
  }
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
    createdAt: new Date().toISOString(),
  };
  failures.push(newFailure);
  return newFailure;
}

export function updateFailure(id: string, updates: Partial<Omit<Failure, 'id' | 'createdAt'>>): Failure | null {
  const index = failures.findIndex(f => f.id === id);
  if (index === -1) {
    return null;
  }
  failures[index] = {
    ...failures[index],
    ...updates,
  };
  return failures[index];
}

export function deleteFailure(id: string): boolean {
  const index = failures.findIndex(f => f.id === id);
  if (index === -1) {
    return false;
  }
  failures.splice(index, 1);
  return true;
}

