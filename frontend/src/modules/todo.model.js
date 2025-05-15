/**
 * 할 일 항목 모델 모듈
 * 애플리케이션의 데이터 구조와 관련 로직을 정의합니다.
 */
import todoSort from './features/todo.sort';

/**
 * 할 일 항목 객체 생성 팩토리 함수
 * @param {string} title - 할 일 항목의 제목
 * @returns {Object} 새로운 할 일 항목 객체
 */
const todoItem = (title) => {
  // 하위 작업 배열 초기화
  const subTasks = [];

  /**
   * 모든 하위 작업 반환
   * @returns {Array} 하위 작업 배열
   */
  const getSubTasks = () => subTasks;

  /**
   * 새 하위 작업 추가
   * @param {string} name - 하위 작업 이름
   */
  const addSubTask = (name) => {
    // 새 하위 작업의 ID 생성 (기존 작업이 있으면 마지막 작업 ID + 1, 없으면 1)
    const subTaskID = subTasks.length > 0 ? subTasks[subTasks.length - 1].id + 1 : 1;
    const subTask = {
      id: subTaskID,
      name,
      isComplete: false,
    };
    subTasks.push(subTask);
  };

  /**
   * ID로 하위 작업 제거
   * @param {number} id - 제거할 하위 작업의 ID
   */
  const removeSubTask = (id) => {
    const index = subTasks.findIndex((subTask) => subTask.id === id);

    if (index !== -1) subTasks.splice(index, 1);
  };

  /**
   * 하위 작업 이름 수정
   * @param {number} id - 수정할 하위 작업의 ID
   * @param {string} name - 새 이름
   */
  const editSubTaskName = (id, name) => {
    if (name) {
      subTasks.some((subTask) => {
        if (subTask.id === id) {
          subTask.name = name;
          return true;
        }

        return false;
      });
    }
  };

  /**
   * 하위 작업 완료 상태 토글
   * @param {number} id - 토글할 하위 작업의 ID
   */
  const toggleSubTask = (id) => {
    subTasks.some((subTask) => {
      if (subTask.id === id) {
        subTask.isComplete = !subTask.isComplete;
        return true;
      }

      return false;
    });
  };

  // 할 일 항목 객체 반환
  return {
    title,
    description: '',
    date: '',
    priority: 'low',
    note: '',
    isComplete: false,
    isImportant: false,
    isMyDay: false,
    creationDate: null,
    getSubTasks,
    addSubTask,
    removeSubTask,
    editSubTaskName,
    toggleSubTask,
  };
};

/**
 * 할 일 저장소 헬퍼 팩토리 함수
 * @param {Function} getItems - 항목 배열을 반환하는 함수
 * @returns {Object} 헬퍼 함수들을 포함한 객체
 */
const todoStoreHelper = (getItems) => {
  /**
   * ID로 항목 찾기
   * @param {number} id - 찾을 항목의 ID
   * @returns {Object|null} 찾은 항목 또는 null
   */
  const getItemByID = (id) => {
    let item = null;
    getItems().some((todo) => {
      if (todo.id === id) {
        item = todo;
        return true;
      }

      return false;
    });

    return item;
  };

  return {
    getItemByID,
  };
};

/**
 * 할 일 저장소 팩토리 함수
 * @param {string} name - 저장소 이름
 * @returns {Object} 할 일 저장소 객체
 */
const todoStore = (name = '') => {
  // 상태 초기화
  const state = {
    items: [],
    name,
  };

  // 정렬 모듈 초기화
  const sort = todoSort();

  // 정렬 관련 메소드 구조 분해 할당
  const {
    setSelectedSortType,
    setSelectedDirection,
    getSelectedSortType,
    getSelectedDirection,
    getSortDirections,
    setSortDirections,
  } = sort;

  /**
   * 저장소 이름 반환
   * @returns {string} 저장소 이름
   */
  const getName = () => state.name;

  /**
   * 저장소 이름 설정
   * @param {string} newName - 새 이름
   */
  const setName = (newName) => {
    state.name = newName;
  };

  /**
   * 모든 할 일 항목 반환
   * @returns {Array} 할 일 항목 배열
   */
  const getItems = () => state.items;

  /**
   * 정렬된 할 일 항목 반환
   * @param {Array} items - 정렬할 할 일 항목 배열 (기본값: state.items)
   * @returns {Array} 정렬된 할 일 항목 배열
   */
  function getSortedItems(items = state.items) {
    // 생성된 프로젝트 여부 확인 (ID 1, 2, 3인 경우 생성된 프로젝트)
    const isGeneratedProject = [1, 2, 3].includes(this.id);

    return sort.getSortedItems(items, isGeneratedProject);
  }

  // getItemByID 헬퍼 함수 가져오기
  const { getItemByID } = todoStoreHelper(getItems);

  /**
   * 새 할 일 항목 추가
   * @param {string} title - 할 일 항목 제목
   */
  function addTodo(title) {
    if (!title) return;

    // 새 할 일 항목 생성
    const item = todoItem(title);
    // 새 ID 생성 (기존 항목 중 최대 ID + 1 또는 1)
    const maxID = Math.max(...state.items.map((todo) => todo.id));
    item.id = state.items.length > 0 ? maxID + 1 : 1;
    // 프로젝트 ID 설정
    item.projectID = this.id;

    // 새 항목을 배열에 추가
    state.items.push(item);
  }

  /**
   * 할 일 항목 제거
   * @param {number} id - 제거할 항목의 ID
   */
  const removeTodo = (id) => {
    const items = getItems();
    const index = items.findIndex((item) => item.id === id);
    if (index !== -1) items.splice(index, 1);
  };

  /**
   * 할 일 항목 완료 상태 토글
   * @param {number} id - 토글할 항목의 ID
   */
  const toggleTodo = (id) => {
    getItemByID(id).isComplete = !getItemByID(id).isComplete;
  };

  /**
   * 할 일 항목 제목 업데이트
   * @param {number} id - 업데이트할 항목의 ID
   * @param {string} title - 새 제목
   */
  const updateTodoTitle = (id, title) => {
    if (title) getItemByID(id).title = title;
  };

  // 할 일 저장소 객체 반환
  return {
    getName,
    setName,
    getItems,
    addTodo,
    removeTodo,
    toggleTodo,
    updateTodoTitle,
    getItemByID,
    getSortedItems,
    setSelectedSortType,
    getSelectedSortType,
    setSelectedDirection,
    getSelectedDirection,
    getSortDirections,
    setSortDirections,
  };
};

