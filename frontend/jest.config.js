/**
 * Jest 테스트 프레임워크 설정 파일
 * 이미지, 스타일 등의 파일을 처리하는 방법 정의
 */
module.exports = {
  // 다양한 파일 형식에 대한 모킹 설정
  moduleNameMapper: {
    // 이미지 및 미디어 파일 모킹
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    // CSS 및 스타일 파일 모킹
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
    // window 객체를 모킹하기 위한 글로벌 설정
    globals: {
      window: {},
    },
  },
};
