/**
 * DOM 조작을 위한 헬퍼 함수들을 제공하는 모듈
 * 요소 생성, 이벤트 처리, 클래스 관리 등의 기능 포함
 * @returns {Object} DOM 헬퍼 함수들을 담은 객체
 */
const DOMHelpers = () => {
  /**
   * 지정된 태그와 ID 또는 클래스로 DOM 요소 생성
   * @param {string} tag 생성할 HTML 태그명
   * @param {string} idClass '#id' 또는 '.class' 형태의 식별자
   * @returns {HTMLElement} 생성된 DOM 요소
   */
  const createElement = (tag, idClass) => {
    let elem = null;
    elem = document.createElement(tag);

    // idClass가 있으면 ID 또는 클래스 적용
    if (idClass) {
      switch (idClass.charAt(0)) {
        case '#': // ID 적용
          elem.id = idClass.slice(1);
          break;
        case '.': // 클래스 적용
          elem.classList.add(idClass.slice(1));
          break;
        default:
      }
    }

    return elem;
  };

  /**
   * 요소에 이벤트 리스너 추가
   * @param {HTMLElement} target 이벤트 대상 요소
   * @param {string} type 이벤트 유형
   * @param {Function} callback 이벤트 핸들러 함수
   * @param {Object} options 이벤트 옵션
   */
  const on = (target, type, callback, options) => target.addEventListener(type, callback, options);

  /**
   * 요소에서 이벤트 리스너 제거
   * @param {HTMLElement} target 이벤트 대상 요소
   * @param {string} type 이벤트 유형
   * @param {Function} callback 이벤트 핸들러 함수
   */
  const off = (target, type, callback) => target.removeEventListener(type, callback);

  /**
   * 부모 노드의 모든 자식 요소 제거
   * @param {HTMLElement} parentNode 부모 요소
   */
  const empty = (parentNode) => {
    while (parentNode.firstChild) {
      parentNode.removeChild(parentNode.firstChild);
    }
  };

  /**
   * 선택자에 맞는 첫 번째 요소 반환
   * @param {string} selector CSS 선택자
   * @returns {HTMLElement|null} 찾은 요소 또는 null
   */
  const getElement = (selector) => document.querySelector(selector);

  /**
   * 선택자에 맞는 모든 요소 반환
   * @param {string} selector CSS 선택자
   * @returns {NodeList} 찾은 요소들의 목록
   */
  const getElements = (selector) => document.querySelectorAll(selector);

  /**
   * 요소를 래퍼로 감싸기
   * @param {HTMLElement} elem 감쌀 요소
   * @param {string} className 래퍼 클래스
   * @param {string} parentElem 생성할 래퍼 태그 (기본값: 'div')
   * @returns {HTMLElement} 래퍼 요소
   */
  const wrap = (elem, className, parentElem = 'div') => {
    const wrapper = document.createElement(parentElem);
    wrapper.append(elem);

    if (className) wrapper.classList.add(className);

    return wrapper;
  };

  /**
   * 리스트 내에서 selected 클래스를 가진 요소의 선택 해제
   * @param {HTMLElement} ul 검사할 리스트 요소
   */
  const unselect = (ul) => {
    Array.from(ul.children).some((li) => {
      if (li.classList.contains('selected')) {
        li.classList.remove('selected');
        return true;
      }

      return false;
    });
  };

  /**
   * 요소에 클래스 추가
   * @param {HTMLElement} elem 대상 요소
   * @param  {...string} className 추가할 클래스명들
   */
  const addClass = (elem, ...className) => elem.classList.add(...className);

  /**
   * 요소에서 클래스 제거
   * @param {HTMLElement} elem 대상 요소
   * @param  {...string} className 제거할 클래스명들
   */
  const removeClass = (elem, ...className) => elem.classList.remove(...className);

  /**
   * 요소의 클래스 토글
   * @param {HTMLElement} elem 대상 요소
   * @param {string} className 토글할 클래스명
   */
  const toggleClass = (elem, className) => elem.classList.toggle(className);

  /**
   * 요소 숨기기 ('hide' 클래스 추가)
   * @param {HTMLElement} elem 숨길 요소
   */
  const hideElement = (elem) => {
    addClass(elem, 'hide');
  };

  /**
   * 요소 표시하기 ('hide' 클래스 제거)
   * @param {HTMLElement} elem 표시할 요소
   */
  const showElement = (elem) => {
    removeClass(elem, 'hide');
  };

  /**
   * 요소에서 특정 클래스들을 제거
   * @param {HTMLElement} elem 대상 요소
   * @param {Array} classList 제거할 클래스 목록
   */
  const resetClassList = (elem, classList) => {
    Array.from(elem.classList).forEach((className) => {
      if (classList.includes(className)) removeClass(elem, className);
    });
  };

  /**
   * 문자열에서 숫자 추출
   * @param {string} value 숫자를 포함한 문자열
   * @returns {number} 추출된 숫자
   */
  const getNumberFromString = (value) => Number(value.match(/[0-9]/g).join(''));

  /**
   * 리스트와 그 자식 요소들의 트랜지션 비활성화
   * @param {HTMLElement} list 대상 리스트
   */
  const disableTransition = (list) => {
    list.style.transition = 'none';

    Array.from(list.children).forEach((item) => {
      item.style.transition = 'box-shadow .25s ease-out, border-color .15s linear';
    });
  };

  /**
   * 리스트와 그 자식 요소들의 트랜지션 활성화
   * @param {HTMLElement} list 대상 리스트
   */
  const enableTransition = (list) => {
    list.style.transition = '';

    Array.from(list.children).forEach((item) => {
      item.style.transition = '';
    });
  };

  /**
   * 리스트와 그 자식 요소들의 트랜지션 토글
   * @param {HTMLElement} list 대상 리스트
   */
  const toggleTransition = (list) => {
    list.style.transition ? enableTransition(list) : disableTransition(list);
  };

  /**
   * 두 형제 요소의 위치를 바꿈
   * @param {HTMLElement} elem1 첫 번째 요소
   * @param {HTMLElement} elem2 두 번째 요소
   */
  const swapElements = (elem1, elem2) => {
    const { parentElement } = elem1;
    const { children } = parentElement;
    const indexElem1 = Array.from(children).indexOf(elem1);
    const indexElem2 = Array.from(children).indexOf(elem2);

    // 첫 번째 요소가 두 번째 요소보다 아래에 있는 경우
    if (indexElem1 < indexElem2) {
      indexElem1 ? elem1.before(elem2) : elem1.after(elem2);
      indexElem2 ? children[indexElem2].after(elem1) : children[indexElem2].before(elem1);
    } 
    // 첫 번째 요소가 두 번째 요소보다 위에 있는 경우
    else if (indexElem1 > indexElem2) {
      indexElem2 ? elem2.before(elem1) : elem2.after(elem1);
      indexElem1 ? children[indexElem1].after(elem2) : children[indexElem1].before(elem2);
    }
  };

  // 모듈의 공개 API 반환
  return {
    createElement,
    on,
    off,
    empty,
    getElement,
    getElements,
    wrap,
    unselect,
    addClass,
    removeClass,
    toggleClass,
    hideElement,
    showElement,
    resetClassList,
    getNumberFromString,
    disableTransition,
    enableTransition,
    toggleTransition,
    swapElements,
  };
};

export default DOMHelpers;
