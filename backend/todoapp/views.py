import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def setup_git_user(request): # 깃 유저 정보를 받는 api 주소
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_name = data.get('user_name')
            user_email = data.get('user_email')

            if not user_name or not user_email:
                return JsonResponse({'status': 'fail', 'reason': 'Name or Email missing'}, status=400)

            #출력만 하는 거임 여기에 나중에 gitpython으로 깃 유저 설정하는 코드 넣으면 됨
            print('--- 받은 Git 사용자 정보 ---')
            print(f"사용자 이름: {user_name}")
            print(f"사용자 이메일: {user_email}")
            print('-------------------------')

            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'fail', 'error': str(e)}, status=500)

    return JsonResponse({'status': 'fail', 'reason': 'POST only'}, status=405)

@csrf_exempt
def get_branches(request): # 브랜치 목록을 받는 api 주소
    if request.method == 'GET':
        # 여기서 지금은 더미 데이터 리턴 너가 나중에 gitpython으로 브랜치 목록을 가져오는 코드 넣으면 됨
        branches = [
            'main',
            'develop',
            'feature/todo-check'
        ]
        return JsonResponse({'branches': branches})
    return JsonResponse({'status': 'fail', 'reason': 'GET only'}, status=405)

@csrf_exempt
def commit_message(request): # 커밋 메시지를 받는 api 주소
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            git_type = data.get('git-type', 'Unknown')  # 이건 지금 알 수 없음이라고 더미데이터를 넣어준거임 초기에 그냥 기본값으로 넣어준거
            branch = data.get('branch', 'Unknown')  # 기본 브랜치 이름을 'main'으로 설정
            message = data.get('message', 'Unknown')
            time = data.get('time', 'Unknown')
            todo_title = data.get('todo_title', 'Unknown')

            # 받은 데이터 프린트
            print('--- 받은 데이터 ---')
            print(f"깃 타입: {git_type}")     # 여기서 타입이 어떤건지 추가된걸 확인한거임
            print(f"선택된 브랜치: {branch}")
            print(f"메시지: {message}")
            print(f"시간: {time}")
            print(f"할 일 제목: {todo_title}")
            print('--------------------')

            return JsonResponse({'status': 'success', 'received': data})
        except Exception as e:
            return JsonResponse({'status': 'fail', 'error': str(e)})
    return JsonResponse({'status': 'fail', 'reason': 'POST만 허용됩니다'}, status=405)



def get_commit_log(request):
    return JsonResponse({'message': '리포트 기능 준비 중입니다'})
