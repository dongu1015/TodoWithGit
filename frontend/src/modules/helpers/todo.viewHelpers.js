/**
 * 할 일 애플리케이션의 뷰 헬퍼 모듈
 * 사용자 인터페이스 요소의 조작과 시각적 효과를 위한 다양한 헬퍼 함수 제공
 */
import assets from '../init/assets';
import DOMHelpers from './DOMHelpers';

const viewHelpers = (elements) => {
  // DOM 조작 헬퍼 함수들 가져오기
  const {
    createElement,
    on,
    off,
    empty,
    getElement,
    unselect,
    addClass,
    removeClass,
    hideElement,
    showElement,
    getNumberFromString,
    enableTransition,
  } = DOMHelpers();

  // 에셋(아이콘, 이미지 등) 가져오기
  const {
    chevronSVG,
    emptyStateSVG,
    emptyStateAllTasksSVG,
    emptyStateMyDaySVG,
    emptyStateBookmarkSVG,
    emptyStatePlannedSVG,
  } = assets();

  // 할 일 항목 위치 새로고침 함수
  const { refreshTodoItemsPositions } = elements;

  /**
   * 모달 창 표시 함수
   * 모달 창을 화면에 나타냄
   */
  const showModal = () => {
    removeClass(elements.modal, 'close');
    addClass(elements.modalBackdrop, 'fade-in');
  };

  /**
   * 모달 창 숨김 함수
   * 모달 창을 화면에서 숨김
   */
  const hideModal = () => {
    addClass(elements.modal, 'close');
    removeClass(elements.modalBackdrop, 'fade-in');
  };

  /**
   * 모달 창 토글 함수
   * 모달 창의 표시 상태를 전환
   */
  const toggleModal = () => {
    if (elements.modal.classList.contains('close')) showModal();
    else hideModal();
  };

  /**
   * "내 하루" 할 일 개수 초기화 함수
   * 새로운 날이 되면 "내 하루" 프로젝트의 할 일 개수를 0으로 리셋
   */
  const resetMyDayCount = () => {
    const myDayCount = getElement('.list[data-index="2"] .todo-count');
    myDayCount.textContent = 0;
    hideElement(myDayCount);
  };

  /**
   * 할 일 개수 업데이트 함수
   * 프로젝트의 할 일 개수를 증가 또는 감소시킴
   * @param {HTMLElement} element 할 일 개수를 표시하는 요소
   * @param {boolean} isIncreased 증가(true) 또는 감소(false)
   */
  const updateTodoCount = (element, isIncreased) => {
    if (isIncreased) {
      element.textContent = Number(element.textContent) + 1;
      showElement(element);
      return;
    }

    element.textContent = Number(element.textContent) - 1;

    if (element.textContent === '0') hideElement(element);
  };

  /**
   * 인디케이터 추가 함수
   * 할 일 항목에 특정 인디케이터(날짜, 중요 표시 등)를 추가
   * @param {HTMLElement} indicator 추가할 인디케이터 요소
   * @param {HTMLElement} todo 대상 할 일 항목 요소
   */
  const appendIndicator = (indicator, todo) => {
    let indicators = null;

    // 인디케이터를 추가할 컨테이너 찾기
    if (todo) indicators = todo.querySelector('.indicators');
    else indicators = getElement('.todo-item.selected .indicators');

    // 인디케이터 클래스 목록
    const classes = [
      'project-name-indicator',
      'my-day-indicator',
      'subtask-indicator',
      'date-indicator',
      'note-indicator',
      'important-indicator',
    ];
    // 현재 존재하는 인디케이터 요소들
    const listName = indicators.querySelector(`.${classes[0]}`);
    const day = indicators.querySelector(`.${classes[1]}`);
    const note = indicators.querySelector(`.${classes[4]}`);
    const bookmark = indicators.querySelector(`.${classes[5]}`);

    // 추가할 인디케이터 유형에 따라 위치 결정
    switch (indicator.className) {
      case classes[0]: // 프로젝트 이름 인디케이터
        indicators.prepend(indicator);
        break;

      case classes[1]: // 내 하루 인디케이터
        listName ? listName.after(indicator) : indicators.prepend(indicator);
        break;

      case classes[2]: // 하위 작업 인디케이터
        if (day) day.after(indicator);
        else if (listName) listName.after(indicator);
        else indicators.prepend(indicator);
        break;

      case classes[3]: // 날짜 인디케이터
        if (note) note.before(indicator);
        else if (bookmark) bookmark.before(indicator);
        else indicators.append(indicator);
        break;

      case classes[4]: // 노트 인디케이터
        bookmark ? bookmark.before(indicator) : indicators.append(indicator);
        break;

      case classes[5]: // 중요 인디케이터
        indicators.append(indicator);
        break;

      default:
        break;
    }
  };

  /**
   * 상세 정보 초기화 함수
   * 할 일 항목의 상세 정보 패널을 초기화
   */
  const resetDetails = () => {
    const selectedProject = getElement('.list.selected');
    empty(elements.detailsView);

    // 'Planned' 프로젝트에서 선택된 할 일 항목 초기화
    if (selectedProject && selectedProject.dataset.index === '4') {
      const lists = elements.todoList.querySelectorAll('ul.todo-list-time');
      Array.from(lists).forEach((list) => {
        if (list.children) unselect(list);
      });
    } else {
      // 다른 프로젝트에서 선택된 할 일 항목 초기화
      unselect(elements.todoList);
    }
  };

  /**
   * 현재 날짜를 "YYYY-MM-DD" 형식으로 변환
   * @param {number} timestamp 변환할 타임스탬프 (기본값: 현재 시간)
   * @returns {string} "YYYY-MM-DD" 형식의 날짜 문자열
   */
  const getConvertedCurrentDate = (timestamp = Date.now()) => {
    const date = new Date(timestamp);
    // 월과 일이 한 자리인 경우 앞에 0 추가
    const month =
      `${date.getMonth() + 1}`.length === 1 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
    const day = `${date.getDate()}`.length === 1 ? `0${date.getDate()}` : `${date.getDate()}`;

    return `${date.getFullYear()}-${month}-${day}`;
  };

  /**
   * 사용자 친화적인 날짜 문자열로 변환
   * @param {string} stringDate "YYYY-MM-DD" 형식의 날짜 문자열
   * @param {HTMLElement} dateLabel 날짜 레이블 요소
   * @returns {string} 사용자 친화적인 날짜 문자열 (예: "오늘", "내일")
   */
  const getFriendlyDate = (stringDate, dateLabel) => {
    const currentDate = new Date();
    const dateObj = new Date(stringDate);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const day = days[dateObj.getDay()];
    const month = months[dateObj.getMonth()];
    const dayNumber = dateObj.getDate();
    const year = dateObj.getFullYear();

    // 오늘, 내일 표시를 위한 날짜 계산
    let initialMonth = currentDate.getMonth() + 1;
    let initialDay = currentDate.getDate();
    initialMonth = `${initialMonth}`.length > 1 ? initialMonth : `0${initialMonth}`;
    initialDay = `${initialDay}`.length > 1 ? initialDay : `0${initialDay}`;
    const initialDate = new Date(`${currentDate.getFullYear()}-${initialMonth}-${initialDay}`);
    const coefficientMSDay = 1000 * 60 * 60 * 24; // 하루를 밀리초로 변환
    const numberOfDays = (dateObj - initialDate) / coefficientMSDay;
    let timeMSG = 'Due'; // 기한 메시지
    removeClass(dateLabel, 'overdue');
    removeClass(dateLabel, 'today');

    // 기한이 지난 경우 처리
    if (numberOfDays < 0) {
      timeMSG = 'Overdue,';
      addClass(dateLabel, 'overdue');
    } else if (numberOfDays === 0) addClass(dateLabel, 'today');

    // 날짜에 따른 다양한 표시 형식 반환
    switch (numberOfDays) {
      case 0:
        return 'Due Today'; // 오늘 마감
      case 1:
        return 'Due Tomorrow'; // 내일 마감
      case -1:
        return 'Overdue Yesterday'; // 어제 지남
      default:
        if (year !== currentDate.getFullYear()) {
          return `${timeMSG} ${day}, ${month} ${dayNumber}, ${year}`; // 년도 포함 표시
        }

        return `${timeMSG} ${day}, ${month} ${dayNumber}`; // 년도 제외 표시
    }
  };

  /**
   * 사용자 친화적인 생성 날짜 문자열로 변환
   * @param {string} stringDate "YYYY-MM-DD" 형식의 날짜 문자열
   * @returns {string} 사용자 친화적인 생성 날짜 문자열
   */
  const getFriendlyCreationDate = (stringDate) => {
    const currentDate = new Date(getConvertedCurrentDate());
    const dateObj = new Date(stringDate);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const day = days[dateObj.getDay()];
    const month = months[dateObj.getMonth()];
    const dayNumber = dateObj.getDate();
    const year = dateObj.getFullYear();

    // 오늘, 어제 표시를 위한 날짜 계산
    const coefficientMSDay = 1000 * 60 * 60 * 24; // 하루를 밀리초로 변환
    const numberOfDays = (currentDate - dateObj) / coefficientMSDay;
    const timeMSG = 'Created';

    // 날짜에 따른 다양한 표시 형식 반환
    switch (numberOfDays) {
      case 0:
        return 'Created Today'; // 오늘 생성됨
      case 1:
        return 'Created Yesterday'; // 어제 생성됨
      default:
        if (year !== currentDate.getFullYear()) {
          return `${timeMSG} ${day}, ${month} ${dayNumber}, ${year}`; // 년도 포함 표시
        }

        return `${timeMSG} ${day}, ${month} ${dayNumber}`; // 년도 제외 표시
    }
  };

  /**
   * 입력 필드 읽기 전용 상태 전환
   * @param {HTMLInputElement} input 대상 입력 필드
   */
  const toggleReadOnly = (input) => {
    input.readOnly = !input.readOnly;
  };

  /**
   * 할 일 추가 시 애니메이션 적용 함수
   * 새로운 할 일 항목 추가 시 시각적 효과 제공
   * @param {HTMLElement} addedTodo 추가된 할 일 항목 요소
   * @param {Object} sort 정렬 관련 객체 (선택 사항)
   */
  const animateAddTodoList = (addedTodo, sort = null) => {
    const selectedProject = getElement('.list.selected');
    let todoList = null;

    // 'Planned' 프로젝트인 경우 시간대별 목록 사용
    if (selectedProject.dataset.index === '4') {
      todoList = addedTodo.closest('.todo-list-time');
      elements.todoList.style.height = '';
    } else todoList = elements.todoList;

    const { children } = todoList;
    let fullHeight = 0;
    let lastChildFullHeight = 0;

    // 모든 트랜지션 활성화
    enableTransition(todoList);

    // 각 자식 요소의 높이 계산 및 위치 설정
    Array.from(children).forEach((child, index) => {
      const height = child.offsetHeight;
      const { marginBottom } = getComputedStyle(child);
      fullHeight += height + parseInt(marginBottom, 10);

      if (index === 0) {
        lastChildFullHeight = fullHeight;
        // 추가된 항목에 시각적 효과 적용
        addClass(child, 'selected');

        return;
      }

      // 기존 항목들 아래로 이동
      const oldTranslateY =
        child.style.transform === '' ? 0 : getNumberFromString(child.style.transform);
      child.style.transform = `translateY(${lastChildFullHeight + oldTranslateY}px)`;
    });

    /**
     * 트랜지션 중 스크롤바 표시 문제 해결
     * 트랜지션 중에는 오버플로우를 숨기고 완료 후 복원
     */
    if (todoList.scrollHeight === todoList.offsetHeight) {
      todoList.style.overflow = 'hidden';
      const handleTransition = () => {
        todoList.style.overflow = '';
        off(todoList, 'transitionend', handleTransition);
      };
      on(todoList, 'transitionend', handleTransition);
    }

    // 항목이 하나뿐인 경우 애니메이션 비활성화
    if (children.length === 1) {
      todoList.style.transition = 'none';
      const todoItem = children[0];
      const handleTransition = () => {
        todoList.style.transition = '';
        off(todoItem, 'transitionend', handleTransition);
      };
      on(todoItem, 'transitionend', handleTransition);
    }

    // 애니메이션 중 입력 필드 비활성화
    toggleReadOnly(elements.newTodoInput);
    // 마지막 항목 추가 효과 적용
    const lastItem = children[children.length - 1];

    // 트랜지션 완료 후 처리
    const handleItemTransition = () => {
      removeClass(children[0], 'selected');
      off(lastItem, 'transitionend', handleItemTransition);

      // 애니메이션 종료 후 입력 필드 활성화
      toggleReadOnly(elements.newTodoInput);

      // 정렬이 필요한 경우 항목 정렬
      if (sort && sort.type !== 'none') sort.refreshSort(sort.currentProject);
    };
    on(lastItem, 'transitionend', handleItemTransition);

    // 항목 목록 높이 업데이트 (8픽셀 추가는 항목 크기 변화에 대비)
    todoList.style.height = `${fullHeight + 8}px`;
  };

  /**
   * 하위 작업 추가 시 애니메이션 적용 함수
   * 새로운 하위 작업 항목 추가 시 시각적 효과 제공
   */
  const animateAddSubTaskList = () => {
    const subTaskList = getElement('.subtasks-list');
    const newSubTask = getElement('#newSubTask');

    // 트랜지션 활성화
    subTaskList.style.transition = '';

    const { children } = subTaskList;
    let fullHeight = 0;
    let lastChildFullHeight = 0;

    // 각 하위 작업 항목의 높이 계산 및 위치 설정
    Array.from(children).forEach((child, index) => {
      const height = child.offsetHeight;
      const { marginBottom } = getComputedStyle(child);
      fullHeight += height + parseInt(marginBottom, 10);

      // 트랜지션 활성화
      child.style.transition = '';

      if (index === 0) {
        lastChildFullHeight = fullHeight;
        // 추가된 항목에 시각적 효과 적용
        addClass(child, 'selected');

        return;
      }

      // 기존 항목들 아래로 이동
      const oldTranslateY =
        child.style.transform === '' ? 0 : getNumberFromString(child.style.transform);
      child.style.transform = `translateY(${lastChildFullHeight + oldTranslateY}px)`;
    });

    // 항목이 하나뿐인 경우 애니메이션 비활성화
    if (children.length === 1) {
      subTaskList.style.transition = 'none';
      const todoItem = children[0];
      const handleTransition = () => {
        subTaskList.style.transition = '';
        off(todoItem, 'transitionend', handleTransition);
      };
      on(todoItem, 'transitionend', handleTransition);
    }

    // 애니메이션 중 입력 필드 비활성화
    toggleReadOnly(newSubTask);
    // 마지막 항목의 트랜지션 완료 후 처리
    const lastItem = children[children.length - 1];

    const handleItemTransition = () => {
      removeClass(children[0], 'selected');
      off(lastItem, 'transitionend', handleItemTransition);

      // 애니메이션 종료 후 입력 필드 활성화
      toggleReadOnly(newSubTask);
    };
    on(lastItem, 'transitionend', handleItemTransition);

    // 하위 작업 목록 높이 업데이트 (8픽셀 추가는 항목 크기 변화에 대비)
    subTaskList.style.height = `${fullHeight + 8}px`;
  };

  /**
   * 하위 작업 목록 재배치 함수
   * 하위 작업 항목들의 위치를 새로 계산하여 배치
   */
  const repositionSubTaskList = () => {
    const subTaskList = getElement('.subtasks-list');

    // 트랜지션 비활성화
    subTaskList.style.transition = 'none';

    const { children } = subTaskList;
    let fullHeight = 0;
    let lastChildFullHeight = 0;

    // 각 하위 작업 항목의 높이 계산 및 위치 설정
    Array.from(children).forEach((child, index) => {
      const height = child.offsetHeight;
      const { marginBottom } = getComputedStyle(child);
      fullHeight += height + parseInt(marginBottom, 10);

      // 트랜지션 비활성화
      child.style.transition = 'none';

      if (index === 0) {
        lastChildFullHeight = fullHeight;
        return;
      }

      // 항목 위치 설정
      const oldTranslateY =
        child.style.transform === '' ? 0 : getNumberFromString(child.style.transform);
      child.style.transform = `translateY(${lastChildFullHeight + oldTranslateY}px)`;
    });

    // 하위 작업 목록 높이 업데이트
    subTaskList.style.height = `${fullHeight + 8}px`;
  };

  /**
   * MutationObserver 콜백 헬퍼 함수
   * DOM 변경 감지 시 적절한 처리를 수행
   * @param {HTMLElement} todoList 할 일 목록 요소
   * @param {MutationRecord} mutation 변경 사항 정보
   */
  const observerCallbackHelper = (todoList, mutation) => {
    const { target, addedNodes, removedNodes } = mutation;
    const selectedProject = getElement('.list.selected');
    const indicators = target.closest('.indicators');
    const isDateIndicator = target.classList.contains('date-indicator-label');
    let isPlannedProject = false;

    if (selectedProject) isPlannedProject = selectedProject.dataset.index === '4';

    const isTransitionDisabled = todoList.style.transitionProperty === 'none';
    let skip = false;

    /**
     * 'Planned' 프로젝트에서 날짜 추가/제거 시 특별 처리
     * 애니메이션 없이 항목을 다른 시간대로 이동시켜야 하는 경우
     */
    if (
      isPlannedProject &&
      indicators &&
      ((addedNodes[0] &&
        addedNodes[0].nodeType === 1 &&
        addedNodes[0].classList.contains('date-indicator')) ||
        (removedNodes[0] &&
          removedNodes[0].nodeType === 1 &&
          removedNodes[0].classList.contains('date-indicator')) ||
        (isDateIndicator && (!addedNodes[0] || !removedNodes[0])))
    ) {
      skip = true;
    }

    // 'Planned' 프로젝트의 인디케이터 변경 처리
    if (indicators && !skip && isPlannedProject) {
      refreshTodoItemsPositions();
    } 
    // 할 일 항목 추가 시 처리
    else if (
      !isTransitionDisabled &&
      addedNodes[0] &&
      addedNodes[0].nodeType === 1 &&
      addedNodes[0].classList.contains('todo-item')
    ) {
      // 스크롤바가 있는 경우 항목 크기 유지
      const { tasksView, newTodo, tasksHeader } = elements;
      const maxTodoListHeight =
        tasksView.offsetHeight - (newTodo.offsetHeight + tasksHeader.offsetHeight);
      let fullHeight = null;

      if (isPlannedProject) {
        const fullHeightAddedNode =
          addedNodes[0].offsetHeight + parseInt(getComputedStyle(addedNodes[0]).marginBottom, 10);
        fullHeight = elements.todoList.scrollHeight + fullHeightAddedNode;
      } else {
        fullHeight = parseInt(todoList.style.height, 10);
      }

      // 너비 고정을 통한 깨짐 방지
      Array.from(todoList.children).forEach((child) => {
        child.style.width = `${child.offsetWidth}px`;
      });

      // 트랜지션 완료 후 처리
      const handleTransition = () => {
        if (maxTodoListHeight < fullHeight) {
          addClass(elements.todoList, 'grow-items');
        }

        // 너비 고정 해제
        Array.from(todoList.children).forEach((child) => {
          child.style.width = '';
        });
        off(todoList, 'transitionend', handleTransition);
      };
      on(todoList, 'transitionend', handleTransition);
    }
    // 할 일 항목 제거 시 처리
    else if (
      !isTransitionDisabled &&
      removedNodes[0] &&
      removedNodes[0].nodeType === 1 &&
      removedNodes[0].classList.contains('todo-item')
    ) {
      // 스크롤바 관련 처리
      const { tasksView, newTodo, tasksHeader } = elements;
      const maxTodoListHeight =
        tasksView.offsetHeight - (newTodo.offsetHeight + tasksHeader.offsetHeight);
      let fullHeight = null;

      if (isPlannedProject) {
        const todoListInitialHeight = todoList.offsetHeight;
        const todoListNewHeight = parseInt(todoList.style.height, 10);
        const fullHeightRemovedNode = todoListInitialHeight - todoListNewHeight;
        fullHeight = elements.todoList.scrollHeight - fullHeightRemovedNode;
      } else {
        fullHeight = parseInt(todoList.style.height, 10);
      }

      // 너비 고정을 통한 깨짐 방지
      Array.from(todoList.children).forEach((child) => {
        child.style.width = `${child.offsetWidth}px`;
      });

      // 트랜지션 완료 후 처리
      const handleTransition = () => {
        if (maxTodoListHeight >= fullHeight) {
          removeClass(elements.todoList, 'grow-items');
        }

        // 너비 고정 해제
        Array.from(todoList.children).forEach((child) => {
          child.style.width = '';
        });
        off(todoList, 'transitionend', handleTransition);
      };
      on(todoList, 'transitionend', handleTransition);
    }
  };

  /**
   * MutationObserver 콜백 함수
   * DOM 변경 감지 시 호출되는 메인 콜백
   * @param {MutationRecord[]} mutations 변경 사항 목록
   */
  const observerCallback = (mutations) => {
    mutations.forEach((mutation) => {
      const { todoList } = elements;
      const isPlannedProject = elements.tasksView.dataset.projectIndex === '4';

      // 'Planned' 프로젝트인 경우 시간대별 목록 처리
      if (isPlannedProject) {
        const listsTime = todoList.querySelectorAll('ul.todo-list-time');
        Array.from(listsTime).forEach((list) => {
          if (list.children.length > 0) {
            observerCallbackHelper(list, mutation);
          }
        });
      } else {
        // 일반 프로젝트 처리
        observerCallbackHelper(todoList, mutation);
      }
    });
  };

  /**
   * 할 일 항목 제거 시 애니메이션 적용 함수
   * @param {HTMLElement} removedChild 제거될 할 일 항목 요소
   */
  const animateRemoveTodoList = (removedChild) => {
    const selectedProject = getElement('.list.selected');
    let todoList = null;

    // 'Planned' 프로젝트인 경우 시간대별 목록 사용
    if (selectedProject && selectedProject.dataset.index === '4') {
      todoList = removedChild.closest('.todo-list-time');
      elements.todoList.style.height = '';
    } else todoList = elements.todoList;

    const { children } = todoList;
    const indexOfRemoved = Array.from(children).indexOf(removedChild);

    const fullHeight =
      todoList.scrollHeight > todoList.offsetHeight ? todoList.scrollHeight : todoList.offsetHeight;

    let removeChildFullHeight = 0;
    // 모든 트랜지션 활성화
    enableTransition(todoList);

    // 제거된 항목 이후의 항목들 위치 조정
    Array.from(children).forEach((child, index) => {
      if (index < indexOfRemoved) return;

      if (index === indexOfRemoved) {
        // 제거될 항목의 높이 계산
        const height = child.offsetHeight;
        const { marginBottom } = getComputedStyle(child);
        removeChildFullHeight = height + parseInt(marginBottom, 10);

        return;
      }

      // 항목들을 위로 이동
      const oldTranslateY =
        child.style.transform === '' ? 0 : getNumberFromString(child.style.transform);
      child.style.transform = `translateY(${oldTranslateY - removeChildFullHeight}px)`;
    });

    // 트랜지션 중 스크롤바 표시 문제 해결
    const nextChild = children[indexOfRemoved + 1];
    if (todoList.scrollHeight === todoList.offsetHeight && nextChild) {
      todoList.style.overflow = 'hidden';
      const handleTransition = () => {
        todoList.style.overflow = '';
        // 목록 높이 업데이트
        todoList.style.height = `${fullHeight - removeChildFullHeight}px`;
        off(nextChild, 'transitionend', handleTransition);
      };
      on(nextChild, 'transitionend', handleTransition);
    } else {
      // 목록 높이 업데이트
      todoList.style.height = `${fullHeight - removeChildFullHeight}px`;
    }
  };

  /**
   * 하위 작업 항목 제거 시 애니메이션 적용 함수
   * @param {HTMLElement} removedChild 제거될 하위 작업 항목 요소
   */
  const animateRemoveSubTask = (removedChild) => {
    const subTaskList = getElement('.subtasks-list');

    const { children } = subTaskList;
    const indexOfRemoved = Array.from(children).indexOf(removedChild);

    const fullHeight = subTaskList.offsetHeight;

    let removeChildFullHeight = 0;
    // 트랜지션 활성화
    subTaskList.style.transition = '';

    // 제거된 항목 이후의 항목들 위치 조정
    Array.from(children).forEach((child, index) => {
      // 트랜지션 활성화
      child.style.transition = '';

      if (index < indexOfRemoved) return;

      if (index === indexOfRemoved) {
        // 제거될 항목의 높이 계산
        const height = child.offsetHeight;
        const { marginBottom } = getComputedStyle(child);
        removeChildFullHeight = height + parseInt(marginBottom, 10);

        return;
      }

      // 항목들을 위로 이동
      const oldTranslateY =
        child.style.transform === '' ? 0 : getNumberFromString(child.style.transform);
      child.style.transform = `translateY(${oldTranslateY - removeChildFullHeight}px)`;
    });

    // 목록 높이 업데이트
    subTaskList.style.height = `${fullHeight - removeChildFullHeight}px`;
  };

  /**
   * 'Planned' 프로젝트의 날짜별 목록 DOM 요소 생성 함수
   * 날짜별로 분류된 목록 헤더와 컨테이너 생성
   */
  const plannedListDOM = () => {
    // 날짜별 목록 헤더와 컨테이너 생성
    const earlierListHeader = createElement('li', '#earlier-list-header');
    const earlierList = createElement('ul', '#earlier-todo-list');
    const todayListHeader = createElement('li', '#today-list-header');
    const todayList = createElement('ul', '#today-todo-list');
    const tomorrowListHeader = createElement('li', '#tomorrow-list-header');
    const tomorrowList = createElement('ul', '#tomorrow-todo-list');
    const laterThisWeekListHeader = createElement('li', '#laterThisWeek-list-header');
    const laterThisWeekList = createElement('ul', '#laterThisWeek-todo-list');
    const nextWeekListHeader = createElement('li', '#nextWeek-list-header');
    const nextWeekList = createElement('ul', '#nextWeek-todo-list');
    const laterListHeader = createElement('li', '#later-list-header');
    const laterList = createElement('ul', '#later-todo-list');

    // 각 헤더에 제목과 접기/펼치기 버튼 추가
    earlierListHeader.insertAdjacentHTML(
      'beforeEnd',
      `<h3>Earlier</h3><button class="open-close">${chevronSVG}</button>`,
    );
    todayListHeader.insertAdjacentHTML(
      'beforeEnd',
      `<h3>Today</h3><button class="open-close">${chevronSVG}</button>`,
    );
    tomorrowListHeader.insertAdjacentHTML(
      'beforeEnd',
      `<h3>Tomorrow</h3><button class="open-close">${chevronSVG}</button>`,
    );
    laterThisWeekListHeader.insertAdjacentHTML(
      'beforeEnd',
      `<h3>Later this week</h3><button class="open-close">${chevronSVG}</button>`,
    );
    nextWeekListHeader.insertAdjacentHTML(
      'beforeEnd',
      `<h3>Next week</h3><button class="open-close">${chevronSVG}</button>`,
    );
    laterListHeader.insertAdjacentHTML(
      'beforeEnd',
      `<h3>Later</h3><button class="open-close">${chevronSVG}</button>`,
    );

    // 헤더에 클래스 추가 및 초기 숨김 처리
    addClass(earlierListHeader, 'list-header', 'hide');
    addClass(todayListHeader, 'list-header', 'hide');
    addClass(tomorrowListHeader, 'list-header', 'hide');
    addClass(laterThisWeekListHeader, 'list-header', 'hide');
    addClass(nextWeekListHeader, 'list-header', 'hide');
    addClass(laterListHeader, 'list-header', 'hide');

    // 목록에 클래스 추가
    addClass(earlierList, 'todo-list-time');
    addClass(todayList, 'todo-list-time');
    addClass(tomorrowList, 'todo-list-time');
    addClass(laterThisWeekList, 'todo-list-time');
    addClass(nextWeekList, 'todo-list-time');
    addClass(laterList, 'todo-list-time');

    // 목록과 헤더 연결
    earlierList.dataset.time = earlierListHeader.id;
    todayList.dataset.time = todayListHeader.id;
    tomorrowList.dataset.time = tomorrowListHeader.id;
    laterThisWeekList.dataset.time = laterThisWeekListHeader.id;
    nextWeekList.dataset.time = nextWeekListHeader.id;
    laterList.dataset.time = laterListHeader.id;

    // 모든 요소를 할 일 목록에 추가
    elements.todoList.append(
      earlierListHeader,
      earlierList,
      todayListHeader,
      todayList,
      tomorrowListHeader,
      tomorrowList,
      laterThisWeekListHeader,
      laterThisWeekList,
      nextWeekListHeader,
      nextWeekList,
      laterListHeader,
      laterList,
    );
  };

  /**
   * 'Planned' 프로젝트에서 날짜에 따른 항목 분류 함수
   * @param {HTMLElement} todoList 할 일 항목 요소
   * @param {string} dateString 날짜 문자열
   */
  const plannedListView = (todoList, dateString) => {
    const date = new Date(dateString);
    const currentDate = new Date(getConvertedCurrentDate());
    const coefficientMSDay = 1000 * 60 * 60 * 24; // 하루를 밀리초로 변환
    const days = (date - currentDate) / coefficientMSDay;
    const currentDay = currentDate.getDay();

    // 날짜에 따라 적절한 섹션에 할 일 항목 배치
    if (days === 0) {
      // 오늘
      const todayList = getElement('#today-todo-list');
      const todayListHeader = getElement('#today-list-header');

      if (!todayList.contains(todoList)) {
        todayList.prepend(todoList);
      }

      showElement(todayListHeader);
    } else if (days === 1) {
      // 내일
      const tomorrowList = getElement('#tomorrow-todo-list');
      const tomorrowListHeader = getElement('#tomorrow-list-header');

      if (!tomorrowList.contains(todoList)) {
        tomorrowList.prepend(todoList);
      }

      showElement(tomorrowListHeader);
    } else if (days < 0) {
      // 지난 날짜
      const earlierList = getElement('#earlier-todo-list');
      const earlierListHeader = getElement('#earlier-list-header');

      if (!earlierList.contains(todoList)) {
        earlierList.prepend(todoList);
      }

      showElement(earlierListHeader);
    } else if (currentDay !== 0 && currentDay !== 6 && days > 1 && days <= 7 - currentDay) {
      // 이번 주 후반
      const laterThisWeekList = getElement('#laterThisWeek-todo-list');
      const laterThisWeekListHeader = getElement('#laterThisWeek-list-header');

      if (!laterThisWeekList.contains(todoList)) {
        laterThisWeekList.prepend(todoList);
      }

      showElement(laterThisWeekListHeader);
    } else if (
      (days > 7 - currentDay && days <= 14 - currentDay) ||
      (currentDay === 0 && days > 1 && days <= 7)
    ) {
      // 다음 주
      const nextWeekList = getElement('#nextWeek-todo-list');
      const nextWeekListHeader = getElement('#nextWeek-list-header');

      if (!nextWeekList.contains(todoList)) {
        nextWeekList.append(todoList);
      }

      showElement(nextWeekListHeader);
    } else {
      // 나중
      const laterList = getElement('#later-todo-list');
      const laterListHeader = getElement('#later-list-header');

      if (!laterList.contains(todoList)) {
        laterList.append(todoList);
      }

      showElement(laterListHeader);
    }
  };

  /**
   * 요소의 표시 모드와 편집 모드 전환 함수
   * @param {HTMLElement} displayElem 표시용 요소
   * @param {HTMLElement} editElem 편집용 입력 요소
   * @param {Function} callback 편집 완료 후 호출될 콜백 함수
   */
  const toggleEditMode = (displayElem, editElem, callback) => {
    // 편집 완료 처리 함수
    const handleEditEvents = (e) => {
      // Enter 키를 눌렀거나 포커스가 이동한 경우에만 처리
      if (e.code !== undefined && e.code !== 'Enter') return;

      // 이벤트 리스너 제거
      off(editElem, 'keydown', handleEditEvents);
      off(editElem, 'blur', handleEditEvents);
      editElem.parentNode.classList.remove('edit-mode');

      // 값이 비어있지 않으면 업데이트
      if (editElem.value) {
        displayElem.textContent = editElem.value;
        callback(displayElem.textContent);
      }

      // 편집 요소를 표시 요소로 교체
      editElem.replaceWith(displayElem);
    };

    // 편집 모드 활성화
    displayElem.parentNode.classList.add('edit-mode');
    editElem.value = displayElem.textContent;
    displayElem.replaceWith(editElem);
    editElem.focus();
    
    // 편집 완료 이벤트 등록
    on(editElem, 'blur', handleEditEvents);
    on(editElem, 'keydown', handleEditEvents);
  };

  /**
   * 항목 제거 확인 모달 표시 함수
   * @param {Function} callback 확인 버튼 클릭 시 실행될 콜백 함수
   * @param {string} msg 표시할 메시지
   */
  const confirmRemoval = (callback, msg) => {
    const { modalOk, modalCancel, modalBackdrop, modalText } = elements;
    modalText.innerHTML = msg;
    toggleModal();
    modalCancel.focus();

    // 모달 버튼 클릭 이벤트 처리
    const handleClick = (e) => {
      const { target } = e;
      toggleModal();
      // 이벤트 리스너 제거
      off(modalOk, 'click', handleClick);
      off(modalCancel, 'click', handleClick);
      off(modalBackdrop, 'click', handleClick);

      // 확인 버튼 클릭 시 콜백 실행
      if (target === modalOk) {
        callback();
      }
    };

    // 이벤트 리스너 등록
    on(modalOk, 'click', handleClick);
    on(modalCancel, 'click', handleClick);
    on(modalBackdrop, 'click', handleClick); // 배경 클릭 시 모달 닫기
  };

  /**
   * 빈 상태 표시 내용 전환 함수
   * 프로젝트 유형에 따라 다른 빈 상태 메시지와 아이콘 표시
   * @param {HTMLElement} selectedProject 선택된 프로젝트 요소
   */
  const switchEmptyState = (selectedProject) => {
    const index = Number(selectedProject.dataset.index);
    const emptyState = document.getElementById('empty-state');
    const emptyStateText = emptyState.querySelector('p');
    const currentSVG = emptyState.querySelector('svg');
    if (currentSVG) currentSVG.remove();

    // 각 프로젝트 유형에 맞는 빈 상태 콘텐츠 설정
    switch (index) {
      case 1: // 모든 작업
        emptyState.insertAdjacentHTML('afterBegin', emptyStateAllTasksSVG);
        emptyStateText.textContent = 'You have no tasks!';
        break;

      case 2: // 내 하루
        emptyState.insertAdjacentHTML('afterBegin', emptyStateMyDaySVG);
        emptyStateText.textContent = 'This is where you can add your daily tasks.';
        break;

      case 3: // 북마크(중요)
        emptyState.insertAdjacentHTML('afterBegin', emptyStateBookmarkSVG);
        emptyStateText.textContent = 'You have no bookmarked tasks.';
        break;

      case 4: // 계획됨
        emptyState.insertAdjacentHTML('afterBegin', emptyStatePlannedSVG);
        emptyStateText.textContent = 'You have no planned tasks.';
        break;

      default: // 사용자 정의 프로젝트
        emptyState.insertAdjacentHTML('afterBegin', emptyStateSVG);
        emptyStateText.textContent = 'What tasks are on your mind?';
        break;
    }
  };

  /**
   * 할 일 완료 효과음 재생 함수
   * 할 일이나 하위 작업을 완료했을 때 효과음 재생
   */
  const playCompleteSound = () => {
    const completeSound = document.getElementById('completeSound');
    completeSound.pause();
    completeSound.currentTime = 0;
    completeSound.play();
  };

  /**
   * 'Planned' 프로젝트의 날짜 탭 초기화 함수
   * 프로젝트 전환이나 앱 초기화 시 탭 상태(열림/닫힘) 설정
   * @param {Object} plannedProject 'Planned' 프로젝트 객체
   */
  const initPlannedDateTabs = (plannedProject) => {
    const { todoList } = elements;
    const todoListTimes = elements.todoList.querySelectorAll('.todo-list-time');
    const toggleButtons = elements.todoList.querySelectorAll('.list-header button');
    const { tabStates } = plannedProject;

    // 각 날짜 탭의 상태 설정
    todoListTimes.forEach((list, i) => {
      if (tabStates[i] === 'open') {
        removeClass(toggleButtons[i], 'close');
        list.style.height = list.scrollHeight ? `${list.scrollHeight + 2}px` : '';
      } else {
        addClass(toggleButtons[i], 'close');
        list.style.height = 0;
      }
    });

    // 스크롤바 표시 관련 처리
    if (todoList.scrollHeight > todoList.offsetHeight) {
      addClass(todoList, 'grow-items');
    } else if (todoList.scrollHeight === todoList.offsetHeight) {
      removeClass(todoList, 'grow-items');
    }
  };

  // 모듈의 공개 API 반환
  return {
    toggleModal,
    resetMyDayCount,
    updateTodoCount,
    appendIndicator,
    resetDetails,
    getConvertedCurrentDate,
    getFriendlyDate,
    getFriendlyCreationDate,
    animateAddTodoList,
    observerCallback,
    animateRemoveTodoList,
    plannedListDOM,
    plannedListView,
    toggleEditMode,
    confirmRemoval,
    switchEmptyState,
    playCompleteSound,
    initPlannedDateTabs,
    animateAddSubTaskList,
    repositionSubTaskList,
    animateRemoveSubTask,
  };
};

export default viewHelpers;
