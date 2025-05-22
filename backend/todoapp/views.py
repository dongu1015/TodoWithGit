import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from git import Repo
import os

@csrf_exempt
def setup_git_user(request): # 깃 유저 정보를 받는 api 주소
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_name = data.get('user_name')
            user_email = data.get('user_email')

            if not user_name or not user_email:
                return JsonResponse({'status': 'fail', 'reason': 'Name or Email missing'}, status=400)

            repo_path = 'C:/Users/KKR/Desktop/git_tutorial' 
            repo = Repo(repo_path)

            with repo.config_writer() as git_config:
                git_config.set_value("user", "name", user_name)
                git_config.set_value("user", "email", user_email)

            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'fail', 'error': str(e)}, status=500)

    return JsonResponse({'status': 'fail', 'reason': 'POST only'}, status=405)


@csrf_exempt
def get_branches(request):  # 브랜치 목록을 받는 api 주소
    if request.method == 'GET':
        try:
            repo_path = 'C:/Users/KKR/Desktop/git_tutorial'
            repo = Repo(repo_path)
            branches = [head.name for head in repo.heads]
            return JsonResponse({'branches': branches})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'fail', 'reason': 'GET only'}, status=405)

#추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가
@csrf_exempt
def get_all_branch_files(request): #모든 브랜치의 파일 목록을 한 번에 조회하는 API #필요할 거 같아서 넣음음
    if request.method == 'GET':
        try:
            repo = Repo('C:/Users/KKR/Desktop/git_tutorial')
            result = {}

            for head in repo.heads:
                repo.git.checkout(head.name)
                changed_files = [item.a_path for item in repo.index.diff(None)]
                untracked_files = repo.untracked_files
                total_files = changed_files + untracked_files
                result[head.name] = total_files

            return JsonResponse({'status': 'success', 'all_branches': result})
        except Exception as e:
            return JsonResponse({'status': 'fail', 'error': str(e)}, status=500)

    return JsonResponse({'status': 'fail', 'reason': 'GET only'}, status=405)


@csrf_exempt
def commit_message(request): #커밋 메시지를 요청하는는 api 주소소
    if request.method == 'POST':
        try:
            # 📦 JSON 데이터 파싱
            data = json.loads(request.body)
            git_type = data.get('git-type', 'Unknown')
            message = data.get('message', '✅ 기본 커밋 메시지')
            time = data.get('time', '')
            todo_title = data.get('todo_title', '')

            # 🧠 GitPython 저장소 설정
            repo_path = 'C:/Users/KKR/Desktop/git_tutorial'  # Git 저장소 경로
            repo = Repo(repo_path)

            # ✅ 변경사항 스테이징 (git add .)
            repo.git.add(A=True)

            # ✅ 커밋 실행
            repo.index.commit(message)

            print('--- 받은 데이터 ---')
            print(f"깃 타입: {git_type}")
            print(f"메시지: {message}")
            print(f"시간: {time}")
            print(f"할 일 제목: {todo_title}")
            print('--- 커밋 완료 ---')

            return JsonResponse({'status': 'success', 'received': data})
        
        except Exception as e:
            return JsonResponse({'status': 'fail', 'error': str(e)}, status=500)

    return JsonResponse({'status': 'fail', 'reason': 'POST만 허용됩니다'}, status=405)

#추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가
@csrf_exempt
def get_all_files_in_branch(request): #브랜치별 전체 파일 목록 조회 API
    if request.method == 'GET':
        try:
            branch = request.GET.get('branch', 'main')
            repo_path = 'C:/Users/KKR/Desktop/git_tutorial'
            repo = Repo(repo_path)

            if branch in repo.heads:
                repo.git.checkout(branch)
            else:
                return JsonResponse({'status': 'fail', 'reason': f'브랜치 {branch} 없음'}, status=400)

            # 전체 파일 리스트
            files = []
            for item in repo.tree().traverse():
                if item.type == 'blob':
                    files.append(item.path)

            return JsonResponse({'status': 'success', 'branch': branch, 'files': files})
        except Exception as e:
            return JsonResponse({'status': 'fail', 'error': str(e)}, status=500)
    return JsonResponse({'status': 'fail', 'reason': 'GET only'}, status=405)

#추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가
@csrf_exempt
def get_changed_files(request): #브랜치별 변경된 파일 목록 조회 API
    if request.method == 'GET':
        try:
            branch = request.GET.get('branch')
            repo_path = 'C:/Users/KKR/Desktop/git_tutorial'
            repo = Repo(repo_path)

            # 브랜치 이동
            if branch in repo.heads:
                repo.git.checkout(branch)
            else:
                return JsonResponse({'status': 'fail', 'reason': '해당 브랜치 없음'}, status=400)

            # 변경 파일 목록 가져오기
            changed_files = [item.a_path for item in repo.index.diff(None)]
            untracked_files = repo.untracked_files
            total_files = changed_files + untracked_files

            return JsonResponse({'status': 'success', 'branch': branch, 'files': total_files})
        except Exception as e:
            return JsonResponse({'status': 'fail', 'error': str(e)}, status=500)

    return JsonResponse({'status': 'fail', 'reason': 'GET only'}, status=405)


#추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가추가
@csrf_exempt
def get_commit_history(request):
    if request.method == 'GET':
        try:
            branch = request.GET.get('branch', 'main')
            repo_path = 'C:/Users/KKR/Desktop/git_tutorial'
            repo = Repo(repo_path)

            if branch in repo.heads:
                repo.git.checkout(branch)
            else:
                return JsonResponse({'status': 'fail', 'error': f'브랜치 {branch} 없음'}, status=400)

            commits = []
            for commit in repo.iter_commits(branch, max_count=10):
                commits.append({
                    'message': commit.message.strip(),
                    'author': commit.author.name,
                    'date': commit.committed_datetime.strftime('%Y-%m-%d %H:%M:%S')
                })

            return JsonResponse({'status': 'success', 'branch': branch, 'commits': commits})
        except Exception as e:
            return JsonResponse({'status': 'fail', 'error': str(e)}, status=500)
    return JsonResponse({'status': 'fail', 'reason': 'GET only'}, status=405)


def get_commit_log(request):
    return JsonResponse({'message': '리포트 기능 준비 중입니다'})
