/**
 * 할 일 컨트롤러 모듈에 대한 단위 테스트
 */
import todoController from '../todo.controller';

// Jest의 JSDom은 MutationObserver API를 지원하지 않으므로 모킹
global.MutationObserver = class {
  constructor(callback) {} // eslint-disable-line
  disconnect() {} // eslint-disable-line
  observe(element, initObject) {} // eslint-disable-line
};

// 오디오 요소 모킹 (JSDom은 HTML 오디오/비디오를 지원하지 않음)
window.HTMLMediaElement.prototype.play = () => {
  /* 아무 작업도 하지 않음 */
};
window.HTMLMediaElement.prototype.pause = () => {
  /* 아무 작업도 하지 않음 */
};

/**
 * 할 일 목록 추가 헬퍼 함수
 * @param {string} title 추가할 목록의 제목
 */
const addList = (title) => {
  document.querySelector('#newList').value = title;
  document.querySelector('.lists-menu .submit-btn').click();
};

/**
 * 할 일 컨트롤러 테스트 스위트
 */
describe('\n => todoController', () => {
  // 각 테스트 전에 DOM을 초기화하고 컨트롤러를 시작
  beforeEach(() => {
    // DOM 초기화
    document.body.innerHTML = '<div id="root"></div>';
    todoController.init();

    // 사용자 정의 프로젝트 모두 삭제
    const empty = (parentNode) => {
      while (parentNode.children[5]) {
        parentNode.children[5].querySelector('.delete-btn').click();
      }
    };

    empty(document.querySelector('.lists'));
  });

  /**
   * 초기화 관련 테스트
   */
  describe('\n   => init', () => {
    test('should display 5 projects', () => {
      expect(document.querySelector('.lists').childElementCount).toBe(5);
    });

    test('should display the default projects', () => {
      expect(document.querySelectorAll('.lists .project-name')[0].innerHTML).toBe('All Tasks');
      expect(document.querySelectorAll('.lists .project-name')[1].innerHTML).toBe('My Day');
      expect(document.querySelectorAll('.lists .project-name')[2].innerHTML).toBe('Bookmarked');
      expect(document.querySelectorAll('.lists .project-name')[3].innerHTML).toBe('Planned');
      expect(document.querySelectorAll('.lists .project-name')[4].innerHTML).toBe('Tasks');
    });

    test('should display an empty todo list', () => {
      expect(document.querySelector('.todo-list').childElementCount).toBe(0);
    });

    /**
     * 할 일 추가 관련 테스트
     */
    describe('\n     => bindAddTodo', () => {
      test('should display an empty todo list when input is empty', () => {
        document.querySelector('.tasks-view .submit-btn').click();
        expect(document.querySelector('.todo-list').childElementCount).toBe(0);
      });
    });

    /**
     * 할 일 삭제 관련 테스트
     */
    describe('\n     => bindDeleteTodo', () => {
      test('should delete todo when button is clicked', () => {
        document.querySelector('#newTodo').value = 'simple task';
        document.querySelector('.tasks-view .submit-btn').click();
        // 할 일을 완료 상태로 설정
        document.querySelector('.tasks-view label').click();
        document.querySelector('.tasks-view .delete-btn').click();
        expect(document.querySelector('.todo-list').childElementCount).toBe(0);
      });
    });

    /**
     * 목록 관련 테스트
     */
    describe('\n      => Lists', () => {
      /**
       * 목록 추가 관련 테스트
       */
      describe('\n       => bindAddList', () => {
        test('should add a project when called', () => {
          document.querySelector('#newList').value = 'My project';
          document.querySelector('.lists-menu .submit-btn').click();
          expect(document.querySelector('.lists').childElementCount).toBe(6);
        });

        test('should not add a project when title is an empty string', () => {
          document.querySelector('#newList').value = '';
          document.querySelector('.lists-menu .submit-btn').click();
          expect(document.querySelector('.lists').childElementCount).toBe(5);
        });
      });

      /**
       * 목록 전환 관련 테스트
       */
      describe('\n       => bindSwitchList', () => {
        test('should switch list when clicked', () => {
          addList('My project 1');
          document.querySelector('.lists .list').click();

          expect(
            document.querySelector('.lists .list:last-child').classList.contains('selected'),
          ).toBe(false);
          expect(document.querySelector('.lists .list').classList.contains('selected')).toBe(true);
        });
      });

      /**
       * 목록 삭제 관련 테스트
       */
      describe('\n       => bindDeleteList', () => {
        test('should remove project when remove button is clicked', () => {
          addList('My project 2');
          const listCount = document.querySelectorAll('.lists .list').length;
          document.querySelectorAll('.lists .delete-btn')[0].click();

          expect(document.querySelectorAll('.lists .list').length).toBe(listCount - 1);
        });

        test('should transfer "selected" class to its upper sibling when deleted', () => {
          addList('My project 2');
          document.querySelectorAll('.lists .list')[5].click();
          document.querySelector('.lists .delete-btn').click();

          expect(document.querySelectorAll('.lists .list')[4].classList.contains('selected')).toBe(
            true,
          );
        });

        test('should transfer "selected" class to its lower sibling when deleted list is first', () => {
          addList('My project 2');
          addList('My project 3');
          addList('My project 4');
          document.querySelectorAll('.lists .list')[0].click();
          document.querySelectorAll('.lists .delete-btn')[0].click();

          expect(document.querySelectorAll('.lists .list')[0].classList.contains('selected')).toBe(
            true,
          );
        });
      });
    });
  });
});
