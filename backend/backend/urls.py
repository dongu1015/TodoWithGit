"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from todoapp.views import commit_message, get_commit_log, setup_git_user, get_branches, set_repo_path, setup_git_user, set_remote, push_to_remote # ✅ todoapp.views 에서 import

# 지금 여기는 데이터를 받아오는 api 주소를 추가해주는 거임
# 19번 줄 보면 todoapp.views 안에 있는 각 함수들을 가져와서
# 쟤네들의 함수가 실행되기 위한 정보를 받아올 주소를 추가해주는 거임
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('todoapp.urls')),
    path('commit/', commit_message, name='commit_message'),   # 커밋 메시지를 받는 api 주소 추가
    path('report/', get_commit_log, name='get_commit_log'),    # 이건 너가 만든거라서 뭔지 모르겠음
    path('setup-user/', setup_git_user, name='setup_git_user'),  # 깃 유저 정보를 받는 api 주소 추가
    path('set-repo-path/', set_repo_path, name='set_repo_path'), # 🔹 저장소 경로 설정
    path('get-branches/', get_branches, name='get_branches'),  # 브랜치 목록을 받는 api 주소 추가
    path('set-remote/', set_remote, name='set_remote'),  # 리모트 저장소 설정 api 주소 추가
    path('push/', push_to_remote, name='push_to_remote'),  # 푸시 api 주소 추가
]