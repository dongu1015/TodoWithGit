/**
 * 마우스 이벤트를 이용한 드래그 앤 드롭 구현 모듈
 * 할 일 항목들을 마우스로 드래그하여 순서 변경하는 기능 제공
 * @param {Object} todoApp 할 일 앱 객체
 * @param {Object} DOMHelpers DOM 조작 헬퍼 함수 모음
 * @param {Object} todoLocalStorage 로컬 스토리지 관리 객체
 * @returns {Function} 마우스 다운 이벤트 핸들러 함수
 */
import helpers from './helpers';

const mouse = (todoApp, DOMHelpers, todoLocalStorage) => {
  // 드래그 앤 드롭 헬퍼 함수들 가져오기
  const {
    getUpdatedList,
    getItemsToTranslate,
    enterDroppable,
    scrollListDown,
    scrollListTop,
    reOrderDOMList,
  } = helpers(DOMHelpers.getNumberFromString);

  /**
   * 마우스 다운 이벤트 핸들러
   * 드래그 앤 드롭 작업 시작
   * @param {Event} e 마우스 이벤트 객체
   */
  const handleMouseDown = (e) => {
    // 정렬된 목록이나 기본 프로젝트에서는 드래그 기능 비활성화
    if (
      todoApp.getSelected() < 4 ||
      todoApp.getSelectedProject().getSelectedSortType() !== 'none'
    ) {
      return;
    }

    const { target } = e;
    const todoItem = target.closest('.todo-item');
    // 이전 드래그에서 생성된 높이 고정 요소가 있으면 제거
    if (document.querySelector('.fix-height')) document.querySelector('.fix-height').remove();

    // 할 일 항목이 아니면 함수 종료
    if (!todoItem) return;

    // 드래그 가능한 요소를 포함할 컨테이너
    const container = todoItem.closest('.todo-list');

    // 트랜지션 활성화
    DOMHelpers.enableTransition(container);

    // 초기 마우스 좌표
    const initialPageX = e.pageX;
    const initialPageY = e.pageY;
    // 초기 항목 위치 값
    const initialItemTranslateY = todoItem.style.transform
      ? DOMHelpers.getNumberFromString(todoItem.style.transform)
      : 0;

    // 현재 아래에 있는 할 일 항목
    let currentTodoItemBelow = null;

    // 현재 Y 좌표
    let currentPageY = null;

    // 업데이트된 Y 위치
    let updatedTranslateY = initialItemTranslateY;

    // 드래그 항목의 left 값 고정
    const todoItemLeft = todoItem.getBoundingClientRect().left;

    // 타이머 ID 배열
    const timerIDs = [];

    // 컨테이너 높이 고정을 위한 요소 생성
    const fixHeight = DOMHelpers.createElement('div', '.fix-height');
    fixHeight.style.height = `${container.scrollHeight}px`;

    // 정확한 드래그 위치 계산을 위한 값
    const shiftX = e.clientX - todoItem.getBoundingClientRect().left;
    const shiftY = e.clientY - todoItem.getBoundingClientRect().top;

    // 항목 위에 오버레이 생성
    const overlay = DOMHelpers.createElement('div', '.drag-overlay');
    document.body.append(overlay);

    // 마우스 다운 시 초기값 설정
    const initialTodoItemTop = todoItem.getBoundingClientRect().top;

    // 컨테이너 상/하단 경계
    const containerBottom = container.getBoundingClientRect().bottom;
    const containerTop = container.getBoundingClientRect().top;
    const todoItemHeight =
      todoItem.offsetHeight + parseInt(getComputedStyle(todoItem).marginBottom, 10);

    // 초기 스크롤 위치
    const initialScrollTop = container.scrollTop;

    // 최소/최대 Y 이동 제한
    const maxTranslateY =
      containerBottom - todoItemHeight - 1 - initialTodoItemTop + initialItemTranslateY;
    const minTranslateY = containerTop + 1 - initialTodoItemTop + initialItemTranslateY;

    /**
     * 드래그 요소 위치 이동
     * @param {Number} translateY Y축 이동 거리
     */
    function moveAt(translateY) {
      // Y축 이동 범위 제한
      if (translateY > maxTranslateY) {
        todoItem.style.transform = `translateY(${maxTranslateY}px)`;
      } else if (translateY < minTranslateY) {
        todoItem.style.transform = `translateY(${minTranslateY}px)`;
      } else todoItem.style.transform = `translateY(${translateY}px)`;
    }

    /**
     * 드래그 가능한 요소에 스타일 설정
     */
    const setDraggableStyles = () => {
      todoItem.style.width = `${todoItem.offsetWidth}px`;
      todoItem.style.position = 'fixed';
      todoItem.style.left = `${todoItemLeft}px`;
      todoItem.style.top = `${initialTodoItemTop - initialItemTranslateY}px`;
    };

    /**
     * 드래그 가능한 요소의 스타일 초기화
     */
    const resetDraggableStyles = () => {
      todoItem.style.left = '';
      todoItem.style.top = '';
      todoItem.style.width = '';
      todoItem.style.position = '';
    };

    /**
     * 마우스 이동 이벤트 핸들러
     * @param {Event} event 마우스 이동 이벤트
     */
    const onMouseMove = (event) => {
      // 5픽셀 이상 이동한 경우에만 드래그 활성화
      if (Math.abs(initialPageX - event.pageX) > 5 || Math.abs(initialPageY - event.pageY) > 5) {
        const translateY = initialItemTranslateY - initialPageY + event.pageY;
        moveAt(translateY);

        // 드래그 클래스가 없으면 추가
        if (!todoItem.classList.contains('dragged')) {
          setDraggableStyles();
          DOMHelpers.addClass(todoItem, 'dragged');
        }

        // 컨테이너 하단에 가까워지면 자동 스크롤 다운
        if (
          event.pageY > containerBottom - 40 &&
          (currentPageY === null || currentPageY <= containerBottom - 40)
        ) {
          timerIDs.push(...scrollListDown(container));
          currentPageY = event.pageY;
        } else if (event.pageY <= containerBottom - 40 && currentPageY > containerBottom - 40) {
          currentPageY = event.pageY;
          // 스크롤이 필요 없으면 타이머 정리
          timerIDs.forEach((timerID) => clearTimeout(timerID));
          timerIDs.length = 0;
        }

        // 컨테이너 상단에 가까워지면 자동 스크롤 업
        if (
          event.pageY < containerTop + 40 &&
          (currentPageY === null || currentPageY >= containerTop + 40)
        ) {
          timerIDs.push(...scrollListTop(container, event));
          currentPageY = event.pageY;
        } else if (event.pageY >= containerTop + 40 && currentPageY < containerTop + 40) {
          currentPageY = event.pageY;
          // 스크롤이 필요 없으면 타이머 정리
          timerIDs.forEach((timerID) => clearTimeout(timerID));
          timerIDs.length = 0;
        }
      }

      // 드래그 시작하면 높이 고정 요소 추가
      if (!todoItem.classList.contains('dragged')) {
        container.append(fixHeight);
      }

      // 오버레이 위치 설정
      if (!overlay.style.left) {
        overlay.style.left = `${event.pageX - shiftX}px`;
        overlay.style.width = `${todoItem.offsetWidth}px`;
        overlay.style.height = `${todoItem.offsetHeight}px`;
      }

      overlay.style.top = `${event.pageY - shiftY}px`;

      // 현재 커서 아래의 요소 확인을 위해 임시로 드래그 요소 숨김
      DOMHelpers.addClass(todoItem, 'hide');
      DOMHelpers.addClass(overlay, 'hide');
      const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      DOMHelpers.removeClass(todoItem, 'hide');
      DOMHelpers.removeClass(overlay, 'hide');

      if (!elemBelow) return;

      // 커서 아래에 있는 할 일 항목 찾기
      const todoItemBelow = elemBelow.closest('.todo-item');

      // 커서 아래의 항목이 변경되면 처리
      if (currentTodoItemBelow !== todoItemBelow) {
        currentTodoItemBelow = todoItemBelow;

        // 새로운 위치에 항목 진입 처리
        if (currentTodoItemBelow) {
          const belowTranslateY = currentTodoItemBelow.style.transform
            ? DOMHelpers.getNumberFromString(currentTodoItemBelow.style.transform)
            : 0;
          updatedTranslateY =
            updatedTranslateY > belowTranslateY
              ? belowTranslateY
              : belowTranslateY - (todoItem.offsetHeight - currentTodoItemBelow.offsetHeight);
          const items = todoApp.getSelectedProject().getItems();
          const itemsToTranslate = getItemsToTranslate(
            items,
            container,
            todoItem,
            currentTodoItemBelow,
          );
          // 드롭 가능한 영역에 진입 시 시각적 효과 적용
          enterDroppable(items, itemsToTranslate, todoItem, currentTodoItemBelow);
          // 목록 순서 업데이트
          getUpdatedList(items, todoItem, currentTodoItemBelow);
        }
      }
    };

    /**
     * 마우스 업 이벤트 핸들러
     * 드래그 앤 드롭 작업 종료
     */
    const onMouseUp = () => {
      // 오버레이 제거
      overlay.remove();

      // 항목을 새 위치에 배치
      const initialTranslateY = todoItem.style.transform
        ? DOMHelpers.getNumberFromString(todoItem.style.transform)
        : 0;

      // 드래그 스타일 초기화
      resetDraggableStyles();
      const containerIsScrolled = initialScrollTop !== container.scrollTop;
      // 타이머 정리
      timerIDs.forEach((timerID) => clearTimeout(timerID));

      // 위치가 변경된 경우
      if (initialTranslateY !== updatedTranslateY) {
        todoItem.style.transform = `translateY(${updatedTranslateY}px)`;

        // 테두리 색상 트랜지션 비활성화, 변환 속성만 유지
        todoItem.style.transition = 'box-shadow .25s ease-out, transform 0.15s ease';

        // 트랜지션 완료 후 드래그 클래스 제거 및 스타일 초기화
        const handleTransition = () => {
          DOMHelpers.removeClass(todoItem, 'dragged');
          todoItem.style.transition = '';
          DOMHelpers.off(todoItem, 'transitionend', handleTransition);

          // DOM 요소 순서 재조정
          const items = todoApp.getSelectedProject().getItems();
          reOrderDOMList(container, items);
        };

        // 컨테이너가 스크롤된 경우 즉시 처리
        if (containerIsScrolled) {
          handleTransition();
        } else {
          // 트랜지션 이벤트 리스너 등록
          DOMHelpers.on(todoItem, 'transitionend', handleTransition);
        }
      } else {
        // 드래그 클래스 제거
        DOMHelpers.removeClass(todoItem, 'dragged');

        // 위치가 변경된 경우 DOM 요소 순서 재조정
        if (initialItemTranslateY !== updatedTranslateY) {
          const items = todoApp.getSelectedProject().getItems();
          reOrderDOMList(container, items);
        }
      }

      // 이벤트 리스너 제거
      DOMHelpers.off(document, 'mousemove', onMouseMove);
      DOMHelpers.off(document, 'mouseup', onMouseUp);
      todoItem.onclick = null;

      // 로컬스토리지 업데이트
      todoLocalStorage.populateStorage(todoApp);
    };

    // 마우스 이동 및 업 이벤트 리스너 등록
    DOMHelpers.on(document, 'mousemove', onMouseMove);
    DOMHelpers.on(document, 'mouseup', onMouseUp);

    // 기본 드래그 동작 방지
    todoItem.ondragstart = () => false;
  };

  return handleMouseDown;
};

export default mouse;
