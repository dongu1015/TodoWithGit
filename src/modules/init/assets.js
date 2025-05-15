/**
 * 애플리케이션에서 사용하는 모든 에셋(SVG 아이콘, 오디오 등)을 관리하는 모듈
 * 필요한 에셋을 임포트하고 하나의 객체로 제공
 */
import deleteSVG from '../../images/delete.svg';
import listSVG from '../../images/list.svg';
import arrowSVG from '../../images/arrow.svg';
import checkSVG from '../../images/check.svg';
import emptyStateSVG from '../../images/empty-state.svg';
import emptyStateAllTasksSVG from '../../images/empty-state-alltasks.svg';
import emptyStateMyDaySVG from '../../images/empty-state-myday.svg';
import emptyStateBookmarkSVG from '../../images/empty-state-bookmark.svg';
import emptyStatePlannedSVG from '../../images/empty-state-planned.svg';
import removeSVG from '../../images/remove.svg';
import prioritySVG from '../../images/priority.svg';
import calendarSVG from '../../images/calendar.svg';
import noteSVG from '../../images/note.svg';
import checkMarkSVG from '../../images/check-mark.svg';
import menuSVG from '../../images/menu.svg';
import plusSVG from '../../images/plus.svg';
import homeSVG from '../../images/home.svg';
import tasksSVG from '../../images/tasks.svg';
import importantSVG from '../../images/important.svg';
import daySVG from '../../images/day.svg';
import chevronSVG from '../../images/chevron.svg';
import sortSVG from '../../images/sort.svg';
import sortNameSVG from '../../images/sort-name.svg';
import sortCompletedSVG from '../../images/completed.svg';
import sortCreationDateSVG from '../../images/creation-date.svg';
import searchSVG from '../../images/search.svg';
import notFoundSVG from '../../images/not_found.svg';
import completeSound from '../../audio/complete.wav';

/**
 * 모든 에셋을 하나의 객체로 반환하는 함수
 * @returns {Object} 애플리케이션에서 사용할 모든 에셋
 */
const assets = () => ({
  // 아이콘 SVG
  deleteSVG,         // 삭제 아이콘
  listSVG,           // 목록 아이콘
  arrowSVG,          // 화살표 아이콘
  checkSVG,          // 체크박스 아이콘
  emptyStateSVG,     // 빈 상태 아이콘
  removeSVG,         // 제거 아이콘
  prioritySVG,       // 우선순위 아이콘
  calendarSVG,       // 달력 아이콘
  noteSVG,           // 노트 아이콘
  checkMarkSVG,      // 체크마크 아이콘
  menuSVG,           // 메뉴 아이콘
  plusSVG,           // 플러스 아이콘
  homeSVG,           // 홈 아이콘
  tasksSVG,          // 작업 아이콘
  importantSVG,      // 중요 아이콘
  daySVG,            // 일간 아이콘
  chevronSVG,        // 쉐브론 아이콘
  sortSVG,           // 정렬 아이콘
  sortNameSVG,       // 이름 정렬 아이콘
  sortCreationDateSVG, // 생성일 정렬 아이콘
  sortCompletedSVG,  // 완료 정렬 아이콘
  
  // 빈 상태 이미지
  emptyStateAllTasksSVG,  // 모든 작업 빈 상태
  emptyStateMyDaySVG,     // 내 하루 빈 상태
  emptyStateBookmarkSVG,  // 북마크 빈 상태
  emptyStatePlannedSVG,   // 계획된 작업 빈 상태
  
  // 기타 아이콘
  searchSVG,         // 검색 아이콘
  notFoundSVG,       // 검색 결과 없음 아이콘
  
  // 오디오
  completeSound,     // 작업 완료 효과음
});

export default assets;
