/**
 * 애플리케이션의 DOM 요소 초기화 모듈
 * 앱의 모든 UI 요소를 생성하고 구조화하는 기능 제공
 */
import DOMHelpers from '../helpers/DOMHelpers';
import assets from './assets';
import tooltip from '../features/todo.tooltip';

// DOM 조작을 위한 헬퍼 함수들 가져오기
const {
  createElement,       // 요소 생성 함수
  on,                  // 이벤트 리스너 추가 함수
  off,                 // 이벤트 리스너 제거 함수
  getElement,          // 요소 선택 함수
  addClass,            // 클래스 추가 함수
  removeClass,         // 클래스 제거 함수
  toggleClass,         // 클래스 토글 함수
  disableTransition,   // 트랜지션 비활성화 함수
  wrap,                // 요소 래핑 함수
} = DOMHelpers();

// 애셋(아이콘, 이미지, 사운드 등) 가져오기
const {
  arrowSVG,            // 화살표 아이콘
  emptyStateSVG,       // 빈 상태 이미지
  calendarSVG,         // 달력 아이콘
  noteSVG,             // 메모 아이콘
  checkMarkSVG,        // 체크 표시 아이콘
  menuSVG,             // 메뉴 아이콘
  plusSVG,             // 더하기 아이콘
  removeSVG,           // 제거 아이콘
  importantSVG,        // 중요 아이콘
  daySVG,              // 오늘 아이콘
  sortSVG,             // 정렬 아이콘
  sortNameSVG,         // 이름 정렬 아이콘
  prioritySVG,         // 우선순위 아이콘
  sortCompletedSVG,    // 완료 정렬 아이콘
  sortCreationDateSVG, // 생성 날짜 정렬 아이콘
  completeSound,       // 완료 소리
  chevronSVG,          // 쉐브론 아이콘
  searchSVG,           // 검색 아이콘
} = assets();

/**
 * DOM 요소 초기화 함수
 * 애플리케이션의 모든 UI 요소를 생성하고 구조화함
 * @returns {Object} 생성된 DOM 요소들을 포함하는 객체
 */
