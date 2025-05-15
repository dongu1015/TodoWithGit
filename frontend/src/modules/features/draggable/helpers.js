/**
 * 드래그 앤 드롭 기능을 지원하는 헬퍼 함수들 모음
 * @param {Function} getNumberFromString 문자열에서 숫자를 추출하는 함수
 * @returns {Object} 드래그 앤 드롭 헬퍼 함수들을 담은 객체
 */
const helpers = (getNumberFromString) => {
  /**
   * 드래그된 항목과 대상 항목에 따라 목록 순서를 업데이트합니다.
   * @param {Array} items 항목 배열
   * @param {HTMLElement} draggedItem 드래그된 항목
   * @param {HTMLElement} belowItem 드래그된 항목이 위치할 대상 항목
   * @returns {Array} 업데이트된 항목 배열
   */
  const getUpdatedList = (items, draggedItem, belowItem) => {
    const arrayHolder = [...items]; // 원본 배열 복사
    // 항목 ID로 인덱스를 찾는 헬퍼 함수
    const getIndex = (id) => arrayHolder.findIndex((item) => item.id === id);

    // 드래그된 항목과 대상 항목의 ID와 인덱스
    const draggedID = Number(draggedItem.dataset.index);
    const belowID = Number(belowItem.dataset.index);
    const belowIndex = getIndex(belowID);
    const draggedIndex = getIndex(draggedID);

    // 항목 배열 재정렬
    items.sort((itemA, itemB) => {
      // 드래그된 항목이 아래로 이동하는 경우
      if (draggedIndex > belowIndex) {
        if (itemA.id === draggedID && getIndex(itemB.id) >= belowIndex) return -1;
        if (itemB.id === draggedID && getIndex(itemA.id) >= belowIndex) return 1;
      } 
      // 드래그된 항목이 위로 이동하는 경우
      else {
        if (itemB.id === draggedID && getIndex(itemA.id) <= belowIndex) return -1;
        if (itemA.id === draggedID && getIndex(itemB.id) <= belowIndex) return 1;
      }

      return 0; // 기본적으로 순서 유지
    });

    return items;
  };

  /**
   * 이동해야 할 항목들을 찾습니다.
   * @param {Array} items 항목 배열
   * @param {HTMLElement} container 컨테이너 요소
   * @param {HTMLElement} draggedItem 드래그된 항목
   * @param {HTMLElement} belowItem 드래그된 항목이 위치할 대상 항목
   * @returns {Array} 위치를 변경해야 할 항목들의 배열
   */
  const getItemsToTranslate = (items, container, draggedItem, belowItem) => {
    // ID로 항목 DOM 요소를 찾는 헬퍼 함수
    const getTaskFromID = (id) => container.querySelector(`.todo-item[data-index="${id}"]`);
    const getIndex = (id) => items.findIndex((item) => item.id === id);

    // 드래그된 항목과 대상 항목의 ID와 인덱스
    const draggedID = Number(draggedItem.dataset.index);
    const belowID = Number(belowItem.dataset.index);
    const draggedIndex = getIndex(draggedID);
    const belowIndex = getIndex(belowID);
    const list = [];

    // 이동해야 할 항목들 찾기
    items.forEach((item, index) => {
      // 아래로 이동하는 경우(드래그된 항목의 인덱스가 더 큼)
      if (draggedIndex > belowIndex) {
        if (index < draggedIndex && index >= belowIndex) list.push(getTaskFromID(item.id));
      } 
      // 위로 이동하는 경우(드래그된 항목의 인덱스가 더 작음)
      else if (index > draggedIndex && index <= belowIndex) {
        list.push(getTaskFromID(item.id));
      }
    });

    return list;
  };

  /**
   * 드래그된 항목이 드롭 가능한 영역에 들어갔을 때 시각적 효과를 적용합니다.
   * @param {Array} items 항목 배열
   * @param {Array} list 영향을 받는 항목들의 배열
   * @param {HTMLElement} draggedItem 드래그된 항목
   * @param {HTMLElement} belowItem 드래그된 항목이 위치할 대상 항목
   */
  const enterDroppable = (items, list, draggedItem, belowItem) => {
    const getIndex = (id) => items.findIndex((item) => item.id === id);

    // 드래그된 항목과 대상 항목의 ID와 인덱스
    const draggedID = Number(draggedItem.dataset.index);
    const belowID = Number(belowItem.dataset.index);
    const draggedIndex = getIndex(draggedID);
    const belowIndex = getIndex(belowID);
    
    // 항목 높이와 마진 계산
    const todoItemHeight =
      draggedItem.offsetHeight + parseInt(getComputedStyle(draggedItem).marginBottom, 10);
    
    // 대상 항목의 현재 위치
    const belowTranslateY = belowItem.style.transform
      ? getNumberFromString(belowItem.style.transform)
      : 0;

    // 드래그된 항목을 아래에서 위로 이동하는 경우
    if (draggedIndex > belowIndex) {
      list.forEach((item) => {
        if (item === draggedItem) {
          // 드래그된 항목 위치 조정
          item.style.transform = `translateY(${belowTranslateY -
            (draggedItem.offsetHeight - belowItem.offsetHeight)})px`;
          return;
        }

        // 영향 받는 항목들을 위로 이동
        const translateY = item.style.transform ? getNumberFromString(item.style.transform) : 0;
        item.style.transform = `translateY(${translateY - todoItemHeight}px)`;
      });
    } 
    // 드래그된 항목을 위에서 아래로 이동하는 경우
    else {
      list.forEach((item) => {
        if (item === draggedItem) {
          // 드래그된 항목 위치 조정
          item.style.transform = `translateY(${belowTranslateY})px`;
          return;
        }

        // 영향 받는 항목들을 아래로 이동
        const translateY = item.style.transform ? getNumberFromString(item.style.transform) : 0;
        item.style.transform = `translateY(${translateY + todoItemHeight}px)`;
      });
    }
  };

  /**
   * 컨테이너를 아래로 스크롤합니다.
   * @param {HTMLElement} container 스크롤할 컨테이너
   * @returns {Array} 타이머 ID 배열
   */
  const scrollListDown = (container) => {
    const scrollDiff = container.scrollHeight - container.offsetHeight;
    let scrolledDistance = container.scrollTop;
    const timerIDs = [];

    let multiplier = 0;

    // 스크롤이 끝에 도달할 때까지 점진적으로 스크롤
    while (scrolledDistance < scrollDiff) {
      const timerID = setTimeout(() => {
        container.scrollBy(0, 1);
      }, 5 * multiplier);

      multiplier += 1;
      scrolledDistance += 1;
      timerIDs.push(timerID);
    }

    return timerIDs;
  };

  /**
   * 컨테이너를 위로 스크롤합니다.
   * @param {HTMLElement} container 스크롤할 컨테이너
   * @returns {Array} 타이머 ID 배열
   */
  const scrollListTop = (container) => {
    let scrolledDistance = container.scrollTop;
    const timerIDs = [];

    let multiplier = 0;

    // 스크롤이 상단에 도달할 때까지 점진적으로 스크롤
    while (scrolledDistance >= 0) {
      const timerID = setTimeout(() => {
        container.scrollBy(0, -1);
      }, 5 * multiplier);

      multiplier += 1;
      scrolledDistance -= 1;
      timerIDs.push(timerID);
    }

    return timerIDs;
  };

  /**
   * 항목 배열의 순서에 따라 DOM 요소의 순서를 조정합니다.
   * @param {HTMLElement} list DOM 요소 컨테이너
   * @param {Array} items 항목 배열
   */
  const reOrderDOMList = (list, items) => {
    // 항목 ID 순서대로 배열 생성
    const orderedIDs = [];
    items.forEach((item) => orderedIDs.push(item.id));

    // 각 항목을 순서대로 컨테이너 앞에 추가
    orderedIDs.forEach((id) => {
      const item = list.querySelector(`.todo-item[data-index="${id}"]`);
      list.prepend(item);
    });
  };

  // 헬퍼 함수들을 객체로 반환
  return {
    getUpdatedList,
    getItemsToTranslate,
    enterDroppable,
    scrollListDown,
    scrollListTop,
    reOrderDOMList,
  };
};

export default helpers;
