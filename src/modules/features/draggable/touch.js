/**
 * 터치 이벤트를 이용한 드래그 앤 드롭 구현 모듈
 * 모바일 기기나 터치스크린에서 할 일 항목을 드래그하여 순서 변경하는 기능 제공
 * @param {Object} todoApp 할 일 앱 객체
 * @param {Object} DOMHelpers DOM 조작 헬퍼 함수 모음
 * @param {Object} todoLocalStorage 로컬 스토리지 관리 객체
 * @returns {Function} 터치 시작 이벤트 핸들러 함수
 */
import helpers from './helpers';

const touch = (todoApp, DOMHelpers, todoLocalStorage) => {
  // 드래그 앤 드롭 헬퍼 함수들 가져오기
  const {
    getUpdatedList,     // 목록 업데이트 함수
    getItemsToTranslate, // 이동할 항목들 계산 함수
    enterDroppable,     // 드롭 가능 영역 진입 처리 함수
    scrollListDown,     // 목록 아래로 스크롤 함수
    scrollListTop,      // 목록 위로 스크롤 함수
    reOrderDOMList,     // DOM 목록 재정렬 함수
  } = helpers(DOMHelpers.getNumberFromString);

  /**
   * 터치 시작 이벤트 핸들러
   * @param {TouchEvent} e 터치 이벤트 객체
   * @returns {void}
   */
  const handleTouchStart = (e) => {
    // 기본 프로젝트 또는 정렬된 목록에서는 드래그 앤 드롭 비활성화
    if (
      todoApp.getSelected() < 4 ||
      todoApp.getSelectedProject().getSelectedSortType() !== 'none'
    ) {
      return;
    }
    const { target } = e;
    const todoItem = target.closest('.todo-item');
    if (document.querySelector('.fix-height')) document.querySelector('.fix-height').remove();

    if (!todoItem) return;

    // 드래그 요소를 유지할 컨테이너
    const container = todoItem.closest('.todo-list');

    // 트랜지션 활성화
    DOMHelpers.enableTransition(container);

    // 초기 Y 좌표 가져오기
    const initialPageY = e.touches[0].pageY;
    const initialItemTranslateY = todoItem.style.transform
      ? DOMHelpers.getNumberFromString(todoItem.style.transform)
      : 0;

    // 현재 아래에 위치한 할 일 항목
    let currentTodoItemBelow = null;

    // 현재 페이지 Y 좌표
    let currentPageY = null;

    // 아래 할 일 항목들로부터의 새 translateY 값
    let updatedTranslateY = initialItemTranslateY;

    // 가로 위치를 고정하기 위한 드래그 항목의 왼쪽 값
    const todoItemLeft = todoItem.getBoundingClientRect().left;

    // 타이머 ID 배열
    const timerIDs = [];    
    // 높이를 고정하기 위해 할 일 목록 내부에 요소 생성
    const fixHeight = DOMHelpers.createElement('div', '.fix-height');
    fixHeight.style.height = `${container.scrollHeight}px`;

    // 정확한 위치 계산: 터치 시 요소 위의 정확한 지점 계산
    const shiftX = e.touches[0].clientX - todoItem.getBoundingClientRect().left;
    const shiftY = e.touches[0].clientY - todoItem.getBoundingClientRect().top;

    // 항목 위에 오버레이 생성
    const overlay = DOMHelpers.createElement('div', '.drag-overlay');
    document.body.append(overlay);

    // 터치 시작 시 초기값 가져오기
    const initialTodoItemTop = todoItem.getBoundingClientRect().top;

    // 컨테이너 상/하단 좌표
    const containerBottom = container.getBoundingClientRect().bottom;
    const containerTop = container.getBoundingClientRect().top;
    const todoItemHeight =
      todoItem.offsetHeight + parseInt(getComputedStyle(todoItem).marginBottom, 10);

    // 초기 스크롤 상단 위치
    const initialScrollTop = container.scrollTop;

    // 최소/최대 translateY 값
    const maxTranslateY =
      containerBottom - todoItemHeight - 1 - initialTodoItemTop + initialItemTranslateY;

    const minTranslateY = containerTop + 1 - initialTodoItemTop + initialItemTranslateY;    

    /**
     * 드래그 가능한 요소의 새 좌표를 가져오는 헬퍼 함수
     * @param {Number} pageY 문서 상의 요소 상단 좌표
     * @param {Number} translateY 요소의 translateY 값
     */
    function moveAt(translateY) {
      if (translateY > maxTranslateY) {
        todoItem.style.transform = `translateY(${maxTranslateY}px)`;
      } else if (translateY < minTranslateY) {
        todoItem.style.transform = `translateY(${minTranslateY}px)`;
      } else todoItem.style.transform = `translateY(${translateY}px)`;
    }

    const setDraggableStyles = () => {
      todoItem.style.width = `${todoItem.offsetWidth}px`;
      todoItem.style.position = 'fixed';
      todoItem.style.left = `${todoItemLeft}px`;
      todoItem.style.top = `${initialTodoItemTop - initialItemTranslateY}px`;
    };

    const resetDraggableStyles = () => {
      todoItem.style.left = '';
      todoItem.style.top = '';
      todoItem.style.width = '';
      todoItem.style.position = '';
    };

    /**
     * 터치 드래그 시 요소가 스크롤되는 것을 방지하는 헬퍼 함수
     * @param {Event} event 이벤트 객체
     */
    const preventScrolling = (event) => {
      if (event.cancelable) event.preventDefault();
    };

    // 길게 누를 때 컨텍스트 메뉴 표시 방지
    const preventContextMenu = (event) => event.preventDefault();
    DOMHelpers.on(todoItem, 'contextmenu', preventContextMenu);    
    // 길게 누르면 이동 활성화
    const activateDrag = (event = e) => {
      if (!todoItem.classList.contains('dragged')) {
        container.append(fixHeight);
        // 모바일에서 항목을 드래그하는 동안 기본 페이지 스크롤을 방지합니다.
        container.addEventListener('touchmove', preventScrolling, false);
      }

      const translateY = initialItemTranslateY - initialPageY + event.touches[0].pageY;
      moveAt(translateY);

      if (!todoItem.classList.contains('dragged')) {
        setDraggableStyles();
        DOMHelpers.addClass(todoItem, 'dragged');
      }

      // 드래그한 항목이 하단/상단 가장자리에 있으면 목록 스크롤
      if (
        event.touches[0].pageY > containerBottom - 40 &&
        (currentPageY === null || currentPageY <= containerBottom - 40)
      ) {
        // 스크롤 이동
        timerIDs.push(...scrollListDown(container));

        currentPageY = event.touches[0].pageY;
      } else if (
        event.touches[0].pageY <= containerBottom - 40 &&
        currentPageY > containerBottom - 40
      ) {
        currentPageY = event.touches[0].pageY;

        timerIDs.forEach((timerID) => clearTimeout(timerID));
        timerIDs.length = 0;
      }

      if (
        event.touches[0].pageY < containerTop + 40 &&
        (currentPageY === null || currentPageY >= containerTop + 40)
      ) {
        // 스크롤 이동
        timerIDs.push(...scrollListTop(container, e));

        currentPageY = event.touches[0].pageY;
      } else if (event.touches[0].pageY >= containerTop + 40 && currentPageY < containerTop + 40) {
        currentPageY = event.touches[0].pageY;

        timerIDs.forEach((timerID) => clearTimeout(timerID));
        timerIDs.length = 0;
      }
    };    
    const longPressID = setTimeout(activateDrag, 500);

    /**
     * 문서에서 커서의 좌표를 가져오고 그 아래에 있는 요소를 가져옵니다
     * @param {Event} event 'touchmove' 이벤트의 매개변수
     */
    const handleTouchMove = (event) => {
      if (!todoItem.classList.contains('dragged')) {
        clearTimeout(longPressID);
        container.removeEventListener('touchmove', preventScrolling, false);

        return;
      }

      activateDrag(event);

      if (!overlay.style.left) {
        overlay.style.left = `${event.touches[0].pageX - shiftX}px`;
        overlay.style.width = `${todoItem.offsetWidth}px`;
        overlay.style.height = `${todoItem.offsetHeight}px`;
      }

      overlay.style.top = `${event.touches[0].pageY - shiftY}px`;

      // 드래그 중인 요소 숨기기
      DOMHelpers.addClass(todoItem, 'hide');
      DOMHelpers.addClass(overlay, 'hide');
      // elemBelow는 할 일 항목 아래의 요소로, 드롭 가능할 수 있음
      const elemBelow = document.elementFromPoint(
        event.touches[0].clientX,
        event.touches[0].clientY,
      );
      DOMHelpers.removeClass(todoItem, 'hide');
      DOMHelpers.removeClass(overlay, 'hide');

      if (!elemBelow) return;

      // 다른 할 일 항목들은 "todo-item" 클래스가 지정되어 있음 (다른 로직일 수도 있음)
      const todoItemBelow = elemBelow.closest('.todo-item');

      if (currentTodoItemBelow !== todoItemBelow) {
        // 드래그 중 항목이 들어오거나 나가는 경우...
        // 참고: 두 값 모두 null일 수 있음
        // currentDroppable=null은 이전 이벤트에서 드롭 가능 영역 위에 있지 않았음을 의미
        // (예: 빈 공간 위에 있는 경우)
        // droppableBelow=null은 현재 이벤트 중 드롭 가능 영역 위에 있지 않음을 의미

        currentTodoItemBelow = todoItemBelow;

        if (currentTodoItemBelow) {
          // 드롭 가능 영역에 들어왔을 때 처리 로직
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
          enterDroppable(items, itemsToTranslate, todoItem, currentTodoItemBelow);
          getUpdatedList(items, todoItem, currentTodoItemBelow);
        }
      }
    };

    const handleTouchEnd = () => {
      clearTimeout(longPressID);
      DOMHelpers.off(todoItem, 'contextmenu', preventContextMenu);

      overlay.remove();

      // 항목을 새 위치에 배치
      const initialTranslateY = todoItem.style.transform
        ? DOMHelpers.getNumberFromString(todoItem.style.transform)
        : 0;

      resetDraggableStyles();
      const containerIsScrolled = initialScrollTop !== container.scrollTop;
      timerIDs.forEach((timerID) => clearTimeout(timerID));

      // 터치 드래그 중 스크롤 허용
      container.removeEventListener('touchmove', preventScrolling);

      if (initialTranslateY !== updatedTranslateY) {
        todoItem.style.transform = `translateY(${updatedTranslateY}px)`;

        // 테두리 색상 전환 비활성화
        todoItem.style.transition = 'box-shadow .25s ease-out, transform 0.15s ease';

        const handleTransition = () => {
          DOMHelpers.removeClass(todoItem, 'dragged');
          // 할 일 항목 전환 초기화
          todoItem.style.transition = '';
          DOMHelpers.off(todoItem, 'transitionend', handleTransition);

          // 할 일 목록 재정렬
          const items = todoApp.getSelectedProject().getItems();
          reOrderDOMList(container, items);
        };

        if (containerIsScrolled) {
          handleTransition();
        } else {
          DOMHelpers.on(todoItem, 'transitionend', handleTransition);
        }
      } else {
        DOMHelpers.removeClass(todoItem, 'dragged');

        if (initialItemTranslateY !== updatedTranslateY) {
          // 할 일 목록 재정렬
          const items = todoApp.getSelectedProject().getItems();
          reOrderDOMList(container, items);
        }
      }

      DOMHelpers.off(document, 'touchmove', handleTouchMove);
      DOMHelpers.off(document, 'touchend', handleTouchEnd);
      todoItem.onclick = null;

      // 로컬 스토리지 업데이트
      todoLocalStorage.populateStorage(todoApp);
    };

    DOMHelpers.on(document, 'touchmove', handleTouchMove);
    DOMHelpers.on(document, 'touchend', handleTouchEnd);

    todoItem.ondragstart = () => false;
  };

  return handleTouchStart;
};

export default touch;
