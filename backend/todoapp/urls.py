from django.urls import path
from . import views
from todoapp import views

urlpatterns = [
    path('branches/', views.get_branches),                 # 🔹 브랜치 목록 조회
    path('all-branches-files/', views.get_all_branch_files), # 🔹 모든 브랜치 목록 한 번에 조회
    path('files/all/', views.get_all_files_in_branch),      # 🔹 브랜치별 전체 파일 목록 조회회
    path('changed-files/', views.get_changed_files),        # 🔹 브랜치별 변경된 파일 목록 조회
    path('commit/', views.commit_message),                # 🔹 커밋 실행
    path('setup-user/', views.setup_git_user),  
    path('commits/', views.get_commit_history),             # 🔹 커밋 히스토리 조회
]