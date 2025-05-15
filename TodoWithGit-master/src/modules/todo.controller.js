/**
 * 할 일 애플리케이션의 컨트롤러(Controller) 모듈
 * 모델과 뷰 사이의 상호작용을 관리하고 사용자 입력을 처리
 */
import todoApp from './todo.model';
import { todoView } from './todo.view';
import draggable from './features/draggable/draggable';
import todoLocalStorage from './config/localStorage';

const todoController = (() => {
  /**
   * 헬퍼 함수: 모든 프로젝트 표시
   * @param {Object} view todoView 팩토리로 생성된 뷰 객체
   */
  const displayLists = (view) => {
    // 로컬 스토리지 초기화
    if (localStorage.getItem('todoApp')) todoLocalStorage.initApp(todoApp);

    const projects = todoApp.getProjects();
    const { lists } = view.elements;
    view.empty(lists);

    // 기본 프로젝트 항목
    const defaultItems = [];

    if (!todoApp.getSelected()) todoApp.setSelected(todoApp.getLastSelected());

    const selectedID = todoApp.getSelectedProject().id;

    // 새로운 날인지 확인
    let newDay = false;

    projects.forEach((project, index) => {
      const { id } = project;
      const name = project.getName();
      const items = project.getItems();
      const isSelected = index === todoApp.getSelected();

      view.displayList(id, name, items, isSelected);

      // 새로운 날이면 'My Day' 프로젝트의 항목들 초기화
      const currentDate = new Date(view.getConvertedCurrentDate());
      const MSDay = 1000 * 60 * 60 * 24; // 하루를 밀리초로 변환
      const myDayProject = todoApp.getProjectByID(2);

      if (currentDate.getTime() - myDayProject.date >= MSDay) {
        myDayProject.date = currentDate.getTime();
        newDay = true;
      }

      if (newDay) {
        items.forEach((item) => {
          if (item.isMyDay) item.isMyDay = false;
        });
      }

      switch (selectedID) {
        // 모든 작업 표시
        case 1:
          defaultItems.push(...items);
          break;

        // 내 하루 작업 표시
        case 2:
          items.forEach((item) => {
            if (item.isMyDay) defaultItems.push(item);
          });
          break;

        // 중요 표시 작업 표시
        case 3:
          items.forEach((item) => {
            if (item.isImportant) defaultItems.push(item);
          });
          break;

        // 계획된 작업 표시
        case 4:
          items.forEach((item) => {
            if (item.date) defaultItems.push(item);
          });
          break;

        default:
          // 일반 프로젝트인 경우 정렬된 항목들 표시
          if (isSelected) {
            view.displayTodos(project.getSortedItems());
          }
          break;
      }
    });

    // 새로운 날인 경우 "My Day" 할 일 개수 초기화
    if (newDay) view.resetMyDayCount();

    // 'Planned' 프로젝트가 선택된 경우 날짜별로 정렬하여 표시
    if (selectedID === 4) {
      defaultItems.sort((todoA, todoB) => new Date(todoA.date) - new Date(todoB.date));
      view.displayTodos(defaultItems);

      // 정렬 버튼 제거
      view.elements.toggleSort(true);

      // 탭 상태 초기화
      view.initPlannedDateTabs(todoApp.getProjectByID(4));
    }

    // 기본 프로젝트가 선택된 경우 정렬된 버전의 할 일 항목 표시
    if ([1, 2, 3].includes(selectedID)) {
      view.displayTodos(todoApp.getProjectByID(selectedID).getSortedItems(defaultItems));
    }

    // 정렬 표시기 설정
    const currentProject = todoApp.getSelectedProject();
    const selectedSortType = currentProject.getSelectedSortType();
    view.elements.setSortIndicator(
      selectedSortType,
      currentProject.getSelectedDirection(selectedSortType),
    );
  };

  // todoView 팩토리 인스턴스화
  let view = null;

  /**
   * 헬퍼 함수 - 정렬을 위한 현재 할 일 목록 새로고침
   * @param {Object} currentProject 현재 프로젝트
   * @param {HTMLElement} selectedTodo 선택된 할 일 항목 (선택사항)
   */
  const refreshCurrentTodoList = (currentProject, selectedTodo = null) => {
    let projectID = null;

    if (currentProject) projectID = currentProject.id;
    // 'Planned' 프로젝트에서는 정렬을 사용하지 않음
    if (projectID === 4) return;

    const items = [];

    switch (projectID) {
      // 모든 작업 케이스
      case 1:
        todoApp.getProjects().forEach((project) => items.push(...project.getItems()));
        view.refreshTodos(currentProject.getSortedItems(items), selectedTodo);
        break;

      // 내 하루 케이스
      case 2:
        todoApp.getProjects().forEach((project) => {
          project.getItems().forEach((item) => {
            if (item.isMyDay) items.push(item);
          });
        });
        view.refreshTodos(currentProject.getSortedItems(items), selectedTodo);
        break;

      // 중요 표시 케이스
      case 3:
        todoApp.getProjects().forEach((project) => {
          project.getItems().forEach((item) => {
            if (item.isImportant) items.push(item);
          });
        });
        view.refreshTodos(currentProject.getSortedItems(items), selectedTodo);
        break;

      default:
        // 일반 프로젝트 또는 프로젝트가 없는 경우
        if (currentProject) view.refreshTodos(currentProject.getSortedItems(), selectedTodo);
        else view.refreshTodos([], selectedTodo);
        break;
    }
  };

  /**
   * 할 일 추가 이벤트 핸들러
   * @param {Event} e 이벤트 객체
   */
  const handleAddTodo = (e) => {
    e.preventDefault();
    const todoTitle = view.elements.newTodoInput.value;

    // 제목이 비어있으면 추가하지 않음
    if (!todoTitle) return;

    // 입력 필드 초기화
    view.elements.newTodoInput.value = '';
    const selectedProject = todoApp.getSelectedProject();
    let todo = null;

    // 기본 프로젝트인 경우 "Tasks" 목록에 추가
    if ([1, 2, 3, 4].includes(selectedProject.id)) {
      const defaultProject = todoApp.getProjectByID(5);
      defaultProject.addTodo(todoTitle);
      const todoItems = defaultProject.getItems();
      todo = todoItems[todoItems.length - 1];

      // 선택된 프로젝트에 따라 특별한 속성 설정
      switch (selectedProject.id) {
        case 2:
          {
            // "내 하루"로 표시
            todo.isMyDay = true;
            // "내 하루" 프로젝트의 할 일 개수 업데이트
            const myDayCount = document.querySelector('.list[data-index="2"] .todo-count');
            view.updateTodoCount(myDayCount, true);
          }
          break;

        case 3:
          {
            // "중요"로 표시
            todo.isImportant = true;
            // "중요" 프로젝트의 할 일 개수 업데이트
            const importantCount = document.querySelector('.list[data-index="3"] .todo-count');
            view.updateTodoCount(importantCount, true);
          }
          break;

        case 4:
          {
            // 오늘 날짜로 설정
            todo.date = view.getConvertedCurrentDate();
            // "계획됨" 프로젝트의 할 일 개수 업데이트
            const plannedCount = document.querySelector('.list[data-index="4"] .todo-count');
            view.updateTodoCount(plannedCount, true);
          }
          break;

        default:
          break;
      }
    } else {
      // 선택된 프로젝트에 직접 추가
      selectedProject.addTodo(todoTitle);
      const todoItems = selectedProject.getItems();
      todo = todoItems[todoItems.length - 1];
    }

    // 뷰에 정렬 상태 주입
    const sortType = selectedProject.getSelectedSortType();
    const sort = {
      type: sortType,
      refreshSort: refreshCurrentTodoList,
      currentProject: selectedProject,
    };

    // 뷰에 할 일 항목 추가
    view.addTodo(todo, true, sort);

    // 로컬 스토리지 업데이트
    todoLocalStorage.populateStorage(todoApp);
  };

  /**
   * 할 일 삭제 이벤트 핸들러
   * 할 일 항목의 삭제 버튼 클릭 시 처리
   * @param {Event} e 이벤트 객체
   */
  const handleDeleteTodo = (e) => {
    const { target } = e;

    // 삭제 버튼이 아니면 함수 종료
    if (!target.closest('.delete-btn')) return;

    // 실제로 할 일을 삭제하는 내부 함수
    const removeTodo = () => {
      const todoID = Number(target.closest('.todo-item').dataset.index);
      const projectID = Number(target.closest('.todo-item').dataset.projectIndex);
      const project = todoApp.getProjectByID(projectID);

      // 날짜/중요/내 하루 속성이 설정된 경우 해당 프로젝트의 할 일 개수 업데이트
      const todo = project.getItemByID(todoID);
      const plannedCount = document.querySelector('.list[data-index="4"] .todo-count');
      const importantCount = document.querySelector('.list[data-index="3"] .todo-count');
      const myDayCount = document.querySelector('.list[data-index="2"] .todo-count');

      if (todo.date && !todo.isComplete) {
        view.updateTodoCount(plannedCount, false);
      }

      if (todo.isImportant && !todo.isComplete) {
        view.updateTodoCount(importantCount, false);
      }

      if (todo.isMyDay && !todo.isComplete) {
        view.updateTodoCount(myDayCount, false);
      }

      // 할 일 항목 제거
      project.removeTodo(todoID);
      view.removeTodo(todoID, projectID);

      // 로컬 스토리지 업데이트
      todoLocalStorage.populateStorage(todoApp);
    };

    // 완료되지 않은 할 일 제거 시 확인 모달 표시
    if (!target.closest('.completed')) {
      const name = target.closest('.todo-item').querySelector('.todo-title').textContent;
      const msg = `
        You didn't complete this task!<br>
        Delete <span class="name">"${name}"</span> anyway?
      `;
      view.confirmRemoval(removeTodo, msg);

      return;
    }

    // 완료된 할 일은 확인 없이 바로 제거
    removeTodo();
  };

  /**
   * 할 일 완료 상태 토글 이벤트 핸들러
   * 체크박스 클릭 시 할 일 항목의 완료 상태 변경
   * @param {Event} e 이벤트 객체
   */
  const handleToggleTodo = (e) => {
    const { target } = e;
    const todoID = Number(target.closest('.todo-item').dataset.index);
    const projectID = Number(target.closest('.todo-item').dataset.projectIndex);

    // 해당 항목의 체크박스가 아니면 함수 종료
    if (target.id !== `todo-checkbox${todoID}${projectID}`) return;

    const project = todoApp.getProjectByID(projectID);
    project.toggleTodo(todoID);
    view.toggleTodo(project.getItemByID(todoID).isComplete, target.id, projectID);

    // 날짜/중요/내 하루 속성이 설정된 경우 해당 프로젝트의 할 일 개수 업데이트
    const todo = project.getItemByID(todoID);
    const plannedCount = document.querySelector('.list[data-index="4"] .todo-count');
    const importantCount = document.querySelector('.list[data-index="3"] .todo-count');
    const myDayCount = document.querySelector('.list[data-index="2"] .todo-count');

    if (todo.date) view.updateTodoCount(plannedCount, !todo.isComplete);

    if (todo.isImportant) view.updateTodoCount(importantCount, !todo.isComplete);

    if (todo.isMyDay) view.updateTodoCount(myDayCount, !todo.isComplete);

    // 프로젝트가 선택된 상태면 정렬 새로고침 (검색 모드가 아닐 때)
    if (todoApp.getSelectedProject()) refreshCurrentTodoList(todoApp.getSelectedProject());

    // 로컬 스토리지 업데이트
    todoLocalStorage.populateStorage(todoApp);
  };

  /**
   * 새 프로젝트 추가 이벤트 핸들러
   * 프로젝트 추가 폼 제출 시 처리
   * @param {Event} e 이벤트 객체
   */
  const handleAddList = (e) => {
    e.preventDefault();
    const listTitle = view.elements.newListInput.value;

    // 제목이 비어있으면 함수 종료
    if (!listTitle) return;

    // 입력 필드 초기화
    view.elements.newListInput.value = '';
    
    // 새 프로젝트 추가
    todoApp.addProject(listTitle);
    const index = todoApp.getProjects().length - 1;
    todoApp.setSelected(index);
    const project = todoApp.getProjects()[index];
    const { id } = project;
    const name = project.getName();
    const items = project.getItems();
    
    // 뷰에 새 프로젝트 표시
    view.displayList(id, name, items, true);

    // 검색 모드였는지 확인 후 리셋
    const wasSearchMode = !view.elements.tasksView.dataset.projectIndex;
    if (wasSearchMode) {
      view.elements.searchInput.value = '';
      view.hideElement(view.elements.searchReset);
      // 할 일 추가 폼 다시 표시
      view.elements.tasksView.append(view.elements.newTodo);
    }

    // 프로젝트의 할 일 항목 표시
    view.displayTodos(items);

    // 제출 후 "추가" 버튼 숨기기
    view.hideElement(view.elements.newListSubmit);

    // 정렬 버튼 추가
    view.elements.toggleSort();

    // 기본적으로 정렬 표시기를 'none'으로 설정
    view.elements.setSortIndicator('none');

    // 프로젝트 목록의 맨 아래로 스크롤
    const { lists } = view.elements;
    lists.scrollTop = lists.scrollHeight;

    // 로컬 스토리지 업데이트
    todoLocalStorage.populateStorage(todoApp);
  };

  /**
   * 프로젝트 전환 이벤트 핸들러
   * 프로젝트 목록에서 다른 프로젝트 클릭 또는 포커스 이동 시 처리
   * @param {Event} e 이벤트 객체
   */
  const handleSwitchList = (e) => {
    let projectIndex = null;
    let list = null;

    if (e.type === 'click') {
      // 클릭 이벤트 처리
      const { target } = e;
      list = target.closest('.list');
      const lists = target.closest('.lists').querySelectorAll('.list');
      const selectedList = lists[todoApp.getSelected()];

      // 이미 선택된 항목이나 삭제 버튼 클릭은 무시
      if (list === selectedList || !list || target.closest('.delete-btn')) {
        return;
      }

      // 클릭된 프로젝트의 인덱스 찾기
      Array.from(lists).some((li, index) => {
        projectIndex = index;
        return li === list;
      });

      if (selectedList) selectedList.classList.remove('selected');

      // 검색 모드였는지 확인 후 리셋
      const wasSearchMode = !view.elements.tasksView.dataset.projectIndex;
      if (wasSearchMode) {
        view.elements.searchInput.value = '';
        view.hideElement(view.elements.searchReset);
      }
    } else if (e.type === 'blur') {
      // 포커스 이동 이벤트 처리
      projectIndex = todoApp.getLastSelected();
      list = document.querySelector('.lists').children[projectIndex];
    }

    // 선택된 프로젝트 설정 및 UI 업데이트
    todoApp.setSelected(projectIndex);
    list.classList.add('selected');
    // 할 일 추가 폼 다시 표시
    view.elements.tasksView.append(view.elements.newTodo);

    // 새로운 날인지 확인하여 "My Day" 프로젝트 항목 초기화
    const currentDate = new Date(view.getConvertedCurrentDate());
    const MSDay = 1000 * 60 * 60 * 24; // 하루를 밀리초로 변환
    const myDayProject = todoApp.getProjectByID(2);
    let newDay = false;

    if (currentDate.getTime() - myDayProject.date >= MSDay) {
      myDayProject.date = currentDate.getTime();
      newDay = true;
    }

    if (newDay) {
      // 새 날이면 모든 "내 하루" 표시 항목 초기화
      todoApp.getProjects().forEach((project) => {
        project.getItems().forEach((item) => {
          if (item.isMyDay) item.isMyDay = false;
        });
      });

      view.resetMyDayCount();
    }

    // 'Planned' 프로젝트인 경우 정렬 버튼 제거, 그 외에는 추가
    if (list.dataset.index === '4') view.elements.toggleSort(true);
    else view.elements.toggleSort();

    // 정렬 표시기 설정
    const currentProject = todoApp.getProjects()[projectIndex];
    const selectedSortType = currentProject.getSelectedSortType();
    view.elements.setSortIndicator(
      selectedSortType,
      currentProject.getSelectedDirection(selectedSortType),
    );

    // 프로젝트 유형에 따른 할 일 항목 표시
    const items = [];

    switch (list.dataset.index) {
      // "All tasks" 케이스 - 모든 프로젝트의 할 일 항목 표시
      case '1':
        todoApp.getProjects().forEach((project) => items.push(...project.getItems()));
        view.displayTodos(todoApp.getProjectByID(1).getSortedItems(items));
        break;

      // "My Day" 케이스 - 내 하루 속성이 있는 항목만 표시
      case '2':
        todoApp.getProjects().forEach((project) => {
          project.getItems().forEach((item) => {
            if (item.isMyDay) items.push(item);
          });
        });
        view.displayTodos(todoApp.getProjectByID(2).getSortedItems(items));
        break;

      // "Important" 케이스 - 중요 표시된 항목만 표시
      case '3':
        todoApp.getProjects().forEach((project) => {
          project.getItems().forEach((item) => {
            if (item.isImportant) items.push(item);
          });
        });
        view.displayTodos(todoApp.getProjectByID(3).getSortedItems(items));
        break;

      // "Planned" 케이스 - 날짜가 설정된 항목만 표시
      case '4':
        todoApp.getProjects().forEach((project) => {
          project.getItems().forEach((item) => {
            if (item.date) items.push(item);
          });
        });
        items.sort((todoA, todoB) => new Date(todoA.date) - new Date(todoB.date));
        view.displayTodos(items);
        view.initPlannedDateTabs(todoApp.getProjectByID(4));
        break;

      // 일반 프로젝트 케이스
      default:
        view.displayTodos(todoApp.getProjects()[projectIndex].getSortedItems());
        break;
    }

    // 로컬 스토리지 업데이트
    todoLocalStorage.populateStorage(todoApp);
  };

  /**
   * 프로젝트 삭제 이벤트 핸들러
   * 프로젝트의 삭제 버튼 클릭 시 처리
   * @param {Event} e 이벤트 객체
   */
  const handleDeleteList = (e) => {
    const { target } = e;

    // 프로젝트 항목이 아니면 함수 종료
    if (!target.closest('.list')) return;

    const lists = view.elements.lists.children;
    const listID = Number(target.closest('.list').dataset.index);
    // 기본 프로젝트는 삭제 방지
    const defaultIDs = [1, 2, 3, 4, 5];

    // 삭제 버튼이 아니거나 기본 프로젝트이면 함수 종료
    if (!target.closest('.delete-btn') || defaultIDs.includes(defaultIDs)) {
      return;
    }

    // 실제로 프로젝트를 삭제하는 내부 함수
    const removeList = () => {
      todoApp.removeProject(listID);
      // 선택된 프로젝트의 인덱스 가져오기
      const listIndex = Array.from(lists).indexOf(view.elements.lists.querySelector('.selected'));

      // 선택된 프로젝트를 삭제할 때 선택 이동
      if (target.closest('.selected')) {
        if (listIndex !== -1) {
          if (listIndex > 0) {
            // 이전 프로젝트로 선택 이동
            todoApp.setSelected(listIndex - 1);
            lists[listIndex - 1].classList.add('selected');
          } else if (listIndex === 0) {
            // 첫 번째 프로젝트가 삭제되면 다음 프로젝트로 선택 이동
            todoApp.setSelected(0);
            lists[1].classList.add('selected');
          }

          // 할 일 뷰 업데이트
          view.displayTodos(todoApp.getSelectedProject().getItems());
        }
      } else if (listIndex === -1) {
        // 검색 모드인 경우 처리
        const listToBeSelected = target.closest('.list').previousElementSibling;
        const NewListIndex = Array.from(lists).indexOf(listToBeSelected);
        todoApp.setSelected(NewListIndex);
        lists[NewListIndex].classList.add('selected');

        // 할 일 뷰 업데이트
        view.displayTodos(todoApp.getSelectedProject().getItems());

        // 검색 입력 초기화
        view.elements.searchInput.value = '';
        view.hideElement(view.elements.searchReset);
        // 할 일 추가 폼 다시 표시
        view.elements.tasksView.append(view.elements.newTodo);
      }

      // 프로젝트 제거
      view.removeProject(listID);
      // 삭제 후 새로 선택된 프로젝트의 인덱스 가져오기
      const listIndexUpdate = Array.from(lists).indexOf(
        view.elements.lists.querySelector('.selected'),
      );

      // 인덱스 값이 변경됐으면 모델 업데이트
      if (listIndex !== listIndexUpdate) todoApp.setSelected(listIndexUpdate);

      // 로컬 스토리지 업데이트
      todoLocalStorage.populateStorage(todoApp);
    };

    // 프로젝트에 완료되지 않은 할 일이 있는 경우 확인 모달 표시
    const todoCount = Number(target.closest('.list').querySelector('.todo-count').textContent);
    const isAllTasksComplete = !todoApp
      .getProjectByID(listID)
      .getItems()
      .some((todo) => !todo.isComplete);

    if (todoCount > 0 && !isAllTasksComplete) {
      const name = target.closest('.list').querySelector('.project-name').textContent;
      const msg = `
        This list still contains some tasks to do!<br>
        Delete <span class="name">"${name}"</span> anyway?
      `;
      view.confirmRemoval(removeList, msg);
      return;
    }

    // 모든 할 일이 완료되었거나 없는 경우 확인 없이 바로 제거
    removeList();
  };

  /**
   * 프로젝트 제목 편집 이벤트 핸들러
   * 프로젝트 이름 클릭 시 편집 모드로 전환
   * @param {Event} e 이벤트 객체
   */
  const handleEditTasksTitle = (e) => {
    const { target } = e;
    const selectedProject = view.elements.lists.querySelector('li.selected');

    // 기본 프로젝트이거나 검색 모드인 경우 편집 불가
    if (
      (selectedProject && selectedProject.classList.contains('pinned')) ||
      view.elements.tasksView.classList.contains('pinned')
    ) {
      return;
    }

    // 프로젝트명 업데이트 함수
    const updateProject = (value) => {
      todoApp.getSelectedProject().setName(value);
      selectedProject.querySelector('.project-name').textContent = value;

      // 로컬 스토리지 업데이트
      todoLocalStorage.populateStorage(todoApp);
    };

    // 편집 모드 전환
    const args = [target, view.elements.tasksTitleInput, updateProject];
    view.toggleEditMode(...args);
  };

  /**
   * 할 일 항목 선택 이벤트 핸들러
   * 할 일 항목 클릭 시 상세 정보 표시 또는 숨김
   * @param {Event} e 이벤트 객체
   */
  const handleSwitchTodo = (e) => {
    const { target } = e;
    const selectedTodo = document.querySelector('.todo-list .selected');
    const todoItem = target.closest('.todo-item');

    // 할 일 항목이나 제목 블록이 아니면 함수 종료
    if (
      (target.tagName !== 'LI' && !target.closest('.title-block')) ||
      target.classList.contains('list-header')
    ) {
      return;
    }

    // 이미 선택된 항목을 다시 클릭하면 상세 정보 패널 숨김
    if (todoItem === selectedTodo) {
      view.resetDetails();
      todoItem.classList.remove('selected');
      view.elements.detailsView.classList.remove('show');

      // 상세 정보 패널 숨길 때 할 일 항목 위치 조정
      view.refreshTodoItemsPositions();

      return;
    }

    // 선택된 할 일 항목의 정보 가져오기
    const id = Number(target.closest('.todo-item').dataset.index);
    const projectID = Number(target.closest('.todo-item').dataset.projectIndex);
    const todo = todoApp.getProjectByID(projectID).getItemByID(id);

    // 로컬 스토리지 업데이트 콜백
    const saveData = () => todoLocalStorage.populateStorage(todoApp);

    // 검색 모드인지 확인하여 정렬 시스템 활성화/비활성화
    const currentProject = todoApp.getSelectedProject();
    if (currentProject) {
      // 정렬 상태를 뷰에 주입
      const sortType = currentProject.getSelectedSortType;
      const sort = {
        type: sortType,
        refreshSort: refreshCurrentTodoList,
      };
      view.displayDetails(todo, currentProject, sort, saveData);
    } else {
      // 검색 모드에서는 정렬을 사용하지 않음
      const sortType = () => 'none';
      const sort = {
        type: sortType,
        refreshSort: refreshCurrentTodoList,
      };
      view.displayDetails(todo, currentProject, sort, saveData);
    }

    // 상세 정보 패널 표시 시 할 일 항목 위치 조정
    view.refreshTodoItemsPositions();
  };

  /**
   * 정렬 목록 이벤트 핸들러
   * 정렬 메뉴에서 정렬 유형 선택 시 처리
   * @param {Event} e 이벤트 객체
   */
  const handleSortList = (e) => {
    const { target } = e;
    const sortType = target.closest('.sort-type');

    // 정렬 유형 항목이 아니면 함수 종료
    if (!sortType) return;

    // 정렬 메뉴와 현재 프로젝트 정보 가져오기
    const sortMenu = target.closest('.sort-menu');
    const projectIndex = todoApp.getSelected();
    const currentProject = todoApp.getProjects()[projectIndex];
    const selectedSort = currentProject.getSelectedSortType();
    let isSelected = false;

    // 클릭된 정렬 유형에 따른 처리
    switch (sortType.id) {
      case 'sortByName':
        if (selectedSort === 'Alphabetically') isSelected = true;
        else currentProject.setSelectedSortType('Alphabetically');
        break;

      case 'sortByCompleted':
        if (selectedSort === 'Completed') isSelected = true;
        else currentProject.setSelectedSortType('Completed');
        break;

      case 'sortByMyDay':
        if (selectedSort === 'Added to My Day') isSelected = true;
        else currentProject.setSelectedSortType('Added to My Day');
        break;

      case 'sortByBookmarked':
        if (selectedSort === 'Bookmarked') isSelected = true;
        else currentProject.setSelectedSortType('Bookmarked');
        break;

      case 'sortByDueDate':
        if (selectedSort === 'Due date') isSelected = true;
        else currentProject.setSelectedSortType('Due date');
        break;

      case 'sortByCreationDate':
        if (selectedSort === 'Creation date') isSelected = true;
        else currentProject.setSelectedSortType('Creation date');
        break;

      case 'sortByPriority':
        if (selectedSort === 'Priority') isSelected = true;
        else currentProject.setSelectedSortType('Priority');
        break;

      default:
        break;
    }

    // 이미 선택된 유형이 아닌 경우에만 목록 새로고침
    if (!isSelected) {
      refreshCurrentTodoList(currentProject);
    }

    // 컨텍스트 정렬 메뉴 닫기
    sortMenu.classList.remove('open');

    // 정렬 표시기 설정
    const selectedSortType = currentProject.getSelectedSortType();
    view.elements.setSortIndicator(
      selectedSortType,
      currentProject.getSelectedDirection(selectedSortType),
      true,
    );

    // 로컬 스토리지 업데이트
    todoLocalStorage.populateStorage(todoApp);
  };

  /**
   * 정렬 표시기 이벤트 핸들러
   * 정렬 방향 토글 또는 정렬 제거 버튼 클릭 시 처리
   * @param {Event} e 이벤트 객체
   */
  const handleSortIndicator = (e) => {
    const { target } = e;
    const sortIndicatorToggle = target.closest('.sort-indicator-toggle');
    const sortIndicatorRemove = target.closest('.sort-indicator-remove');

    // 정렬 토글이나 제거 버튼이 아니면 함수 종료
    if (!sortIndicatorRemove && !sortIndicatorToggle) return;

    const projectIndex = todoApp.getSelected();
    const currentProject = todoApp.getProjects()[projectIndex];
    const items = [];

    if (sortIndicatorToggle) {
      // 정렬 방향 토글 처리
      const selectedSortType = currentProject.getSelectedSortType();
      currentProject.getSelectedDirection(selectedSortType) === 'asc'
        ? currentProject.setSelectedDirection('desc')
        : currentProject.setSelectedDirection('asc');

      // 목록 새로고침
      refreshCurrentTodoList(currentProject);

      // 방향 토글 버튼 업데이트
      sortIndicatorToggle.classList.toggle('desc');
    } else {
      // 정렬 제거 처리
      currentProject.setSelectedSortType('none');

      // 프로젝트 유형에 따라 항목 처리
      switch (currentProject.id) {
        // "All tasks" 케이스
        case 1:
          todoApp.getProjects().forEach((project) => items.push(...project.getItems()));
          view.refreshTodos(currentProject.getSortedItems(items));
          break;

        // "My Day" 케이스
        case 2:
          todoApp.getProjects().forEach((project) => {
            project.getItems().forEach((item) => {
              if (item.isMyDay) items.push(item);
            });
          });
          view.refreshTodos(currentProject.getSortedItems(items));
          break;

        // "Important" 케이스
        case 3:
          todoApp.getProjects().forEach((project) => {
            project.getItems().forEach((item) => {
              if (item.isImportant) items.push(item);
            });
          });
          view.refreshTodos(currentProject.getSortedItems(items));
          break;

        // 일반 프로젝트 케이스
        default:
          view.refreshTodos(currentProject.getItems());
          break;
      }

      // 정렬 표시기 제거
      view.elements.removeSortIndicator();
    }

    // 로컬 스토리지 업데이트
    todoLocalStorage.populateStorage(todoApp);
  };

  /**
   * 'Planned' 프로젝트의 날짜 그룹 클릭 이벤트 핸들러
   * 날짜 그룹 헤더 클릭 시 그룹 열기/닫기 토글
   * @param {Event} e 이벤트 객체
   */
  const handlePlannedClick = (e) => {
    const { target } = e;

    // 날짜 그룹 헤더가 아니면 함수 종료
    if (!target.closest('.list-header')) return;

    const listHeader = target.closest('.list-header');
    const button = listHeader.querySelector('button');
    const todoListTime = view.getElement(`.todo-list-time[data-time="${listHeader.id}"]`);

    // 모든 트랜지션 활성화
    view.enableTransition(todoListTime);

    // 'Planned' 프로젝트와 헤더 인덱스 가져오기
    const plannedProject = todoApp.getProjectByID(4);
    const headerIndex = Array.from(view.elements.todoList.querySelectorAll('.list-header')).indexOf(
      listHeader,
    );

    if (button.classList.contains('close')) {
      // 닫힌 상태면 열기
      view.removeClass(button, 'close');
      todoListTime.style.height = `${todoListTime.scrollHeight + 2}px`;
      plannedProject.tabStates[headerIndex] = 'open';
    } else {
      // 열린 상태면 닫기
      view.addClass(button, 'close');
      todoListTime.style.height = 0;
      plannedProject.tabStates[headerIndex] = 'closed';
    }

    // 항목 너비 문제 수정
    const { todoList } = view.elements;
    todoList.querySelectorAll('.todo-item').forEach((item) => {
      item.style.width = `${item.offsetWidth}px`;
    });

    // 트랜지션 완료 후 처리
    const handleTransition = () => {
      // 스크롤바 표시 관련 처리
      if (todoList.scrollHeight > todoList.offsetHeight) {
        view.addClass(todoList, 'grow-items');
      } else if (todoList.scrollHeight === todoList.offsetHeight) {
        view.removeClass(todoList, 'grow-items');
      }

      // 너비 고정 해제
      todoList.querySelectorAll('.todo-item').forEach((item) => {
        item.style.width = '';
      });
      view.off(todoListTime, 'transitionend', handleTransition);
    };
    view.on(todoListTime, 'transitionend', handleTransition);

    // 로컬 스토리지 업데이트
    todoLocalStorage.populateStorage(todoApp);
  };

  /**
   * 헬퍼 함수 - 항목을 이름 기준으로 정렬
   * @param {Array} list 정렬할 항목 배열
   */
  const sortByName = (list) => {
    list.sort((itemA, itemB) => {
      const nameA = itemA.title.toUpperCase();
      const nameB = itemB.title.toUpperCase();

      if (nameA < nameB) return 1;
      if (nameA > nameB) return -1;
      return 0;
    });
  };

  /**
   * 검색 입력 이벤트 핸들러
   * 검색어 입력 시 결과 필터링 및 표시
   * @param {Event} e 이벤트 객체
   */
  const handleSearchInput = (e) => {
    const { target } = e;
    const { showElement, hideElement } = view;
    const { searchReset, tasksView, tasksTitle, toggleSort, setSortIndicator } = view.elements;
    const inputValue = target.value.toLowerCase();
    const items = [];
    
    // 작업 뷰 제목 설정
    tasksTitle.textContent = `Searching for "${inputValue}"`;

    // 처음 검색 모드 실행 시 설정
    if (tasksView.dataset.projectIndex) {
      todoApp.setSelected(null);
      toggleSort(true);
      setSortIndicator('none');
    }

    if (inputValue !== '') {
      // 검색어가 있으면 리셋 버튼 표시
      showElement(searchReset);

      // 모든 프로젝트에서 검색어와 일치하는 항목 찾기
      todoApp.getProjects().forEach((project) => {
        project.getItems().forEach((item) => {
          if (item.title.toLowerCase().includes(inputValue)) items.push(item);
        });
      });

      // 이름순으로 정렬
      sortByName(items);
    } else {
      // 검색어가 없으면 리셋 버튼 숨김
      hideElement(searchReset);
    }

    // 검색 결과 표시
    view.displaySearchResults(items);
  };

  /**
   * 검색 초기화 버튼 이벤트 핸들러
   * 검색 필드 초기화 및 포커스 설정
   */
  const handleSearchReset = () => {
    const { searchReset, searchInput, tasksTitle } = view.elements;
    const { hideElement, displaySearchResults } = view;
    hideElement(searchReset);
    searchInput.value = '';
    searchInput.focus();
    tasksTitle.textContent = 'Searching for ""';
    // 검색 결과 초기화
    displaySearchResults([]);
  };

  /**
   * 검색 필드 포커스 해제 이벤트 핸들러
   * 검색 모드에서 벗어날 때 마지막 선택된 프로젝트로 돌아감
   * @param {Event} e 이벤트 객체
   */
  const handleSearchBlur = (e) => {
    const { searchInput } = view.elements;
    const { projectIndex } = view.elements.tasksView.dataset;

    // 검색어가 있거나 프로젝트 인덱스가 있으면 함수 종료
    if (searchInput.value || projectIndex) return;

    // 마지막으로 선택된 프로젝트로 전환
    handleSwitchList(e);
  };

  /**
   * 애플리케이션 초기화 함수
   * 할 일 앱의 기본 상태 설정 및 이벤트 리스너 등록
   */
  const init = () => {
    view = todoView();
    displayLists(view);
    
    // 이벤트 핸들러 등록
    view.bindAddTodo(handleAddTodo);
    view.bindDeleteTodo(handleDeleteTodo);
    view.bindToggleTodo(handleToggleTodo);
    view.bindAddList(handleAddList);
    view.bindSwitchList(handleSwitchList);
    view.bindDeleteList(handleDeleteList);
    view.bindEditTasksTitle(handleEditTasksTitle);
    view.bindSwitchTodo(handleSwitchTodo);
    view.bindSortList(handleSortList);
    view.bindSortIndicator(handleSortIndicator);
    view.bindPlannedClick(handlePlannedClick);
    view.bindSearchInput(handleSearchInput);
    view.bindSearchReset(handleSearchReset);
    view.bindSearchBlur(handleSearchBlur);
    
    // 드래그 앤 드롭 모듈 초기화
    draggable(todoApp, todoLocalStorage);
  };

  return {
    init,
  };
})();

export default todoController;
