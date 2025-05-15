import DOMHelpers from '../helpers/DOMHelpers';

/**
 * 툴팁 기능 모듈
 * 페이지 내 또는 선택한 요소 내에서 툴팁 기능을 활성화합니다.
 * 'data-tooltip' 속성이 있는 요소에 마우스를 올리면 툴팁이 표시됩니다.
 * @param {Node} elem 툴팁이 활성화될 노드 요소(대부분의 경우 document 전체)
 */
const tooltip = (elem) => {
  // DOM 조작에 필요한 헬퍼 함수들을 가져옵니다.
  const { createElement, on, getElement, addClass } = DOMHelpers();

  /**
   * 마우스 오버 이벤트 처리 함수
   * 요소에 마우스를 올렸을 때 툴팁을 표시합니다.
   * @param {Event} e 마우스 오버 이벤트 객체
   */
  const handleMouseOver = (e) => {
    // 이벤트 타겟과 관련 타겟을 가져옵니다.
    const { target, relatedTarget } = e;
    // data-tooltip 속성을 가진 가장 가까운 부모 요소를 찾습니다.
    const parentTooltip = target.closest('[data-tooltip]');
    let parentRelatedTooltip = null;

    // relatedTarget이 있으면 해당 요소의 툴팁 부모를 찾습니다.
    if (relatedTarget) parentRelatedTooltip = relatedTarget.closest('[data-tooltip]');

    let text = null;

    // 툴팁 텍스트를 가져옵니다.
    if (parentTooltip) text = parentTooltip.dataset.tooltip;

    // 텍스트가 없거나 동일한 툴팁 요소면 함수를 종료합니다.
    if (!text || parentTooltip === parentRelatedTooltip) return;

    // 툴팁을 생성하고 내용을 설정합니다.
    const span = createElement('span');
    span.innerHTML = text;
    addClass(span, 'tooltip');
    document.body.append(span);
    
    // 툴팁 위치를 설정합니다. 대상 요소를 따라가도록 합니다.
    span.style.cssText = `
      top: ${parentTooltip.getBoundingClientRect().bottom + 5}px;
      left: ${parentTooltip.getBoundingClientRect().left -
        span.offsetWidth / 2 +
        parentTooltip.clientWidth / 2}px;
    `;

    // 창 하단에 공간이 없으면 요소 위에 툴팁을 표시합니다.
    if (span.getBoundingClientRect().top + span.offsetHeight > document.body.offsetHeight) {
      span.style.top = `${parentTooltip.getBoundingClientRect().top -
        parentTooltip.offsetHeight -
        5}px`;
      addClass(span, 'top');
    }

    // 창 오른쪽에 공간이 없으면 요소 왼쪽에 툴팁을 표시합니다.
    if (span.getBoundingClientRect().right > document.body.offsetWidth) {
      span.style.right = `${document.body.offsetWidth -
        parentTooltip.getBoundingClientRect().right -
        5}px`;
      span.style.left = '';
      addClass(span, 'bottom-left');
    }
  };

  /**
   * 마우스 아웃 이벤트 처리 함수
   * 요소에서 마우스가 벗어날 때 툴팁을 제거합니다.
   * @param {Event} e 마우스 아웃 이벤트 객체
   */
  const handleMouseOut = (e) => {
    const { target, relatedTarget } = e;
    const parentTooltip = target.closest('[data-tooltip]');
    let parentRelatedTooltip = null;

    if (relatedTarget) parentRelatedTooltip = relatedTarget.closest('[data-tooltip]');

    /**
     * 자식 요소에 마우스를 올릴 때 툴팁 제거를 방지하고,
     * 자식에서 부모 외부로 직접 나갈 때만 제거합니다.
     */
    if (parentTooltip === parentRelatedTooltip) return;

    // 툴팁이 있으면 제거합니다.
    if (getElement('.tooltip')) getElement('.tooltip').remove();
  };

  // 이벤트 리스너 등록
  on(elem, 'mouseover', handleMouseOver);
  on(elem, 'mouseout', handleMouseOut);
};

export default tooltip;