const initializeDOMElements = () => {
  // 루트 요소 (앱의 최상위 컨테이너)
  const root = document.getElementById('root');
  // Header
  const header = createElement('header');
  const menuButton = createElement('button', '.menu-btn');
  menuButton.dataset.state = 'open';
  menuButton.insertAdjacentHTML('beforeEnd', menuSVG);
  const searchContainer = createElement('div', '.search-container');
  const searchIcon = createElement('span', '.search-icon');
  const searchInput = createElement('input', '#search-input');
  const searchReset = createElement('button', '.search-reset');
  const searchOverlay = createElement('div', '.search-overlay');
  searchIcon.insertAdjacentHTML('beforeEnd', searchSVG);
  searchInput.type = 'text';
  searchInput.placeholder = 'Search';
  searchInput.autocomplete = 'off';
  searchReset.insertAdjacentHTML('beforeEnd', removeSVG);
  addClass(searchReset, 'text-button', 'hide');
  searchContainer.append(searchIcon, searchInput, searchReset, searchOverlay);
  header.append(menuButton, wrap(searchContainer, 'search-wrapper'));
  // The left block containing all projects
  const listsMenu = createElement('div', '.lists-menu');
  // close menu if mobile
  if (document.body.offsetWidth < 770) {
    menuButton.dataset.state = 'closed';
    addClass(listsMenu, 'mobile');
  }
  // UL element with our list of projects
  const lists = createElement('ul', '.lists');
  // The form with our input to add a project
  const newList = createElement('form');
  const newListInput = createElement('input', '#newList');
  const newListLabel = createElement('label');
  const newListSubmit = createElement('input', '.submit-btn');
  newListLabel.insertAdjacentHTML('beforeEnd', plusSVG);
  newListLabel.htmlFor = 'newList';
  newListInput.type = 'text';
  newListInput.placeholder = 'New list';
  newListInput.autocomplete = 'off';
  newListSubmit.type = 'submit';
  newListSubmit.value = '+ Add';
  addClass(newListSubmit, 'hide', 'text-button');

  // The center block which will display our todos/tasks
  const tasksView = createElement('div', '.tasks-view');
  // UL element with our list of tasks
  const todoList = createElement('ul', '.todo-list');
  // The form with the input to add a Todo
  const newTodo = createElement('form');
  const newTodoInput = createElement('input', '#newTodo');
  const newTodoSubmit = createElement('button', '.submit-btn');
  newTodoInput.type = 'text';
  newTodoInput.placeholder = '+ Add task';
  newTodoInput.autocomplete = 'off';
  newTodoSubmit.type = 'submit';
  newTodoSubmit.insertAdjacentHTML('beforeEnd', arrowSVG);
  // Empty state block
  const emptyState = createElement('div', '#empty-state');
  emptyState.insertAdjacentHTML('beforeEnd', emptyStateSVG);
  const emptyStateText = createElement('p');
  emptyStateText.textContent = 'What tasks are on your mind?';
  emptyState.append(emptyStateText);

  // Display selected list Header in tasks view
  const tasksHeader = createElement('div', '.tasks-header');
  const tasksTitleWrapper = createElement('h1');
  const tasksTitle = createElement('span', '.tasks-title');
  const tasksTitleInput = createElement('input', '#tasksTitleInput');
  tasksTitleInput.autocomplete = 'off';
  tasksTitleWrapper.append(tasksTitle);
  const sortButton = createElement('button', '.sort-btn');
  addClass(sortButton, 'text-button');
  const sortText = createElement('span', '.sort-text');
  sortText.textContent = 'Sort';
  sortButton.insertAdjacentHTML('afterBegin', sortSVG);
  sortButton.append(sortText);

  // Sort contextual menu
  const sortMenu = createElement('div', '.sort-menu');
  const sortTitle = createElement('h3', '.sort-title');
  const sortList = createElement('ul', '.sort-list');
  sortTitle.textContent = 'Sort by';
  sortList.insertAdjacentHTML(
    'afterBegin',
    `
    <li class="sort-type" id="sortByName">
      <button class='sort-type-btn'>
        ${sortNameSVG}
        <span class="text">Alphabetically</span>
      </button>
    </li>
    <li class="sort-type" id="sortByCompleted">
      <button class='sort-type-btn'>
        ${sortCompletedSVG}
        <span class="text">Completed</span>
      </button>
    </li>
    <li class="sort-type" id="sortByMyDay">
      <button class='sort-type-btn'>
        ${daySVG}
        <span class="text">Added to My Day</span>
      </button>
    </li>
    <li class="sort-type" id="sortByBookmarked">
      <button class='sort-type-btn'>
        ${importantSVG}
        <span class="text">Bookmarked</span>
      </button>
    </li>
    <li class="sort-type" id="sortByDueDate">
      <button class='sort-type-btn'>
        ${calendarSVG}
        <span class="text">Due Date</span>
      </button>
    </li>
    <li class="sort-type" id="sortByCreationDate">
      <button class='sort-type-btn'>
        ${sortCreationDateSVG}
        <span class="text">Creation date</span>
      </button>
    </li>
    <li class="sort-type" id="sortByPriority">
      <button class='sort-type-btn'>
        ${prioritySVG}
        <span class="text">Priority</span>
      </button>
    </li>
  `,
  );

  sortMenu.append(sortTitle, sortList);
  tasksHeader.append(tasksTitleWrapper, sortButton, sortMenu);

  // Remove/add sort feature
  const toggleSort = (isPlanned = false) => {
    if (isPlanned) {
      sortButton.remove();
      sortMenu.remove();
    } else if (!tasksHeader.contains(sortButton)) {
      tasksHeader.append(sortButton, sortMenu);
    }
  };

  // Sort indicator
  const sortIndicator = createElement('div', '.sort-indicator');
  const sortIndicatorInner = createElement('div', '.sort-indicator-inner');
  const sortIndicatorText = createElement('span', '.sort-indicator-text');
  const sortIndicatorToggle = createElement('button', '.sort-indicator-toggle');
  const sortIndicatorRemove = createElement('button', '.sort-indicator-remove');
  sortIndicatorToggle.insertAdjacentHTML('beforeEnd', chevronSVG);
  sortIndicatorRemove.insertAdjacentHTML('beforeEnd', removeSVG);
  sortIndicatorInner.append(sortIndicatorText, sortIndicatorToggle, sortIndicatorRemove);
  sortIndicator.append(sortIndicatorInner);
  // Helper function to remove sortIndicator
  const removeSortIndicator = (isSwitchList) => {
    removeClass(sortIndicator, 'show-sort');

    if (isSwitchList) {
      sortIndicator.remove();

      return;
    }

    addClass(sortIndicator, 'hide-sort');

    const handleAnimation = () => {
      off(sortIndicator, 'animationend', handleAnimation);
      sortIndicator.remove();
    };
    on(sortIndicator, 'animationend', handleAnimation);
  };
  /**
   * 정렬 표시기 설정
   * @param {string} type 정렬 유형
   * @param {string} direction 정렬 방향
   * @param {boolean} isAnimated 애니메이션 여부
   */
  const setSortIndicator = (type, direction, isAnimated) => {
    if (type === 'none') {
      if (tasksHeader.contains(sortIndicator)) {
        removeSortIndicator(true);
      }

      return;
    }

    if (!tasksHeader.contains(sortIndicator)) {
      tasksHeader.append(sortIndicator);

      if (isAnimated) addClass(sortIndicator, 'show-sort');

      removeClass(sortIndicator, 'hide-sort');
    }

    sortIndicatorText.textContent = `Sorted by ${type}`;

    direction === 'desc'
      ? addClass(sortIndicatorToggle, 'desc')
      : removeClass(sortIndicatorToggle, 'desc');
  };

  // Details view for todo elements
  const detailsView = createElement('div', '.details-view');

  // Confirm Modal
  const modal = createElement('div', '#modal');
  addClass(modal, 'close');
  const modalTitle = createElement('h2');
  modalTitle.innerHTML = 'Are you sure?';
  const modalText = createElement('p');
  modalText.innerHTML = 'Are you sure to delete this item?';
  const modalOk = createElement('button', '.confirm-btn');
  modalOk.textContent = 'Ok';
  const modalCancel = createElement('button', '.cancel-btn');
  modalCancel.textContent = 'Cancel';
  const modalFooter = createElement('footer');
  modalFooter.append(modalOk, modalCancel);
  modal.append(modalTitle, modalText, modalFooter);
  // Modal backdrop & overlay
  const modalBackdrop = createElement('div', '.modal-backdrop');
  const overlay = createElement('div', '.overlay');
  document.body.append(modalBackdrop, overlay);

  // Complete sound
  const audioBlock = createElement('div', '#audioBlock');
  audioBlock.hidden = true;
  audioBlock.insertAdjacentHTML(
    'beforeend',
    `
      <audio id="completeSound"><source src="${completeSound}" type="audio/wav"></audio>
    `,
  );

  // Indicators
  /* Note indicator */
  const noteIndicatorFn = () => {
    const noteIndicator = createElement('span', '.note-indicator');
    const noteIndicatorLabel = createElement('span', '.note-indicator-label');
    noteIndicatorLabel.innerHTML = 'Note';
    noteIndicator.insertAdjacentHTML('beforeEnd', noteSVG);
    noteIndicator.append(noteIndicatorLabel);

    return noteIndicator;
  };

  /* Date indicator */
  const dateIndicatorFn = () => {
    const dateIndicator = createElement('span', '.date-indicator');
    const dateIndicatorLabel = createElement('span', '.date-indicator-label');
    dateIndicator.insertAdjacentHTML('beforeEnd', calendarSVG);
    dateIndicator.append(dateIndicatorLabel);

    return dateIndicator;
  };

  /* Note indicator */
  const subtaskIndicatorFn = () => {
    const subtaskIndicator = createElement('span', '.subtask-indicator');
    const subtaskIndicatorLabel = createElement('span', '.subtask-indicator-label');
    subtaskIndicator.insertAdjacentHTML('beforeEnd', checkMarkSVG);
    subtaskIndicator.append(subtaskIndicatorLabel);

    return subtaskIndicator;
  };

  /* Important indicator */
  const importantIndicatorFn = () => {
    const importantIndicator = createElement('span', '.important-indicator');
    importantIndicator.insertAdjacentHTML('beforeEnd', importantSVG);
    importantIndicator.querySelector('svg').dataset.tooltip = 'Bookmarked task';

    return importantIndicator;
  };

  /* "My Day" indicator */
  const myDayIndicatorFn = () => {
    const myDayIndicator = createElement('span', '.my-day-indicator');
    myDayIndicator.insertAdjacentHTML('beforeEnd', daySVG);
    myDayIndicator.querySelector('svg').dataset.tooltip = 'Task added to My Day';

    return myDayIndicator;
  };

  // Append elements
  newList.append(newListLabel, newListInput, newListSubmit);
  listsMenu.append(lists, newList);
  newTodo.append(newTodoInput, newTodoSubmit);
  tasksView.append(tasksHeader, todoList, emptyState, newTodo);

  root.append(header, listsMenu, tasksView, detailsView, modal, audioBlock);

  // Init tooltip
  tooltip(document);

  // Helper function - 'refreshTodoItemsPositions' helper
  const refreshTodoItemsPositionsHelper = (list, isTabClosed = false) => {
    // Disable all transitions
    disableTransition(list);
    const { children } = list;
    let fullHeight = 0;

    Array.from(children).forEach((child, index) => {
      const height = child.offsetHeight;

      const { marginBottom } = getComputedStyle(child);

      if (index === 0) {
        child.style.transform = '';
      } else {
        child.style.transform = `translateY(${fullHeight}px)`;
      }

      fullHeight += height + parseInt(marginBottom, 10);
    });

    // The number 8 is added to give room to items to grow/shrink and not be hidden
    if (!isTabClosed) list.style.height = `${fullHeight + 8}px`;

    if (todoList.scrollHeight > todoList.offsetHeight) {
      addClass(todoList, 'grow-items');
    } else if (todoList.scrollHeight === todoList.offsetHeight) {
      removeClass(todoList, 'grow-items');
    }
  };
  // Helper function - refresh todos transition & list's height
  const refreshTodoItemsPositions = () => {
    const selectedProject = getElement('.list.selected');

    if (selectedProject && selectedProject.dataset.index === '4') {
      todoList.style.height = '';
      const listsTime = todoList.querySelectorAll('ul.todo-list-time');
      Array.from(listsTime).forEach((list) => {
        const isTabClosed = list.previousElementSibling
          .querySelector('button')
          .classList.contains('close');

        if (list.children.length > 0) {
          refreshTodoItemsPositionsHelper(list, isTabClosed);
        }
      });
    } else {
      refreshTodoItemsPositionsHelper(todoList);
    }
  };

  // Events
  const handleOverlayClick = () => {
    menuButton.dataset.state = 'closed';
    addClass(listsMenu, 'mobile');
    removeClass(overlay, 'fade-in');
    off(overlay, 'click', handleOverlayClick);
  };

  // Helper function - reposition todos on menu toggle
  const repositionTodosOnMenuToggleHelper = (list) => {
    if (document.body.offsetWidth >= 770) {
      Array.from(list.children).forEach((child) => {
        child.style.height = `${child.offsetHeight}px`;

        const indicators = child.querySelector('.indicators');
        if (indicators && menuButton.dataset.state === 'open') {
          indicators.style.overflow = 'hidden';
          indicators.style.height = `${indicators.offsetHeight}px`;
        } else if (indicators) {
          indicators.style.width = `${indicators.offsetWidth + 1}px`;
        }
      });

      const handleTransition = () => {
        Array.from(list.children).forEach((child) => {
          child.style.height = '';

          const indicators = child.querySelector('.indicators');
          indicators.style.overflow = '';
          indicators.style.height = '';
          indicators.style.width = '';
        });
        refreshTodoItemsPositions();
        off(listsMenu, 'transitionend', handleTransition);
      };
      on(listsMenu, 'transitionend', handleTransition);
    }
  };

  // Helper function - reposition todos on menu toggle
  const repositionTodosOnMenuToggle = () => {
    const selectedProject = getElement('.list.selected');

    if (selectedProject && selectedProject.dataset.index === '4') {
      const listsTime = todoList.querySelectorAll('ul.todo-list-time');
      Array.from(listsTime).forEach((list) => {
        if (list.children.length > 0) {
          repositionTodosOnMenuToggleHelper(list);
        }
      });
    } else {
      repositionTodosOnMenuToggleHelper(todoList);
    }
  };

  const handleClick = () => {
    if (menuButton.dataset.state === 'open') {
      menuButton.dataset.state = 'closed';
      addClass(listsMenu, 'mobile');

      if (document.body.offsetWidth < 770) {
        removeClass(overlay, 'fade-in');
        on(overlay, 'click', handleOverlayClick);
      }
    } else {
      menuButton.dataset.state = 'open';
      removeClass(listsMenu, 'mobile');

      if (document.body.offsetWidth < 770) {
        addClass(overlay, 'fade-in');
        on(overlay, 'click', handleOverlayClick);
      }
    }

    // Reposition todos on 'menu' open/close && on desktop mode
    repositionTodosOnMenuToggle();
  };

  // Open lists sidebar if + icon is clicked to add a new list
  const handleNewListClick = () => {
    if (menuButton.dataset.state === 'closed') {
      menuButton.dataset.state = 'open';
      removeClass(listsMenu, 'mobile');

      if (document.body.offsetWidth < 770) {
        addClass(overlay, 'fade-in');
        on(overlay, 'click', handleOverlayClick);
      }

      // Reposition todos on 'newList' open && on desktop mode
      repositionTodosOnMenuToggle();
    }
  };

  // Close list sidebar menu on mobile flip if width screen size is smaller
  let screeSize = document.body.offsetWidth;
  const handleResize = () => {
    if (document.body.offsetWidth < 920 && document.body.offsetWidth < screeSize) {
      menuButton.dataset.state = 'closed';
      addClass(listsMenu, 'mobile');
      removeClass(overlay, 'fade-in');
    }

    if (document.body.offsetWidth >= 770) {
      removeClass(overlay, 'fade-in');
    }

    screeSize = document.body.offsetWidth;
  };

  const handleSortClick = () => {
    toggleClass(sortMenu, 'open');
  };

  const handleBodyClick = (e) => {
    const { target } = e;

    if (
      !sortMenu.classList.contains('open') ||
      target.closest('.sort-menu') ||
      target.closest('.sort-btn')
    ) {
      return;
    }

    removeClass(sortMenu, 'open');
  };

  on(menuButton, 'click', handleClick);
  on(newListLabel, 'click', handleNewListClick);
  on(window, 'resize', handleResize);
  on(document.body, 'click', handleBodyClick);
  on(sortButton, 'click', handleSortClick);

  return {
    root,
    tasksView,
    lists,
    todoList,
    newTodo,
    newTodoInput,
    newList,
    newListInput,
    tasksHeader,
    toggleSort,
    tasksTitleWrapper,
    tasksTitle,
    tasksTitleInput,
    detailsView,
    newListSubmit,
    emptyState,
    modal,
    modalBackdrop,
    modalOk,
    modalCancel,
    modalText,
    noteIndicatorFn,
    dateIndicatorFn,
    subtaskIndicatorFn,
    importantIndicatorFn,
    myDayIndicatorFn,
    menuButton,
    overlay,
    refreshTodoItemsPositions,
    sortList,
    sortIndicator,
    setSortIndicator,
    removeSortIndicator,
    searchInput,
    searchReset,
  };
};

export default initializeDOMElements;
