/**
 * ESLint 설정 파일
 * 코드 품질 및 스타일 규칙 정의
 */
module.exports = {
  // 코드 실행 환경 설정
  env: {
    browser: true,   // 브라우저 환경
    es6: true,       // ES6 지원
    jest: true,      // Jest 테스트 프레임워크
  },
  // 기본 규칙 설정 (Airbnb 스타일 가이드 사용)
  extends: 'airbnb-base',
  // 전역 변수 설정
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  // JavaScript 파싱 옵션
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  // 규칙 커스터마이징
  rules: {
    // 배열 메소드에서 파라미터 재할당은 허용
    'no-param-reassign': [2, { props: false }],
    // 개발 의존성 패키지도 import 허용
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        optionalDependencies: true,
        peerDependencies: false,
      },
    ],
    // 연산자 줄바꿈 규칙 비활성화
    'operator-linebreak': ['off'],
    // 객체 괄호 줄바꿈 규칙 비활성화
    'object-curly-newline': ['off'],
    // 암시적 화살표 함수 줄바꿈 규칙 비활성화
    'implicit-arrow-linebreak': ['off'],
    // 사용되지 않는 표현식에 대한 규칙 (삼항 연산자 허용)
    'no-unused-expressions': ['error', { allowTernary: true }],
  },
};