/**
 * 할 일 애플리케이션 모듈 (싱글톤 패턴)
 */
const todoApp = (() => {
  // 기본 프로젝트 생성
  const defaultStores = [
    todoStore('All Tasks'),
    todoStore('My Day'),
    todoStore('Bookmarked'),
    todoStore('Planned'),
    todoStore('Tasks'),
  ];
  // 각 프로젝트에 ID 할당
  defaultStores[0].id = 1;
  defaultStores[1].id = 2;
  defaultStores[1].date = 0;
  defaultStores[2].id = 3;
  defaultStores[3].id = 4;
  defaultStores[4].id = 5;
  // Planned 프로젝트의 탭 상태 설정 (열림/닫힘)
  defaultStores[3].tabStates = ['open', 'open', 'open', 'open', 'open', 'open'];
  
  // 애플리케이션 상태 초기화
  const state = {
    projects: [...defaultStores],
    selected: 4, // 초기 선택된 프로젝트 인덱스
    lastSelected: 4, // 마지막으로 선택된 프로젝트 인덱스
  };

  /**
   * 모든 프로젝트 반환
   * @returns {Array} 프로젝트 배열
   */
  const getProjects = () => state.projects;

  /**
   * 현재 선택된 프로젝트 인덱스 반환
   * @returns {number} 선택된 프로젝트 인덱스
   */
  const getSelected = () => state.selected;

  /**
   * 마지막으로 선택된 프로젝트 인덱스 반환
   * @returns {number} 마지막으로 선택된 프로젝트 인덱스
   */
  const getLastSelected = () => state.lastSelected;

  /**
   * 선택된 프로젝트 인덱스 설정
   * 프로젝트 ID가 아닌 배열 인덱스를 사용하여 이전/다음 프로젝트로 쉽게 전환 가능
   * @param {Number} index - 프로젝트 배열의 인덱스
   */
  const setSelected = (index) => {
    state.selected = index;

    if (index || index === 0) state.lastSelected = index;
  };

  /**
   * 새 프로젝트 추가
   * @param {string} name - 프로젝트 이름
   */
  const addProject = (name) => {
    const project = todoStore(name);
    // 새 프로젝트 ID 생성 (마지막 프로젝트 ID + 1 또는 1)
    project.id = state.projects.length > 0 ? state.projects[state.projects.length - 1].id + 1 : 1;

    state.projects.push(project);
  };

  /**
   * 프로젝트 제거
   * @param {number} id - 제거할 프로젝트 ID
   */
  const removeProject = (id) => {
    // 기본 프로젝트는 제거 방지
    const defaultIDs = [1, 2, 3, 4, 5];

    if (getProjects().length > 1 && !defaultIDs.includes(id)) {
      const index = getProjects().findIndex((project) => project.id === id);
      if (index !== -1) getProjects().splice(index, 1);
    }
  };

  // getItemByID 헬퍼 함수를 getProjectByID로 변경하여 사용
  const { getItemByID: getProjectByID } = todoStoreHelper(getProjects);

  /**
   * 현재 선택된 프로젝트 반환
   * @returns {Object|null} 선택된 프로젝트 또는 null
   */
  const getSelectedProject = () => {
    if (!getSelected() && getSelected() !== 0) return null;

    const { id } = getProjects()[getSelected()];
    return getProjectByID(id);
  };

  // 할 일 애플리케이션 API 반환
  return {
    getProjects,
    addProject,
    removeProject,
    getSelected,
    setSelected,
    getLastSelected,
    getProjectByID,
    getSelectedProject,
  };
})();

export default todoApp;
