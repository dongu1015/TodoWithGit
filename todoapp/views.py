import subprocess
from django.http import JsonResponse
import json

def commit_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        msg = data.get('message', '기본 메시지')

        try:
            subprocess.run(['git', 'add', '.'])
            subprocess.run(['git', 'commit', '-m', msg])
            return JsonResponse({'result': 'success'})
        except Exception as e:
            return JsonResponse({'result': 'error', 'detail': str(e)})