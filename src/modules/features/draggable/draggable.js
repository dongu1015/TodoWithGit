/**
 * 드래그 앤 드롭 기능을 제공하는 메인 모듈
 * 마우스와 터치 이벤트를 통합하여 할 일 항목의 순서를 변경할 수 있게 함
 * @param {Object} todoApp 할 일 앱 모델 객체
 * @param {Object} todoLocalStorage 로컬 스토리지 관리 객체
 * @returns {void}
 */
import DOMHelpers from '../../helpers/DOMHelpers';
import mouse from './mouse';
import touch from './touch';

const draggable = (todoApp, todoLocalStorage) => {
  // DOM 조작을 위한 헬퍼 함수들 초기화
  const helpers = DOMHelpers();

  // 마우스(비터치 기기) 이벤트 핸들러 설정
  const handleMouseDown = mouse(todoApp, helpers, todoLocalStorage);
  // 터치 기기용 이벤트 핸들러 설정
  const handleTouchStart = touch(todoApp, helpers, todoLocalStorage);

  // 문서 전체에 마우스와 터치 이벤트 리스너 등록
  helpers.on(document.body, 'mousedown', handleMouseDown);
  helpers.on(document.body, 'touchstart', handleTouchStart);
};

export default draggable;
