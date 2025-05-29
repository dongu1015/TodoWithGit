# 📝 TodoWithGit

대구대학교 오픈소스 소프트웨어 강의 프로젝트입니다.
간단한 Git 학습용 프로젝트입니다. 백엔드와 프론트엔드를 나눠 개발 후 main 브랜치에 통합하였습니다.
팀원 (김기룡/강동원원)

> 본 프로젝트는 [TodoMVC-Vanilla-ES6](https://github.com/tarhi-saad/TodoMVC-Vanilla-ES6) 오픈소스를 포크하여 개발되었습니다.

---

## 기능
- ✅ Todo 생성 / 삭제 / 완료
- Git 연동을 통한 커밋/브랜치 선택 기능
- Git Push 기능 내장

---

## 기술 스택
- 프론트엔드: HTML, CSS, JS (Vanilla)
- 백엔드: Django
- Git 연동: GitPython

---

## 실행 방법

```bash
- 백엔드 서버
pip install -r requirements.txt
python manage.py runserver

- 프론트엔드 서버
npm install 
npm run start 
(자동으로 웹이 렌더링됩니다.)
