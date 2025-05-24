/**
 * PostCSS 설정 파일
 * CSS 처리 플러그인 설정
 */
module.exports = {
  plugins: {
    // CSS @import 구문 해석 및 처리
    'postcss-import': {},
    // 최신 CSS 기능을 현재 브라우저에서 사용 가능하도록 변환
    'postcss-preset-env': {},
    // CSS 최소화 및 최적화
    cssnano: {},
  },
};
