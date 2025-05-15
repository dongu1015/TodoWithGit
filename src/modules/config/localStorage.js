/**
 * 할 일 앱의 로컬 스토리지 관리 모듈
 * 앱 상태 저장 및 복원 기능 제공
 */
const todoLocalStorage = (() => {
  /**
   * 로컬 스토리지 사용 가능 여부 테스트
   * @param {string} type 테스트할 스토리지 유형 ('localStorage')
   * @returns {boolean} 스토리지 사용 가능 여부
   */
  const storageAvailable = (type) => {
    let storage;
    try {
      // 스토리지 객체 가져오기
      storage = window[type];
      const x = '__storage_test__';
      // 테스트 항목 저장 및 삭제
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      // 스토리지에 접근할 수 없는 경우의 오류 확인
      return (
        e instanceof DOMException &&
        // Firefox를 제외한 모든 브라우저
        (e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // 코드가 없는 경우 이름으로 확인
          // Firefox를 제외한 모든 브라우저
          e.name === 'QuotaExceededError' ||
          // Firefox
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        // 이미 저장된 항목이 있는 경우에만 QuotaExceededError 인정
        storage &&
        storage.length !== 0
      );
    }
  };

  /**
   * 할 일 앱의 현재 상태를 로컬 스토리지에 저장
   * @param {Object} todoApp 할 일 앱 객체
   */
  const populateStorage = (todoApp) => {
    // 저장할 객체 초기화
    const obj = {};
    obj.selected = todoApp.getSelected();
    obj.lastSelected = todoApp.getLastSelected();
    obj.projects = [];

    // 모든 프로젝트 정보 저장
    todoApp.getProjects().forEach((project, index) => {
      const objProject = {};

      // Planned 프로젝트의 탭 상태(열림/닫힘) 저장
      if (index === 3) objProject.tabStates = [...project.tabStates];

      // My Day 프로젝트의 날짜 저장 (새로운 날이 되었는지 확인용)
      if (index === 1) objProject.date = project.date;

      // 사용자 정의 프로젝트 정보 저장
      if (index > 4) {
        objProject.name = project.getName();
        objProject.id = project.id;
      }

      // Planned 프로젝트를 제외한 모든 프로젝트의 정렬 정보 저장
      if (index !== 3) {
        objProject.selectedSortType = project.getSelectedSortType();
        objProject.directions = project.getSortDirections();
      }

      // 'Tasks' 프로젝트와 사용자 정의 프로젝트의 할 일 항목들 저장
      if (index > 3) {
        objProject.tasks = [];

        project.getItems().forEach((task) => {
          const objTask = {};
          objTask.id = task.id;
          objTask.title = task.title;
          objTask.date = task.date;
          objTask.priority = task.priority;
          objTask.note = task.note;
          objTask.isComplete = task.isComplete;
          objTask.isImportant = task.isImportant;
          objTask.isMyDay = task.isMyDay;
          objTask.creationDate = task.creationDate;
          objTask.subTasks = task.getSubTasks();

          objProject.tasks.push(objTask);
        });
      }

      obj.projects.push(objProject);
    });

    // 객체를 JSON 문자열로 변환하여 로컬 스토리지에 저장
    localStorage.setItem('todoApp', JSON.stringify(obj));
  };

  /**
   * 로컬 스토리지에서 할 일 앱의 상태 복원
   * @param {Object} todoApp 할 일 앱 객체
   */
  const initApp = (todoApp) => {
    // 로컬 스토리지에서 데이터 가져오기
    const obj = JSON.parse(localStorage.getItem('todoApp'));
    todoApp.setSelected(obj.lastSelected);

    // 각 프로젝트 정보 복원
    obj.projects.forEach((project, index) => {
      // 사용자 정의 프로젝트 추가
      if (index > 4) todoApp.addProject(project.name);

      const currentProject = todoApp.getProjects()[index];

      // 사용자 정의 프로젝트의 ID 설정
      if (index > 4) currentProject.id = project.id;

      // Planned 프로젝트의 탭 상태 복원
      if (index === 3) currentProject.tabStates = [...project.tabStates];

      // My Day 프로젝트의 날짜 복원
      if (index === 1) currentProject.date = project.date;

      // Planned 프로젝트를 제외한 모든 프로젝트의 정렬 정보 복원
      if (index !== 3) {
        currentProject.setSelectedSortType(project.selectedSortType);
        currentProject.setSortDirections(project.directions);
      }

      // 'Tasks' 프로젝트와 사용자 정의 프로젝트의 할 일 항목들 복원
      if (index > 3) {
        project.tasks.forEach((task) => {
          // 할 일 항목 추가
          currentProject.addTodo(task.title, currentProject.id);
          const currentTask = currentProject.getItems()[currentProject.getItems().length - 1];
          // 할 일 항목의 속성 복원
          currentTask.id = task.id;
          currentTask.date = task.date;
          currentTask.priority = task.priority;
          currentTask.note = task.note;
          currentTask.isComplete = task.isComplete;
          currentTask.isImportant = task.isImportant;
          currentTask.isMyDay = task.isMyDay;
          currentTask.creationDate = task.creationDate;

          // 하위 작업 복원
          task.subTasks.forEach((subtask, i) => {
            currentTask.addSubTask(subtask.name);
            const currentSubTask = currentTask.getSubTasks()[i];
            currentSubTask.id = subtask.id;
            currentSubTask.isComplete = subtask.isComplete;
          });
        });
      }
    });
  };

  // 모듈의 공개 API
  return {
    storageAvailable,
    populateStorage,
    initApp,
  };
})();

export default todoLocalStorage;
