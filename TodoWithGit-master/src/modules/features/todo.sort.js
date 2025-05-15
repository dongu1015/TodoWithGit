/**
 * 할 일 항목 정렬 모듈
 * 다양한 기준으로 할 일 항목을 정렬하는 기능을 제공합니다.
 */
const todoSort = () => {
  // 정렬 관련 상태 관리
  const state = {
    selectedType: 'none',    // 현재 선택된 정렬 타입
    selectedDirection: null, // 현재 선택된 정렬 방향
    typeDirections: {        // 각 정렬 타입별 기본 방향 설정
      Alphabetically: 'asc',
      Completed: 'asc',
      'Added to My Day': 'desc',
      Bookmarked: 'desc',
      'Due date': 'asc',
      'Creation date': 'asc',
      Priority: 'desc',
    },
  };

  // 정렬 순서 변수 (1: 내림차순, -1: 오름차순)
  let order = null;

  /**
   * 이름으로 항목 정렬
   * @param {Array} sortedItems 정렬할 항목 배열
   */
  const sortByName = (sortedItems) => {
    sortedItems.sort((itemA, itemB) => {
      const nameA = itemA.title.toUpperCase();
      const nameB = itemB.title.toUpperCase();

      if (nameA < nameB) return -order; // 오름차순이면 A가 먼저
      if (nameA > nameB) return order;  // 내림차순이면 B가 먼저

      return 0; // 같으면 순서 유지
    });
  };

  /**
   * 완료 상태로 항목 정렬
   * @param {Array} sortedItems 정렬할 항목 배열
   */
  const sortByCompleted = (sortedItems) => {
    sortedItems.sort((itemA, itemB) => {
      if (itemB.isComplete && !itemA.isComplete) return -order;
      if (itemA.isComplete && !itemB.isComplete) return order;

      return 0;
    });
  };

  /**
   * My Day 속성으로 항목 정렬
   * @param {Array} sortedItems 정렬할 항목 배열
   */
  const sortByMyDay = (sortedItems) => {
    sortedItems.sort((itemA, itemB) => {
      if (itemB.isMyDay && !itemA.isMyDay) return -order;
      if (itemA.isMyDay && !itemB.isMyDay) return order;

      return 0;
    });
  };

  /**
   * 중요도(북마크)로 항목 정렬
   * @param {Array} sortedItems 정렬할 항목 배열
   */
  const sortByImportance = (sortedItems) => {
    sortedItems.sort((itemA, itemB) => {
      if (itemB.isImportant && !itemA.isImportant) return -order;
      if (itemA.isImportant && !itemB.isImportant) return order;

      return 0;
    });
  };

  /**
   * 마감일로 항목 정렬
   * @param {Array} sortedItems 정렬할 항목 배열
   */
  const sortByDueDate = (sortedItems) => {
    sortedItems.sort((itemA, itemB) => {
      const dateA = new Date(itemA.date);
      const dateB = new Date(itemB.date);

      // 완료된 항목은 항상 아래로
      if (itemA.isComplete && !itemB.isComplete) return -1;
      if (!itemA.isComplete && itemB.isComplete) return 1;

      // 날짜 없는 항목 처리
      if (!itemA.date && itemB.date) return -1;
      if (itemA.date && !itemB.date) return 1;

      // 두 항목 모두 날짜가 있으면 날짜 비교
      if (dateA && dateB) {
        if (dateA < dateB) return -order;
        if (dateA > dateB) return order;
      }

      return 0;
    });
  };

  /**
   * 생성일로 항목 정렬
   * @param {Array} sortedItems 정렬할 항목 배열
   */
  const sortByCreationDate = (sortedItems) => {
    sortedItems.sort((itemA, itemB) => {
      if (itemA.creationDate < itemB.creationDate) return -order;
      if (itemA.creationDate > itemB.creationDate) return order;

      return 0;
    });
  };

  /**
   * 기본 정렬 (생성일 기준 오름차순)
   * @param {Array} sortedItems 정렬할 항목 배열
   */
  const DefaultSorting = (sortedItems) => {
    sortedItems.sort((itemA, itemB) => {
      if (itemA.creationDate < itemB.creationDate) return -1;
      if (itemA.creationDate > itemB.creationDate) return 1;

      return 0;
    });
  };

  /**
   * 우선순위로 항목 정렬
   * @param {Array} sortedItems 정렬할 항목 배열
   */
  const sortByPriority = (sortedItems) => {
    sortedItems.sort((itemA, itemB) => {
      let a = null;
      let b = null;

      // 각 우선순위에 숫자 값 할당 (low: 1, medium: 2, high: 3)
      switch (itemA.priority) {
        case 'low':
          a = 1;
          break;
        case 'medium':
          a = 2;
          break;
        case 'high':
          a = 3;
          break;
        default:
          break;
      }

      switch (itemB.priority) {
        case 'low':
          b = 1;
          break;
        case 'medium':
          b = 2;
          break;
        case 'high':
          b = 3;
          break;
        default:
          break;
      }

      // 완료되지 않은 항목들끼리 우선순위 비교
      if (!itemA.isComplete && !itemB.isComplete) {
        if (a < b) return -order;
        if (a > b) return order;
      }

      // 완료된 항목은 항상 아래로
      if (itemA.isComplete && !itemB.isComplete) return -1;
      if (!itemA.isComplete && itemB.isComplete) return 1;

      return 0;
    });
  };

  /**
   * 선택된 정렬 타입에 따라 항목들을 정렬
   * @param {Array} items 정렬할 항목 배열
   * @param {boolean} isGeneratedProject 생성된 프로젝트인지 여부
   * @returns {Array} 정렬된 항목 배열
   */
  const getSortedItems = (items, isGeneratedProject) => {
    const sortedItems = [...items];

    // 정렬 방향이 지정되어 있으면 적용
    if (state.selectedDirection) {
      state.typeDirections[state.selectedType] = state.selectedDirection;
    }

    // 정렬 순서 설정 (asc: 오름차순(-1), desc: 내림차순(1))
    order = state.typeDirections[state.selectedType] === 'asc' ? -1 : 1;

    // 생성된 프로젝트는 기본 정렬 적용
    if (isGeneratedProject) DefaultSorting(sortedItems);

    // 선택된 정렬 타입에 따라 정렬 함수 호출
    switch (state.selectedType) {
      case 'Alphabetically':
        sortByName(sortedItems);
        break;
      case 'Completed':
        sortByCompleted(sortedItems);
        break;
      case 'Added to My Day':
        sortByMyDay(sortedItems);
        break;
      case 'Bookmarked':
        sortByImportance(sortedItems);
        break;
      case 'Due date':
        sortByDueDate(sortedItems);
        break;
      case 'Creation date':
        sortByCreationDate(sortedItems);
        break;
      case 'Priority':
        sortByPriority(sortedItems);
        break;
      default:
        break;
    }

    // 일회성 정렬 방향 초기화
    state.selectedDirection = null;

    return sortedItems;
  };

  /**
   * 선택된 정렬 타입 가져오기
   * @returns {string} 선택된 정렬 타입
   */
  const getSelectedSortType = () => state.selectedType;

  /**
   * 정렬 타입 설정
   * @param {string} type 정렬 타입
   */
  const setSelectedSortType = (type) => {
    state.selectedType = type;
  };

  /**
   * 특정 정렬 타입의 방향 가져오기
   * @param {string} type 정렬 타입
   * @returns {string} 정렬 방향 ('asc' 또는 'desc')
   */
  const getSelectedDirection = (type) => state.typeDirections[type];

  /**
   * 정렬 방향 설정
   * @param {string} direction 정렬 방향 ('asc' 또는 'desc')
   */
  const setSelectedDirection = (direction) => {
    state.selectedDirection = direction;
  };

  /**
   * 모든 정렬 타입의 방향 설정 가져오기
   * @returns {Object} 정렬 타입별 방향 설정
   */
  const getSortDirections = () => state.typeDirections;

  /**
   * 모든 정렬 타입의 방향 설정
   * @param {Object} directions 정렬 타입별 방향 설정
   */
  const setSortDirections = (directions) => {
    state.typeDirections.Alphabetically = directions.Alphabetically;
    state.typeDirections.Completed = directions.Completed;
    state.typeDirections['Added to My Day'] = directions['Added to My Day'];
    state.typeDirections.Bookmarked = directions.Bookmarked;
    state.typeDirections['Due date'] = directions['Due date'];
    state.typeDirections['Creation date'] = directions['Creation date'];
    state.typeDirections.Priority = directions.Priority;
  };

  // 모듈의 공개 API 반환
  return {
    getSortedItems,
    setSelectedSortType,
    setSelectedDirection,
    getSelectedSortType,
    getSelectedDirection,
    getSortDirections,
    setSortDirections,
  };
};

export default todoSort;
