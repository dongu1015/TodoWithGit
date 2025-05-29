/**
 * 애플리케이션의 진입점
 * 할 일 관리 애플리케이션을 초기화하고 실행
 */
import 'regenerator-runtime/runtime';
import todoController from './modules/todo.controller';
import './styles/main.scss';

// 앱 초기화 실행
todoController.init();
