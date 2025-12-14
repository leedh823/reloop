/**
 * Mock AI 분석 결과 생성
 * 
 * 실제 OpenAI API 연결 전까지 사용하는 더미 분석 결과
 */

export interface MockAnalyzeResult {
  summary: string
  rootCause: string[]
  learnings: string[]
  nextActions: string[]
}

/**
 * Mock 분석 결과 생성
 * @param inputText 입력 텍스트
 * @returns Mock 분석 결과
 */
export function generateMockAnalyzeResult(inputText: string): MockAnalyzeResult {
  // 입력 텍스트의 길이와 내용을 기반으로 다양한 결과 생성
  const textLength = inputText.length
  const hasKeywords = {
    실패: inputText.includes('실패') || inputText.includes('실수'),
    시간: inputText.includes('시간') || inputText.includes('일정'),
    사람: inputText.includes('사람') || inputText.includes('팀') || inputText.includes('동료'),
    기술: inputText.includes('기술') || inputText.includes('코드') || inputText.includes('개발'),
  }

  // 요약 생성
  const summary = textLength > 200
    ? `이 실패는 ${hasKeywords.시간 ? '시간 관리' : hasKeywords.사람 ? '협업' : hasKeywords.기술 ? '기술적' : '전략적'} 측면에서 중요한 교훈을 제공합니다. 상황을 객관적으로 분석하고 개선점을 찾아야 합니다.`
    : `이 경험을 통해 ${hasKeywords.사람 ? '소통' : hasKeywords.기술 ? '기술적 역량' : '전략적 사고'}의 중요성을 깨달았습니다.`

  // 근본 원인 생성
  const rootCause: string[] = []
  if (hasKeywords.시간) {
    rootCause.push('충분한 시간 계획 수립 부족')
  }
  if (hasKeywords.사람) {
    rootCause.push('명확한 소통 및 역할 분담 부재')
  }
  if (hasKeywords.기술) {
    rootCause.push('기술적 검증 및 테스트 부족')
  }
  if (rootCause.length === 0) {
    rootCause.push('사전 준비 및 계획 수립 부족')
    rootCause.push('리스크 관리 미흡')
  }

  // 배운 점 생성
  const learnings: string[] = []
  if (hasKeywords.시간) {
    learnings.push('충분한 버퍼 시간을 확보하는 것이 중요하다')
  }
  if (hasKeywords.사람) {
    learnings.push('명확한 소통과 정기적인 체크인을 통해 문제를 조기에 발견할 수 있다')
  }
  if (hasKeywords.기술) {
    learnings.push('작은 규모로 먼저 검증하고 점진적으로 확장하는 접근이 효과적이다')
  }
  if (learnings.length === 0) {
    learnings.push('실패는 성장의 기회이며, 이를 통해 더 나은 방법을 찾을 수 있다')
    learnings.push('사전 준비와 계획이 결과에 큰 영향을 미친다')
  }

  // 다음 행동 생성
  const nextActions: string[] = [
    '구체적인 개선 계획을 수립하고 단계별로 실행한다',
    '유사한 상황에서의 체크리스트를 만들어 재발을 방지한다',
  ]
  if (hasKeywords.시간) {
    nextActions.push('프로젝트 일정에 20% 이상의 버퍼 시간을 포함한다')
  }
  if (hasKeywords.사람) {
    nextActions.push('정기적인 팀 미팅을 통해 진행 상황을 공유한다')
  }

  return {
    summary,
    rootCause,
    learnings,
    nextActions,
  }
}





