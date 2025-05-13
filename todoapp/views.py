import subprocess
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def commit_message(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            message = data.get('message', '✅ 기본 커밋 메시지')
            subprocess.run(['git', 'add', '.'], check=True)
            subprocess.run(['git', 'commit', '-m', message], check=True)
            return JsonResponse({'status': 'success', 'message': message})
        except Exception as e:
            return JsonResponse({'status': 'fail', 'error': str(e)})
    return JsonResponse({'status': 'fail', 'reason': 'POST만 허용됩니다'}, status=405)

def get_commit_log(request):
    return JsonResponse({'message': '리포트 기능 준비 중입니다'})