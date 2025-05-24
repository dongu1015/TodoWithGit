/**
 * 할 일 애플리케이션의 뷰 모듈
 * UI 요소 생성 및 조작, 사용자 이벤트 처리를 담당
 */
import flatpickr from 'flatpickr'; // 날짜 선택기 라이브러리 임포트
import assets from './init/assets'; // SVG 아이콘 및 이미지 자산 임포트
import DOMHelpers from './helpers/DOMHelpers'; // DOM 조작 헬퍼 함수 모음 임포트
import initializeDOMElements from './init/initDOM'; // DOM 요소 초기화 임포트
import viewHelpers from './helpers/todo.viewHelpers'; // 뷰 관련 헬퍼 함수 임포트
import 'flatpickr/dist/themes/light.css'; // 날짜 선택기 스타일시트 임포트

/**
 * 할 일 뷰를 생성하고 관리하는 팩토리 함수
 * @returns {Object} 뷰 관련 메서드와 속성을 포함하는 객체
 */
const todoView = () => {
  // DOM 조작 헬퍼 함수들 가져오기
  const {
    createElement, // 새 DOM 요소 생성
    on, // 이벤트 리스너 추가
    off, // 이벤트 리스너 제거
    empty, // 요소 내용 비우기
    getElement, // 단일 DOM 요소 선택
    getElements, // 여러 DOM 요소 선택
    wrap, // 요소를 다른 요소로 감싸기
    unselect, // 선택 상태 제거
    addClass, // 클래스 추가
    removeClass, // 클래스 제거
    hideElement, // 요소 숨기기
    showElement, // 요소 표시
    resetClassList, // 클래스 목록 초기화
    getNumberFromString, // 문자열에서 숫자 추출
    enableTransition, // 트랜지션 활성화
    disableTransition, // 트랜지션 비활성화
    swapElements, // 두 요소 위치 교환
  } = DOMHelpers();

  // SVG 아이콘 자산 가져오기
  const {
    deleteSVG, // 삭제 아이콘
    listSVG, // 목록 아이콘
    checkSVG, // 체크 아이콘
    removeSVG, // 제거 아이콘
    prioritySVG, // 우선순위 아이콘
    calendarSVG, // 캘린더 아이콘
    homeSVG, // 홈 아이콘
    tasksSVG, // 작업 아이콘
    importantSVG, // 중요 표시 아이콘
    daySVG, // 내 하루 아이콘
    notFoundSVG, // 검색 결과 없음 아이콘
  } = assets();

  // DOM 요소 초기화 및 참조 가져오기
  const elements = initializeDOMElements();
  const { refreshTodoItemsPositions } = elements;

  // 뷰 헬퍼 함수 가져오기
  const {
    resetMyDayCount, // 내 하루 할 일 개수 초기화
    updateTodoCount, // 할 일 개수 업데이트
    appendIndicator, // 인디케이터 추가
    resetDetails, // 세부 정보 초기화
    getConvertedCurrentDate, // 현재 날짜를 표준 형식으로 변환
    getFriendlyDate, // 사용자 친화적인 날짜 표시
    getFriendlyCreationDate, // 사용자 친화적인 생성 날짜 표시
    animateAddTodoList, // 할 일 추가 애니메이션
    observerCallback, // DOM 변경 감지 콜백
    animateRemoveTodoList, // 할 일 제거 애니메이션
    plannedListDOM, // 계획된 할 일 목록 DOM 생성
    plannedListView, // 계획된 할 일 목록 뷰 생성
    toggleEditMode, // 편집 모드 전환
    confirmRemoval, // 삭제 확인
    switchEmptyState, // 빈 상태 표시 전환
    playCompleteSound, // 완료 효과음 재생
    initPlannedDateTabs, // 계획된 날짜 탭 초기화
    animateAddSubTaskList, // 하위 작업 추가 애니메이션
    repositionSubTaskList, // 하위 작업 목록 재배치
    animateRemoveSubTask, // 하위 작업 제거 애니메이션
  } = viewHelpers(elements);

  /**
   * 프로젝트 목록을 HTML 리스트로 표시하는 함수
   * @param {number} id 프로젝트 ID
   * @param {string} name 프로젝트 이름
   * @param {Object[]} items 프로젝트의 할 일 항목 목록
   * @param {boolean} isSelected 프로젝트가 선택된 상태인지 여부
   */
  const displayList = (id, name, items, isSelected) => {
    // 프로젝트를 위한 li 요소 생성
    const li = createElement('li', '.list');
    li.dataset.index = id;
    
    // 프로젝트 이름 표시를 위한 span 요소 생성
    const projectName = createElement('span', '.project-name');
    projectName.textContent = name;
    
    // 할 일 개수 표시를 위한 span 요소 생성
    const todoCount = createElement('span', '.todo-count');
    let count = 0;

    // 기본 프로젝트의 init() 시 할 일 개수 요소 가져오기
    let myDayCount = null;
    let ImportantCount = null;
    let PlannedCount = null;

    if (id > 4) { // 사용자 정의 프로젝트인 경우에만
      myDayCount = getElement('.list[data-index="2"] .todo-count');
      ImportantCount = getElement('.list[data-index="3"] .todo-count');
      PlannedCount = getElement('.list[data-index="4"] .todo-count');
    }

    // 항목 순회하며 완료되지 않은 항목 개수 계산
    items.forEach((todo) => {
      if (todo.isComplete) return; // 완료된 항목은 카운트하지 않음

      count += 1;

      // 특별 속성에 따라 해당 프로젝트의 할 일 개수 증가
      if (todo.isMyDay) myDayCount.textContent = Number(myDayCount.textContent) + 1;
      if (todo.isImportant) ImportantCount.textContent = Number(ImportantCount.textContent) + 1;
      if (todo.date) PlannedCount.textContent = Number(PlannedCount.textContent) + 1;
    });

    // 사용자 정의 프로젝트인 경우 기본 프로젝트의 할 일 개수 표시 업데이트
    if (id > 4) {
      if (myDayCount.classList.contains('hide') && Number(myDayCount.textContent) > 0) {
        showElement(myDayCount);
      }

      if (ImportantCount.classList.contains('hide') && Number(ImportantCount.textContent) > 0) {
        showElement(ImportantCount);
      }

      if (PlannedCount.classList.contains('hide') && Number(PlannedCount.textContent) > 0) {
        showElement(PlannedCount);
      }
    }

    todoCount.textContent = count;

    // 할 일이 없으면 카운트 숨김
    if (count === 0) hideElement(todoCount);

    // 목록 아이콘 생성
    const listIcon = createElement('span', '.list-icon');
    // 요소들 조합
    li.append(listIcon, projectName, todoCount);

    // 프로젝트 유형에 따른 아이콘 및 클래스 설정
    switch (id) {
      case 1: // 모든 작업
        listIcon.insertAdjacentHTML('beforeEnd', tasksSVG);
        addClass(li, 'all-tasks-list');
        addClass(li, 'pinned');
        break;
      case 2: // 내 하루
        listIcon.insertAdjacentHTML('beforeEnd', daySVG);
        addClass(li, 'my-day-list');
        addClass(li, 'pinned');
        break;
      case 3: // 중요
        listIcon.insertAdjacentHTML('beforeEnd', importantSVG);
        addClass(li, 'important-list');
        addClass(li, 'pinned');
        break;
      case 4: // 계획됨
        listIcon.insertAdjacentHTML('beforeEnd', calendarSVG);
        addClass(li, 'planned-list');
        addClass(li, 'pinned');
        break;
      case 5: // 작업 (기본 프로젝트)
        listIcon.insertAdjacentHTML('beforeEnd', homeSVG);
        addClass(li, 'home-list');
        addClass(li, 'pinned');
        break;
      default: { // 사용자 정의 프로젝트
        listIcon.insertAdjacentHTML('beforeEnd', listSVG);
        // 사용자 정의 프로젝트에는 삭제 버튼 추가
        const deleteBtn = createElement('button', '.delete-btn');
        deleteBtn.insertAdjacentHTML('beforeEnd', deleteSVG);
        li.append(deleteBtn);
        break;
      }
    }

    // 생성한 프로젝트 항목을 목록에 추가
    elements.lists.append(li);

    // 선택된 프로젝트인 경우 처리
    if (isSelected) {
      // 기존 선택 항목 초기화
      const { lists } = elements;
      unselect(lists);
      li.classList.add('selected');
    }
  };

  // DOM 변경을 감시하기 위한 MutationObserver 설정
  const observer = new MutationObserver(observerCallback);
  observer.observe(elements.todoList, {
    childList: true, // 자식 요소 변경 감시
    subtree: true,   // 하위 트리 전체 감시
  });

  /**
   * 할 일 항목을 목록에 추가하는 함수
   * @param {Object} todo 할 일 객체
   * @param {boolean} isNew 새로 추가되는 항목인지 여부
   * @param {Object} sort 정렬 관련 설정
   */
  const addTodo = (todo, isNew = false, sort) => {
    // 할 일 항목을 위한 li 요소 생성
    const li = createElement('li', '.todo-item');
    li.dataset.index = todo.id;
    li.dataset.projectIndex = todo.projectID;
    todo.isComplete ? addClass(li, 'completed') : removeClass(li, 'completed');
    const priorityClass = `${todo.priority.toLowerCase()}`;
    resetClassList(li, ['low', 'medium', 'high']);
    addClass(li, priorityClass);
    
    // 체크박스 설정
    const checkbox = createElement('input', `#todo-checkbox${todo.id}${todo.projectID}`);
    const label = createElement('label');
    const span = createElement('span');
    span.insertAdjacentHTML('beforeEnd', checkSVG);
    checkbox.type = 'checkbox';
    checkbox.checked = todo.isComplete;
    label.htmlFor = `todo-checkbox${todo.id}${todo.projectID}`;
    label.append(span);

    // 생성 날짜 설정
    if (!todo.creationDate) todo.creationDate = Date.now();

    // 할 일 제목 설정
    const title = createElement('span', '.todo-title');
    title.textContent = todo.title;
    // 삭제 버튼
    const deleteBtn = createElement('button', '.delete-btn');
    deleteBtn.insertAdjacentHTML('beforeEnd', deleteSVG);
    // 제목 블록
    const titleBlock = createElement('span', '.title-block');
    // 인디케이터 블록
    const indicators = createElement('div', '.indicators');

    // 기본 프로젝트에서는 프로젝트 이름 인디케이터 추가
    const selectedProject = getElement('.list.selected');

    if (!selectedProject || ['1', '2', '3', '4'].includes(selectedProject.dataset.index)) {
      const projectName = getElement(`.list[data-index="${todo.projectID}"] .project-name`)
        .textContent;
      const projectNameIndicator = createElement('span', '.project-name-indicator');
      projectNameIndicator.textContent = projectName;
      indicators.append(projectNameIndicator);
    }

    // "내 하루" 표시 인디케이터
    if (todo.isMyDay) indicators.append(elements.myDayIndicatorFn());

    // 하위 작업 인디케이터 설정
    const totalSubtasks = todo.getSubTasks().length;

    if (totalSubtasks) {
      const subtaskIndicator = elements.subtaskIndicatorFn();
      const subtaskIndicatorLabel = subtaskIndicator.querySelector('.subtask-indicator-label');
      let completedSubtasks = 0;
      todo.getSubTasks().forEach((subtask) => {
        if (subtask.isComplete) completedSubtasks += 1;
      });

      subtaskIndicatorLabel.innerHTML = `${completedSubtasks} of ${totalSubtasks}`;
      indicators.append(subtaskIndicator);

      if (totalSubtasks === completedSubtasks) {
        addClass(subtaskIndicator, 'completed');
      }

      // 하위 작업 툴팁 설정
      const remainingSubTasks = totalSubtasks - completedSubtasks;
      if (remainingSubTasks === 1) {
        subtaskIndicatorLabel.dataset.tooltip = 'One remaining subtask to complete';
        subtaskIndicator.dataset.tooltip = '';
      } else if (remainingSubTasks === 0) {
        subtaskIndicator.dataset.tooltip = 'All subtasks are completed';
      } else {
        subtaskIndicatorLabel.dataset.tooltip = `
        ${remainingSubTasks} remaining subtasks to complete
        `;
        subtaskIndicator.dataset.tooltip = '';
      }
    }

    // 날짜 인디케이터 설정
    if (todo.date !== '') {
      const dateIndicator = elements.dateIndicatorFn();
      const dateIndicatorLabel = dateIndicator.querySelector('.date-indicator-label');
      indicators.append(dateIndicator);
      dateIndicatorLabel.innerHTML = getFriendlyDate(todo.date, dateIndicator);
    }

    // 메모 인디케이터
    if (todo.note !== '') indicators.append(elements.noteIndicatorFn());

    // 중요 표시 인디케이터
    if (todo.isImportant) indicators.append(elements.importantIndicatorFn());

    // 인디케이터가 있는 경우 클래스 추가
    if (indicators.children.length > 0) addClass(titleBlock, 'indicator-on');

    titleBlock.append(title, indicators);
    // 모든 요소 결합
    li.append(label, checkbox, titleBlock, deleteBtn);

    // "계획됨" 프로젝트인 경우 날짜별 뷰에 배치
    if (selectedProject && selectedProject.dataset.index === '4') plannedListView(li, todo.date);
    else elements.todoList.prepend(li); // 기본 프로젝트에는 목록 맨 위에 추가

    // 새 항목이면 애니메이션 적용, 아니면 위치만 새로고침
    isNew ? animateAddTodoList(li, sort) : refreshTodoItemsPositions();

    // 새 항목인 경우 할 일 개수 업데이트
    if (isNew) {
      // 현재 목록의 할 일 개수 업데이트
      const todoCount = elements.lists.querySelector(
        `.list[data-index="${todo.projectID}"] .todo-count`,
      );
      todoCount.textContent = Number(todoCount.textContent) + 1;

      // 목록이 비어있지 않으면 할 일 개수 표시
      if (todoCount.textContent === '1') showElement(todoCount);
    }

    // 목록이 더 이상 비어있지 않으면 "빈 상태" 블록 숨김
    if (
      elements.todoList.children.length === 1 ||
      getElements('.todo-list-time .todo-item').length === 1
    ) {
      addClass(elements.emptyState, 'hide-empty-state');
    }
  };

  const removeTodo = (index, projectIndex) => {
    const todoItem = elements.todoList.querySelector(
      `.todo-item[data-index="${index}"].todo-item[data-project-index="${projectIndex}"]`,
    );
    const selectedProject = getElement('.list.selected');
    const isPlannedProject = selectedProject && selectedProject.dataset.index === '4';

    // 완료되지 않은 할 일의 경우 현재 목록의 할 일 개수 업데이트
    if (!todoItem.classList.contains('completed')) {
      const todoCount = elements.lists.querySelector(
        `.list[data-index="${projectIndex}"] .todo-count`,
      );
      todoCount.textContent = Number(todoCount.textContent) - 1;

      // 할 일이 없으면 할 일 개수 숨김
      if (todoCount.textContent === '0') hideElement(todoCount);
    }

    // 할 일 제거 애니메이션 적용
    animateRemoveTodoList(todoItem);

    // 선택된 할 일의 세부 정보 초기화
    if (todoItem.classList.contains('selected')) {
      resetDetails();
      // 선택된 할 일 삭제 시 세부 정보 뷰 숨김
      removeClass(elements.detailsView, 'show');
    }

    // "계획됨" 프로젝트에서 할 일 제거 처리
    if (isPlannedProject) {
      const todoListTime = todoItem.closest('ul.todo-list-time');
      const todoListHeader = getElement(`#${todoListTime.dataset.time}`);

      if (todoListTime.children.length === 1) {
        hideElement(todoListHeader);
        todoListTime.style.height = 0;
      }
    }

    // 할 일 항목 제거
    todoItem.remove();

    // 목록이 비어있으면 "빈 상태" 블록 표시
    if (
      elements.todoList.children.length === 0 ||
      (isPlannedProject && !getElement('.todo-list-time .todo-item'))
    ) {
      removeClass(elements.emptyState, 'hide-empty-state');
    }
  };

  const toggleTodo = (isComplete, id, projectID) => {
    const toggleComplete = document.getElementById(id);
    const todoItem = toggleComplete.closest('.todo-item');
    const todoCount = elements.lists.querySelector(`.list[data-index="${projectID}"] .todo-count`);
    const prevTodoCount = Number(todoCount.textContent);
    toggleComplete.checked = isComplete;

    if (isComplete) {
      addClass(todoItem, 'completed');
      todoCount.textContent = Number(todoCount.textContent) - 1;

      if (prevTodoCount === 1) hideElement(todoCount);

      if (todoItem.classList.contains('selected')) {
        addClass(elements.detailsView, 'disabled');
      }

      // 완료 효과음 재생
      playCompleteSound();
    } else {
      removeClass(todoItem, 'completed');
      todoCount.textContent = Number(todoCount.textContent) + 1;

      if (prevTodoCount === 0) showElement(todoCount);

      if (todoItem.classList.contains('selected')) {
        removeClass(elements.detailsView, 'disabled');
      }
    }
  };

  const createGitControls = (handleCreateBranch, handleDeleteBranch) => {
    const gitControls = document.createElement('div');
    gitControls.innerHTML = `
      <button id="create-branch-btn">브랜치 생성</button>
      <button id="delete-branch-btn">브랜치 삭제</button>
    `;

    const target = document.querySelector('.lists') || document.body;
    target.appendChild(gitControls);

    const createBtn = document.getElementById('create-branch-btn');
    if (createBtn) createBtn.addEventListener('click', handleCreateBranch);

    const deleteBtn = document.getElementById('delete-branch-btn');
    if (deleteBtn) deleteBtn.addEventListener('click', handleDeleteBranch);
  };

  const createRemoteControls = (handleSetRemote, handlePush) => {
    const remoteControls = document.createElement('div');
    remoteControls.innerHTML = `
      <button id="set-remote-btn">🔗 리모트 설정</button>
      <button id="push-btn">🚀 GitHub에 Push</button>
    `;

    const target = document.querySelector('.lists') || document.body;
    target.appendChild(remoteControls);

    const remoteBtn = document.getElementById('set-remote-btn');
    if (remoteBtn) remoteBtn.addEventListener('click', handleSetRemote);

    const pushBtn = document.getElementById('push-btn');
    if (pushBtn) pushBtn.addEventListener('click', handlePush);
  };

  const removeProject = (id) => {
    // 선택된 프로젝트가 기본 프로젝트인 경우 모든 할 일 제거
    const selectedProject = getElement('.list.selected');
    let index = null;

    if (selectedProject) index = Number(selectedProject.dataset.index);

    const defaultIndexes = [1, 2, 3, 4];

    if (defaultIndexes.includes(index)) {
      const tasks = elements.todoList.querySelectorAll('.todo-item');
      const todoCount = selectedProject.querySelector('.todo-count');
      Array.from(tasks).forEach((todo) => {
        const projectIndex = Number(todo.dataset.projectIndex);
        if (projectIndex === id) {
          todo.remove();

          if (todo.classList.contains('completed')) {
            updateTodoCount(todoCount, false);
          }
        }
      });
    }

    getElement(`.list[data-index="${id}"]`).remove();
  };

  /**
   * 할 일 목록을 새로운 순서로 재정렬하는 함수
   * @param {Object[]} todos 할 일 객체 목록
   * @param {Object} selectedTodo 선택된 할 일 객체
   */
  const refreshTodos = (todos, selectedTodo = null) => {
    enableTransition(elements.todoList);
    const { children } = elements.todoList;

    // 모델 데이터에 따라 DOM 요소 정렬
    todos.forEach((todo, i) => {
      Array.from(children).some((list, j) => {
        if (
          todo.id === Number(list.dataset.index) &&
          todo.projectID === Number(list.dataset.projectIndex) &&
          i !== children.length - 1 - j
        ) {
          swapElements(list, children[children.length - 1 - i]);

          return true;
        }

        return false;
      });
    });

    let increasedHeight = 0;
    // 정렬 변경 시 할 일 목록 새로고침 - 애니메이션 적용
    Array.from(children).forEach((list) => {
      // 할 일 세부 정보 옵션 변경 시 새로고침
      if (selectedTodo) {
        const isNotTranslating = list.style.transform
          ? getNumberFromString(list.style.transform) === increasedHeight
          : increasedHeight === 0;

        // 편집된 할 일이 위치를 변경하지 않는 경우 트랜지션 비활성화
        if (list === selectedTodo && isNotTranslating) {
          disableTransition(elements.todoList);
        }
      }

      const listHeight = list.offsetHeight + parseInt(getComputedStyle(list).marginBottom, 10);
      list.style.transform = `translateY(${increasedHeight}px)`;
      increasedHeight += listHeight;
    });

    if (elements.todoList.offsetHeight > increasedHeight) {
      elements.todoList.style.transitionDuration = '0.6s';
    }

    elements.todoList.style.height = `${increasedHeight + 8}px`;
  };

  /**
   * 프로젝트 목록의 모든 할 일을 표시하는 함수
   * @param {Object[]} todos 할 일 객체 목록
   */
  const displayTodos = (todos) => {
    const selectedProject = getElement('.list.selected');

    // 할 일 세부 정보 초기화 - 할 일 추가 전 세부 정보 뷰 제거
    resetDetails();
    // 목록 전환 및 목록 추가 시 세부 정보 뷰 숨김
    removeClass(elements.detailsView, 'show');

    // 작업 뷰 인덱스 설정
    elements.tasksView.dataset.projectIndex = selectedProject.dataset.index;
    // 작업 뷰 제목 설정
    elements.tasksTitle.textContent = getElement('.list.selected .project-name').textContent;
    empty(elements.todoList);

    // "계획됨" 할 일 목록의 경우 DOM 요소 추가
    if (selectedProject.dataset.index === '4') plannedListDOM();

    // 애니메이션 적용 - 할 일 목록 높이 초기화
    elements.todoList.style.height = 0;

    todos.forEach((todo) => {
      addTodo(todo);
    });

    // 목록이 비어있는지 여부에 따라 "빈 상태" 표시 전환
    todos.length === 0
      ? removeClass(elements.emptyState, 'hide-empty-state')
      : addClass(elements.emptyState, 'hide-empty-state');

    // 선택된 프로젝트와 할 일 뷰 연결
    if (selectedProject.classList.contains('pinned')) {
      addClass(elements.tasksView, 'pinned');
    } else {
      removeClass(elements.tasksView, 'pinned');
    }

    // 선택된 프로젝트에 맞는 빈 상태 표시 선택
    switchEmptyState(selectedProject);
  };

  /**
   * 검색 결과를 표시하는 함수
   * @param {Object[]} todos 할 일 객체 목록
   */
  const displaySearchResults = (todos) => {
    // 할 일 세부 정보 초기화 및 뷰 숨김
    resetDetails();
    removeClass(elements.detailsView, 'show');

    // 검색 모드에서 처음 실행될 때
    if (elements.tasksView.dataset.projectIndex) {
      // 작업 뷰 인덱스 설정
      elements.tasksView.dataset.projectIndex = '';
      // 프로젝트 선택 해제
      const selectedList = getElement('.lists .list.selected');
      removeClass(selectedList, 'selected');
      // 할 일 추가 폼 제거
      elements.newTodo.remove();
      // 선택된 프로젝트에 맞는 빈 상태 표시 선택
      const emptyState = document.getElementById('empty-state');
      const emptyStateText = emptyState.querySelector('p');
      const currentSVG = emptyState.querySelector('svg');

      if (currentSVG) currentSVG.remove();

      emptyState.insertAdjacentHTML('afterBegin', notFoundSVG);
      emptyStateText.textContent = "Sorry, we couldn't find what you're looking for.";
      // 선택된 프로젝트와 할 일 뷰 연결: 제목 편집 방지
      addClass(elements.tasksView, 'pinned');
    }

    empty(elements.todoList);

    // 애니메이션 적용 - 할 일 목록 높이 초기화
    elements.todoList.style.height = 0;

    todos.forEach((todo) => {
      addTodo(todo);
    });

    // 목록이 비어있는지 여부에 따라 "빈 상태" 표시 전환
    todos.length === 0
      ? removeClass(elements.emptyState, 'hide-empty-state')
      : addClass(elements.emptyState, 'hide-empty-state');
  };

  const isMobile = ((a) => {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a,
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
        a.substr(0, 4),
      )
    ) {
      return true;
    }

    return false;
  })(navigator.userAgent || navigator.vendor || window.opera);

  let flatCalendar = null;
  /**
   * 선택된 할 일 객체의 세부 정보를 표시하는 함수
   * @param {Object} todo 선택된 할 일 객체
   * @param {Object} currentProject 현재 프로젝트
   * @param {Object} sort 정렬 관련 설정
   * @param {Function} saveData 데이터 저장 함수
   */
  const displayDetails = (todo, currentProject, sort, saveData) => {
    // DOM 요소 선택
    const selectedTodo = getElement(
      `.todo-item[data-index="${todo.id}"].todo-item[data-project-index="${todo.projectID}"]`,
    );
    const selectedProject = getElement('.list.selected');
    // flatpickr 초기화
    if (flatCalendar) flatCalendar.destroy();
    // 표시 초기화
    resetDetails();
    // CSS 스타일링을 위한 클래스 추가
    selectedTodo.classList.add('selected');
    // 컴포넌트 표시를 위한 클래스 추가
    addClass(elements.detailsView, 'show');
    // 할 일이 완료된 경우 세부 정보 비활성화
    if (todo.isComplete) addClass(elements.detailsView, 'disabled');
    else removeClass(elements.detailsView, 'disabled');
    // 할 일 이름 블록
    const name = createElement('textarea', '.name-details');
    const nameBlock = wrap(name, 'name-block');
    name.maxLength = 255;
    name.value = todo.title;
    // 중요 표시 체크박스
    const importantBlock = createElement('span', '.important-block');
    const importantInput = createElement('input', '#important-check');
    const importantLabel = createElement('label');
    importantInput.type = 'checkbox';
    importantLabel.htmlFor = 'important-check';
    importantLabel.insertAdjacentHTML('beforeEnd', importantSVG);
    if (!todo.isImportant) importantLabel.dataset.tooltip = `Bookmark <em>${todo.title}</em>`;
    else importantLabel.dataset.tooltip = `<em>${todo.title}</em> is bookmarked`;
    importantBlock.append(importantLabel, importantInput);
    nameBlock.append(importantBlock);

    if (todo.isImportant) {
      addClass(importantBlock, 'important');
      importantInput.checked = true;
    }

    // 하위 작업 블록
    const subTasksForm = createElement('form');
    const subTasksInput = createElement('input', '#newSubTask');
    subTasksInput.type = 'text';
    subTasksInput.placeholder = '+ Add new subtask';
    subTasksInput.autocomplete = 'off';
    const subTasksSubmit = createElement('input', '.submit-btn');
    subTasksSubmit.type = 'submit';
    subTasksSubmit.value = '+ Add';
    addClass(subTasksSubmit, 'hide', 'text-button');
    subTasksForm.append(subTasksInput, subTasksSubmit);
    const subTasksBlock = wrap(subTasksForm, 'subtask-block');
    const subtasksList = createElement('ul', '.subtasks-list');
    subTasksBlock.prepend(subtasksList);
    const subtaskNameInput = createElement('input', '#subtaskNameInput');
    subtaskNameInput.autocomplete = 'off';
    // 할 일 메모 블록
    const note = createElement('textarea', '.note-details');
    note.value = todo.note;
    note.placeholder = 'Add note';
    // 할 일 날짜 블록
    const date = createElement('input', '#date');

    if (!isMobile) {
      flatCalendar = flatpickr(date, {
        defaultDate: todo.date,
      });
    }

    date.type = 'date';
    date.value = todo.date;
    const dateLabel = createElement('label');
    dateLabel.htmlFor = 'date';
    const dateMessage = createElement('span', '.date-message');
    const removeDate = createElement('span', '.remove-date');
    removeDate.insertAdjacentHTML('beforeEnd', removeSVG);
    const indicators = selectedTodo.querySelector('.indicators');

    if (todo.date) {
      dateMessage.innerHTML = getFriendlyDate(todo.date, dateLabel);
      addClass(dateLabel, 'is-set');
      // 날짜 인디케이터 텍스트 설정
      const dateIndicator = indicators.querySelector('.date-indicator');
      const dateIndicatorLabel = indicators.querySelector('.date-indicator-label');
      dateIndicatorLabel.innerHTML = dateMessage.innerHTML;

      if (dateMessage.classList.contains('overdue')) {
        addClass(dateIndicator, 'overdue');
      }
    } else {
      dateMessage.innerHTML = 'Add due date';
    }

    dateLabel.append(date, dateMessage);
    const dateBlock = wrap(dateLabel, 'date-block');
    dateBlock.insertAdjacentHTML('beforeEnd', calendarSVG);

    if (dateLabel.classList.contains('is-set') && !isMobile) dateBlock.append(removeDate);

    // "내 하루" 블록
    const myDay = createElement('div', '.my-day');
    const myDayText = createElement('span', '.my-day-text');
    const removeMyDay = createElement('span', '.remove-my-day');
    removeMyDay.insertAdjacentHTML('beforeEnd', removeSVG);
    myDay.append(myDayText, removeMyDay);
    myDay.insertAdjacentHTML('afterBegin', daySVG);

    if (todo.isMyDay) {
      addClass(myDay, 'added');
      myDayText.textContent = 'Added to My Day';
    } else {
      removeClass(myDay, 'added');
      myDayText.textContent = 'Add to My Day';
    }

    // 우선순위 블록
    const priorityBlock = createElement('div', '.priority-block');
    const priorityTitle = createElement('h2');
    priorityTitle.innerHTML = 'Priority';
    const priorityList = createElement('ul');
    const priorityLow = createElement('li', '.low');
    const priorityMedium = createElement('li', '.medium');
    const priorityHigh = createElement('li', '.high');
    priorityLow.insertAdjacentHTML('beforeEnd', prioritySVG);
    priorityMedium.insertAdjacentHTML('beforeEnd', prioritySVG);
    priorityHigh.insertAdjacentHTML('beforeEnd', prioritySVG);
    // 우선순위에 툴팁 추가
    priorityLow.dataset.tooltip = 'Low';
    priorityMedium.dataset.tooltip = 'Medium';
    priorityHigh.dataset.tooltip = 'High';
    priorityList.append(priorityLow, priorityMedium, priorityHigh);
    addClass(priorityList.querySelector(`.${todo.priority.toLowerCase()}`), 'selected');
    priorityBlock.append(priorityTitle, priorityList);
    // 생성 날짜 블록
    const creationDate = createElement('div', '.creation-date');
    const creationDateText = createElement('span', '.creation-date-text');
    const convertedCreationDate = getConvertedCurrentDate(todo.creationDate);
    creationDateText.textContent = getFriendlyCreationDate(convertedCreationDate);
    creationDate.append(creationDateText);
    // 세부 정보 블록에 추가
    elements.detailsView.append(
      nameBlock,
      subTasksBlock,
      myDay,
      dateBlock,
      priorityBlock,
      wrap(note, 'note-block'),
      creationDate,
    );

    // 하위 작업 목록에 추가
    todo.getSubTasks().forEach((subTask) => {
      const li = createElement('li', '.subtask');
      li.dataset.index = subTask.id;

      if (subTask.isComplete) addClass(li, 'completed');

      // 완료 상태를 토글하는 체크박스 설정
      const checkbox = createElement('input', `#subtask-checkbox${subTask.id}`);
      const label = createElement('label');
      const span = createElement('span');
      span.insertAdjacentHTML('beforeEnd', checkSVG);
      checkbox.type = 'checkbox';
      checkbox.checked = subTask.isComplete;
      label.htmlFor = `subtask-checkbox${subTask.id}`;
      label.append(span);
      // 하위 작업 이름 설정
      const subTaskName = createElement('span', '.subtask-name');
      subTaskName.textContent = subTask.name;
      // 삭제 버튼
      const deleteBtn = createElement('button', '.delete-btn');
      deleteBtn.insertAdjacentHTML('beforeEnd', deleteSVG);
      // 모든 요소 결합
      li.append(label, checkbox, subTaskName, deleteBtn);
      subtasksList.prepend(li);

      // 하위 작업 목록 재배치
      repositionSubTaskList();
    });

    // 모바일에서 오버레이 표시
    if (document.body.offsetWidth < 770) {
      addClass(elements.overlay, 'fade-in');
    }

    // 핸들러를 위한 헬퍼 함수
    const toggleIndicatorClass = () => {
      const titleBlock = selectedTodo.querySelector('.title-block');
      indicators.children.length > 0
        ? addClass(titleBlock, 'indicator-on')
        : removeClass(titleBlock, 'indicator-on');
    };

    // Synthetic 이벤트에 핸들러 설정
    const nameHeight = getComputedStyle(name).height;
    name.style.height =
      name.scrollHeight <= getNumberFromString(nameHeight) ? nameHeight : `${name.scrollHeight}px`;

    const handleNameChange = (e) => {
      const { target } = e;
      todo.title = target.value;
      selectedTodo.querySelector('.todo-title').textContent = todo.title;
      // 텍스트 영역의 높이 변경
      name.style.height = nameHeight; // Reset height to make it responsive also when deleting
      name.style.height =
        name.scrollHeight <= getNumberFromString(nameHeight)
          ? nameHeight
          : `${name.scrollHeight}px`;

      // 이름 변경 시 작업 정렬
      sort.refreshSort(currentProject, selectedTodo);

      // 북마크 툴팁 업데이트
      importantLabel.dataset.tooltip = `Bookmark <em>${todo.title}</em>`;

      // 로컬 스토리지 업데이트
      saveData();
    };

    const noteHeight = getComputedStyle(note).height;
    note.style.height =
      note.scrollHeight <= getNumberFromString(noteHeight) ? noteHeight : `${note.scrollHeight}px`;

    const handleNoteChange = (e) => {
      const { target } = e;
      todo.note = target.value;
      note.style.height = noteHeight; // Reset height to make it responsive also when deleting
      note.style.height =
        note.scrollHeight <= getNumberFromString(noteHeight)
          ? noteHeight
          : `${note.scrollHeight}px`;

      const liveNoteIndicator = selectedTodo.querySelector('.note-indicator');

      if (target.value !== '' && !liveNoteIndicator) {
        appendIndicator(elements.noteIndicatorFn(), selectedTodo);
        toggleIndicatorClass();
      } else if (target.value === '' && liveNoteIndicator) {
        liveNoteIndicator.remove();
        toggleIndicatorClass();
      }

      // 메모 변경 시 할 일 목록 새로고침
      sort.refreshSort(currentProject, selectedTodo);

      // 로컬 스토리지 업데이트
      saveData();
    };

    const handleRemoveDateClick = () => {
      if (flatCalendar) flatCalendar.clear();
      else date.value = '';

      todo.date = date.value;
      dateMessage.innerHTML = 'Add due date';
      removeClass(dateLabel, 'is-set');
      removeClass(dateLabel, 'overdue');
      removeClass(dateLabel, 'today');
      removeDate.remove();

      // "계획됨" 프로젝트에서 할 일 제거
      const isPlannedProject = selectedProject && selectedProject.dataset.index === '4';
      if (isPlannedProject) {
        const todoListTime = selectedTodo.closest('ul.todo-list-time');
        const todoListHeader = getElement(`#${todoListTime.dataset.time}`);

        if (todoListTime.children.length === 1) {
          hideElement(todoListHeader);
          todoListTime.style.height = 0;
        }

        // 할 일 제거 애니메이션 적용
        animateRemoveTodoList(selectedTodo);

        selectedTodo.remove();

        // 모든 목록이 비어있으면 "빈 상태" 블록 표시
        if (!getElement('.todo-list-time .todo-item')) {
          removeClass(elements.emptyState, 'hide-empty-state');
        }
      }

      // 날짜 인디케이터 설정
      const liveDateIndicator = selectedTodo.querySelector('.date-indicator');
      liveDateIndicator.remove();
      toggleIndicatorClass();

      // "계획됨" 프로젝트의 할 일 개수 업데이트
      const plannedCount = getElement('.list[data-index="4"] .todo-count');
      updateTodoCount(plannedCount, false);

      // 날짜 제거 시 작업 정렬
      sort.refreshSort(currentProject, selectedTodo);

      // 로컬 스토리지 업데이트
      saveData();
    };

    const handleDateChange = (e) => {
      const { target } = e;
      const isPlannedProject = selectedProject && selectedProject.dataset.index === '4';

      // removeDate 버튼이 클릭된 경우 이 함수 실행 안 함
      if (!target.value) {
        if (isMobile) handleRemoveDateClick();

        return;
      }

      todo.date = target.value;
      dateMessage.innerHTML = getFriendlyDate(todo.date, dateLabel);

      // "date"가 이전에 설정되지 않은 경우
      const isDateSet = dateLabel.classList.contains('is-set');

      if (!isDateSet) {
        addClass(dateLabel, 'is-set');

        // "계획됨" 프로젝트의 할 일 개수 업데이트
        const plannedCount = getElement('.list[data-index="4"] .todo-count');
        updateTodoCount(plannedCount, true);

        // "계획됨" 프로젝트에서 편집 중인 경우 제거된 목록 복원
        if (isPlannedProject) {
          selectedTodo.style = '';
          plannedListView(selectedTodo, todo.date);

          // 목록이 비어있지 않으면 "빈 상태" 블록 숨김
          if (getElements('.todo-list-time .todo-item').length === 1) {
            addClass(elements.emptyState, 'hide-empty-state');
          }
        }
      } else if (isPlannedProject) {
        const todoListTime = selectedTodo.closest('.todo-list-time');
        const todoListHeader = getElement(`#${todoListTime.dataset.time}`);

        plannedListView(selectedTodo, todo.date);

        // 헤더 시간 그룹이 비어있는 경우 숨김
        if (todoListTime.children.length === 0) {
          hideElement(todoListHeader);
          todoListTime.style.height = 0;
        }

        // 새 날짜가 다른 그룹 날짜에 있는 경우 애니메이션 실행
        if (todoListTime !== selectedTodo.closest('.todo-list-time')) {
          selectedTodo.style = '';
          refreshTodoItemsPositions();
        }

        // 목록이 비어있지 않으면 "빈 상태" 블록 숨김
        if (getElements('.todo-list-time .todo-item').length === 1) {
          addClass(elements.emptyState, 'hide-empty-state');
        }
      }

      // 날짜 인디케이터 설정
      const liveDateIndicator = selectedTodo.querySelector('.date-indicator');

      if (todo.date && !liveDateIndicator) {
        const dateIndicator = elements.dateIndicatorFn();
        appendIndicator(dateIndicator, selectedTodo);
        dateIndicator.querySelector('.date-indicator-label').innerHTML = getFriendlyDate(
          todo.date,
          dateIndicator,
        );
        toggleIndicatorClass();

        dateLabel.classList.contains('overdue')
          ? addClass(dateIndicator, 'overdue')
          : removeClass(dateIndicator, 'overdue');
      } else if (todo.date) {
        liveDateIndicator.querySelector('.date-indicator-label').innerHTML = getFriendlyDate(
          todo.date,
          liveDateIndicator,
        );
      }

      // 새 항목이면 애니메이션 적용
      if (!isDateSet && isPlannedProject) {
        animateAddTodoList(selectedTodo);
      }

      if (!dateBlock.contains(removeDate) && !isMobile) dateBlock.append(removeDate);

      // 날짜 변경 시 작업 정렬
      sort.refreshSort(currentProject, selectedTodo);

      // 로컬 스토리지 업데이트
      saveData();
    };

    const handlePriorityClick = (e) => {
      const { target } = e;
      const flag = target.closest('li');

      if (!flag) return;

      const list = target.closest('ul');
      unselect(list);
      [todo.priority] = flag.classList;
      addClass(flag, 'selected');
      const priorityClass = `${todo.priority.toLowerCase()}`;
      resetClassList(selectedTodo, ['low', 'medium', 'high']);
      addClass(selectedTodo, priorityClass);

      // 우선순위 변경 시 작업 정렬
      if (sort && sort.type() === 'Priority') {
        sort.refreshSort(currentProject);
      }

      // 로컬 스토리지 업데이트
      saveData();
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const { target } = e;
      const input = target.elements.newSubTask;

      if (input.value === '') return;

      todo.addSubTask(input.value);
      input.value = '';
      const subTask = todo.getSubTasks()[todo.getSubTasks().length - 1];
      const li = createElement('li', '.subtask');
      li.dataset.index = subTask.id;
      // 완료 상태를 토글하는 체크박스 설정
      const checkbox = createElement('input', `#subtask-checkbox${subTask.id}`);
      const label = createElement('label');
      const span = createElement('span');
      span.insertAdjacentHTML('beforeEnd', checkSVG);
      checkbox.type = 'checkbox';
      checkbox.checked = subTask.isComplete;
      label.htmlFor = `subtask-checkbox${subTask.id}`;
      label.append(span);
      // 하위 작업 이름 설정
      const subTaskName = createElement('span', '.subtask-name');
      subTaskName.textContent = subTask.name;
      // 삭제 버튼
      const deleteBtn = createElement('button', '.delete-btn');
      deleteBtn.insertAdjacentHTML('beforeEnd', deleteSVG);
      // 모든 요소 결합
      li.append(label, checkbox, subTaskName, deleteBtn);
      subtasksList.prepend(li);

      // 제출 후 "추가" 버튼 숨김
      hideElement(subTasksSubmit);

      // 하위 작업 추가 애니메이션 적용
      animateAddSubTaskList();

      // 인디케이터
      const liveSubtaskIndicator = selectedTodo.querySelector('.subtask-indicator');
      let liveSubtaskIndicatorLabel = selectedTodo.querySelector('.subtask-indicator-label');
      const totalSubtasks = todo.getSubTasks().length;
      let completedSubtasks = 0;
      todo.getSubTasks().forEach((subtask) => {
        if (subtask.isComplete) completedSubtasks += 1;
      });

      if (totalSubtasks && !liveSubtaskIndicatorLabel) {
        const subtaskIndicator = elements.subtaskIndicatorFn();
        const subtaskIndicatorLabel = subtaskIndicator.querySelector('.subtask-indicator-label');
        subtaskIndicatorLabel.innerHTML = `${completedSubtasks} of ${totalSubtasks}`;
        appendIndicator(subtaskIndicator, selectedTodo);
        toggleIndicatorClass();
      } else if (totalSubtasks) {
        removeClass(liveSubtaskIndicator, 'completed');
        liveSubtaskIndicatorLabel.innerHTML = `${completedSubtasks} of ${totalSubtasks}`;
      }

      // 하위 작업 툴팁 설정
      liveSubtaskIndicatorLabel = selectedTodo.querySelector('.subtask-indicator-label');
      const remainingSubTasks = totalSubtasks - completedSubtasks;
      if (remainingSubTasks === 1) {
        liveSubtaskIndicatorLabel.dataset.tooltip = 'One remaining subtask to complete';
      } else {
        liveSubtaskIndicatorLabel.dataset.tooltip = `
        ${remainingSubTasks} remaining subtasks to complete
        `;
      }

      // 하위 작업 추가 시 작업 위치 새로고침
      sort.refreshSort(currentProject, selectedTodo);

      // 로컬 스토리지 업데이트
      saveData();
    };

    const handleDeleteSubtask = (e) => {
      const { target } = e;
      const deleteButton = target.closest('.delete-btn');

      if (!deleteButton) return;

      const li = target.closest('.subtask');
      const id = Number(li.dataset.index);
      todo.removeSubTask(id);

      // 하위 작업 제거 애니메이션 적용
      animateRemoveSubTask(li);

      li.remove();

      // 인디케이터
      const subtaskIndicator = selectedTodo.querySelector('.subtask-indicator');
      const liveSubtaskIndicatorLabel = selectedTodo.querySelector('.subtask-indicator-label');
      const totalSubtasks = todo.getSubTasks().length;
      let completedSubtasks = 0;
      todo.getSubTasks().forEach((subtask) => {
        if (subtask.isComplete) completedSubtasks += 1;
      });

      if (totalSubtasks) {
        liveSubtaskIndicatorLabel.innerHTML = `${completedSubtasks} of ${totalSubtasks}`;

        if (totalSubtasks === completedSubtasks) {
          addClass(subtaskIndicator, 'completed');
        }
      } else if (!totalSubtasks) {
        subtaskIndicator.remove();
        toggleIndicatorClass();
      }

      // 하위 작업 툴팁 설정
      const remainingSubTasks = totalSubtasks - completedSubtasks;
      if (remainingSubTasks === 1) {
        liveSubtaskIndicatorLabel.dataset.tooltip = 'One remaining subtask to complete';
      } else if (remainingSubTasks === 0) {
        subtaskIndicator.dataset.tooltip = 'All subtasks are completed';
      } else {
        liveSubtaskIndicatorLabel.dataset.tooltip = `
        ${remainingSubTasks} remaining subtasks to complete
        `;
      }

      // 하위 작업 제거 시 작업 위치 새로고침
      sort.refreshSort(currentProject, selectedTodo);

      // 로컬 스토리지 업데이트
      saveData();
    };

    const handleToggleSubtask = (e) => {
      const { target } = e;
      const li = target.closest('.subtask');

      if (!li) return;

      const id = Number(li.dataset.index);

      if (target.id !== `subtask-checkbox${id}`) return;

      todo.toggleSubTask(id);
      const subTask = todo.getSubTasks().find((subtask) => subtask.id === id);
      const { isComplete } = subTask;
      target.checked = isComplete;

      if (isComplete) {
        addClass(li, 'completed');
        // 완료 효과음 재생
        playCompleteSound();
      } else {
        removeClass(li, 'completed');
      }

      // 인디케이터
      const subtaskIndicator = selectedTodo.querySelector('.subtask-indicator');
      const liveSubtaskIndicatorLabel = subtaskIndicator.querySelector('.subtask-indicator-label');
      const totalSubtasks = todo.getSubTasks().length;
      let completedSubtasks = 0;
      todo.getSubTasks().forEach((subtask) => {
        if (subtask.isComplete) completedSubtasks += 1;
      });

      liveSubtaskIndicatorLabel.innerHTML = `${completedSubtasks} of ${totalSubtasks}`;

      if (totalSubtasks === completedSubtasks) {
        addClass(subtaskIndicator, 'completed');
      } else {
        removeClass(subtaskIndicator, 'completed');
      }

      // 하위 작업 툴팁 설정
      const remainingSubTasks = totalSubtasks - completedSubtasks;
      if (remainingSubTasks === 1) {
        liveSubtaskIndicatorLabel.dataset.tooltip = 'One remaining subtask to complete';
        subtaskIndicator.dataset.tooltip = '';
      } else if (remainingSubTasks === 0) {
        subtaskIndicator.dataset.tooltip = 'All subtasks are completed';
      } else {
        liveSubtaskIndicatorLabel.dataset.tooltip = `
        ${remainingSubTasks} remaining subtasks to complete
        `;
        subtaskIndicator.dataset.tooltip = '';
      }

      // 하위 작업 토글 시 작업 위치 새로고침
      sort.refreshSort(currentProject, selectedTodo);

      // 로컬 스토리지 업데이트
      saveData();
    };

    const handleSwitchSubtask = (e) => {
      const { target } = e;
      const selectedSubtask = target.closest('.subtask');

      if (!selectedSubtask || (target !== selectedSubtask && !target.closest('.subtask-name'))) {
        return;
      }

      const subtaskName = selectedSubtask.querySelector('.subtask-name');

      if (!selectedSubtask.classList.contains('selected')) {
        unselect(subtasksList);
        addClass(selectedSubtask, 'selected');
      }

      if (selectedSubtask.classList.contains('completed')) return;

      const id = Number(selectedSubtask.dataset.index);

      const updateName = (value) => {
        todo.editSubTaskName(id, value);

        // 로컬 스토리지 업데이트
        saveData();
      };

      const args = [subtaskName, subtaskNameInput, updateName];
      toggleEditMode(...args);
    };

    const handleInput = (e) => {
      const { target } = e;
      const addButton = subTasksSubmit;

      target.value ? showElement(addButton) : hideElement(addButton);
    };

    const handleOverlayClick = () => {
      // 할 일 세부 정보 초기화
      resetDetails();

      // 오버레이 클릭 시 세부 정보 뷰 숨김
      removeClass(elements.detailsView, 'show');
      removeClass(elements.overlay, 'fade-in');

      off(elements.overlay, 'click', handleOverlayClick);
    };

    // 메뉴 클릭 시 세부 정보 뷰 닫기
    const handleMenuClick = () => {
      if (document.body.offsetWidth >= 770) return;
      // 할 일 세부 정보 초기화
      resetDetails();

      // 오버레이 클릭 시 세부 정보 뷰 숨김
      removeClass(elements.detailsView, 'show');

      off(elements.menuButton, 'click', handleMenuClick);
      off(elements.overlay, 'click', handleOverlayClick);
    };

    const handleImportantClick = () => {
      const importantCount = getElement('.list[data-index="3"] .todo-count');
      todo.isImportant = !importantInput.checked;
      importantInput.checked
        ? removeClass(importantBlock, 'important')
        : addClass(importantBlock, 'important');

      if (importantInput.checked) {
        removeClass(importantBlock, 'important');
        selectedTodo.querySelector('.important-indicator').remove();
        toggleIndicatorClass();

        // "중요" 프로젝트의 할 일 개수 업데이트
        updateTodoCount(importantCount, false);

        // "중요" 프로젝트에서 편집 중인 경우 할 일 제거
        if (selectedProject && selectedProject.dataset.index === '3') {
          selectedTodo.remove();

          // "중요" 프로젝트가 비어있으면 "빈 상태" 블록 표시
          if (elements.todoList.children.length === 0) {
            removeClass(elements.emptyState, 'hide-empty-state');
          }
        }

        // 북마크 툴팁 업데이트
        importantLabel.dataset.tooltip = `Bookmark <em>${todo.title}</em>`;
      } else {
        addClass(importantBlock, 'important');
        indicators.append(elements.importantIndicatorFn());
        toggleIndicatorClass();

        // "중요" 프로젝트의 할 일 개수 업데이트
        updateTodoCount(importantCount, true);

        // "중요" 프로젝트에서 편집 중인 경우 할 일 추가
        if (selectedProject && selectedProject.dataset.index === '3') {
          elements.todoList.append(selectedTodo);

          // "중요" 프로젝트가 비어있지 않으면 "빈 상태" 블록 숨김
          if (elements.todoList.children.length === 1) {
            addClass(elements.emptyState, 'hide-empty-state');
          }
        }

        // 북마크 툴팁 업데이트
        importantLabel.dataset.tooltip = `<em>${todo.title}</em> is bookmarked`;
      }

      // 중요도 변경 시 작업 정렬
      sort.refreshSort(currentProject, selectedTodo);

      // 툴팁 스팬 실시간 업데이트
      getElement('.tooltip').innerHTML = importantLabel.dataset.tooltip;

      // 로컬 스토리지 업데이트
      saveData();
    };

    const handleMyDayClick = (e) => {
      const { target } = e;
      const myDayCount = getElement('.list[data-index="2"] .todo-count');

      if (target.closest('.remove-my-day') || todo.isMyDay) return;

      todo.isMyDay = true;
      addClass(myDay, 'added');
      myDayText.textContent = 'Added to My Day';

      // 인디케이터 추가
      appendIndicator(elements.myDayIndicatorFn(), selectedTodo);
      toggleIndicatorClass();

      // "중요" 프로젝트의 할 일 개수 업데이트
      updateTodoCount(myDayCount, true);

      // "중요" 프로젝트에서 편집 중인 경우 할 일 추가
      if (selectedProject && selectedProject.dataset.index === '2') {
        elements.todoList.append(selectedTodo);

        // "내 하루" 프로젝트가 비어있으면 "빈 상태" 블록 숨김
        if (elements.todoList.children.length === 1) {
          addClass(elements.emptyState, 'hide-empty-state');
        }
      }

      // "내 하루" 추가 시 작업 정렬
      sort.refreshSort(currentProject, selectedTodo);

      // 로컬 스토리지 업데이트
      saveData();
    };

    const handleRemoveMyDayClick = () => {
      const myDayCount = getElement('.list[data-index="2"] .todo-count');
      todo.isMyDay = false;
      removeClass(myDay, 'added');
      myDayText.textContent = 'Add to My Day';

      // 인디케이터 제거
      selectedTodo.querySelector('.my-day-indicator').remove();
      toggleIndicatorClass();

      // "중요" 프로젝트의 할 일 개수 업데이트
      updateTodoCount(myDayCount, false);

      // "중요" 프로젝트에서 편집 중인 경우 할 일 제거
      if (selectedProject && selectedProject.dataset.index === '2') {
        selectedTodo.remove();

        // "내 하루" 프로젝트가 비어있으면 "빈 상태" 블록 표시
        if (elements.todoList.children.length === 0) {
          removeClass(elements.emptyState, 'hide-empty-state');
        }
      }

      // "내 하루" 제거 시 작업 정렬
      sort.refreshSort(currentProject, selectedTodo);

      // 로컬 스토리지 업데이트
      saveData();
    };

    // 이벤트 리스너 설정
    on(name, 'input', handleNameChange);
    on(note, 'input', handleNoteChange);
    on(date, 'change', handleDateChange);
    on(removeDate, 'click', handleRemoveDateClick);
    on(priorityList, 'click', handlePriorityClick);
    on(subTasksForm, 'submit', handleSubmit);
    on(subtasksList, 'click', handleDeleteSubtask);
    on(subtasksList, 'click', handleToggleSubtask);
    on(subtasksList, 'click', handleSwitchSubtask);
    on(subTasksInput, 'input', handleInput);
    on(elements.overlay, 'click', handleOverlayClick);
    on(elements.menuButton, 'click', handleMenuClick);
    on(importantLabel, 'click', handleImportantClick);
    on(myDay, 'click', handleMyDayClick);
    on(removeMyDay, 'click', handleRemoveMyDayClick);
  };

  // 목록 추가 입력/제출 이벤트를 감지하여 "추가" 버튼 숨김/표시
  const handleInput = (e) => {
    const { target } = e;
    const addButton = elements.newListSubmit;

    target.value ? showElement(addButton) : hideElement(addButton);
  };

  on(elements.newListInput, 'input', handleInput);

  // 창 크기 조정 감지
  const handleResize = () => {
    // 크기 조정 시 할 일 위치 재배치
    refreshTodoItemsPositions();
    // 창 크기 확인 및 오버레이 표시/숨김 처리
    const { detailsView } = elements;
    if (detailsView.classList.contains('show')) {
      if (document.body.offsetWidth < 770) {
        addClass(elements.overlay, 'fade-in');
      } else {
        removeClass(elements.overlay, 'fade-in');
      }
    }
  };
  on(window, 'resize', handleResize);

  /**
   * Synthetic 이벤트에서 handleAddTodo 함수를 호출
   * @param {Function} handler Synthetic 이벤트에서 호출되는 함수
   */
  const bindAddTodo = (handler) => {
    on(elements.newTodo, 'submit', handler);
  };

  /**
   * Synthetic 이벤트에서 handleDeleteTodo 함수를 호출
   * @param {Function} handler Synthetic 이벤트에서 호출되는 함수
   */
  const bindDeleteTodo = (handler) => {
    on(elements.todoList, 'click', handler);
  };

  /**
   * Synthetic 이벤트에서 handleToggleTodo 함수를 호출
   * @param {Function} handler Synthetic 이벤트에서 호출되는 함수
   */
  const bindToggleTodo = (handler) => {
    on(elements.todoList, 'change', handler);
  };

  /**
   * Synthetic 이벤트에서 handleAddList 함수를 호출
   * @param {Function} handler Synthetic 이벤트에서 호출되는 함수
   */
  const bindAddList = (handler) => {
    on(elements.newList, 'submit', handler);
  };

  /**
   * Synthetic 이벤트에서 handleSwitchList 함수를 호출
   * @param {Function} handler Synthetic 이벤트에서 호출되는 함수
   */
  const bindSwitchList = (handler) => {
    on(elements.lists, 'click', handler);
  };

  /**
   * Synthetic 이벤트에서 handleDeleteList 함수를 호출
   * @param {Function} handler Synthetic 이벤트에서 호출되는 함수
   */
  const bindDeleteList = (handler) => {
    on(elements.lists, 'click', handler);
  };

  /**
   * Synthetic 이벤트에서 handleEditTasksTitle 함수를 호출
   * @param {Function} handler Synthetic 이벤트에서 호출되는 함수
   */
  const bindEditTasksTitle = (handler) => {
    on(elements.tasksTitle, 'click', handler);
  };

  /**
   * Synthetic 이벤트에서 handleSwitchTodo 함수를 호출
   * @param {Function} handler Synthetic 이벤트에서 호출되는 함수
   */
  const bindSwitchTodo = (handler) => {
    on(elements.todoList, 'click', handler);
  };

  /**
   * Synthetic 이벤트에서 handleSortList 함수를 호출
   * @param {Function} handler Synthetic 이벤트에서 호출되는 함수
   */
  const bindSortList = (handler) => {
    on(elements.sortList, 'click', handler);
  };

  /**
   * Synthetic 이벤트에서 handleSortIndicator 함수를 호출
   * @param {Function} handler Synthetic 이벤트에서 호출되는 함수
   */
  const bindSortIndicator = (handler) => {
    on(elements.sortIndicator, 'click', handler);
  };

  /**
   * Synthetic 이벤트에서 handlePlannedClick 함수를 호출
   * @param {Function} handler Synthetic 이벤트에서 호출되는 함수
   */
  const bindPlannedClick = (handler) => {
    on(elements.todoList, 'click', handler);
  };

  /**
   * Synthetic 이벤트에서 handleSearchInput 함수를 호출
   * @param {Function} handler Synthetic 이벤트에서 호출되는 함수
   */
  const bindSearchInput = (handler) => {
    on(elements.searchInput, 'input', handler);
  };

  /**
   * Synthetic 이벤트에서 handleSearchReset 함수를 호출
   * @param {Function} handler Synthetic 이벤트에서 호출되는 함수
   */
  const bindSearchReset = (handler) => {
    on(elements.searchReset, 'click', handler);
  };

  /**
   * Synthetic 이벤트에서 handleSearchBlur 함수를 호출
   * @param {Function} handler Synthetic 이벤트에서 호출되는 함수
   */
  const bindSearchBlur = (handler) => {
    on(elements.searchInput, 'blur', handler);
  };

  return {
    displayList,
    removeProject,
    displayTodos,
    addTodo,
    removeTodo,
    toggleTodo,
    elements,
    bindAddTodo,
    bindDeleteTodo,
    bindToggleTodo,
    bindAddList,
    bindSwitchList,
    bindDeleteList,
    bindEditTasksTitle,
    bindSortList,
    bindSortIndicator,
    bindPlannedClick,
    bindSearchInput,
    bindSearchReset,
    empty,
    toggleEditMode,
    displayDetails,
    bindSwitchTodo,
    hideElement,
    showElement,
    confirmRemoval,
    updateTodoCount,
    resetDetails,
    getConvertedCurrentDate,
    resetMyDayCount,
    refreshTodoItemsPositions,
    refreshTodos,
    initPlannedDateTabs,
    removeClass,
    addClass,
    getElement,
    enableTransition,
    displaySearchResults,
    bindSearchBlur,
    on,
    off,
    createGitControls, // ✅ 여기 추가!
    createRemoteControls, // ✅ 여기 추가!
  };
};

export { todoView, DOMHelpers };
