from django.urls import path
from . import views

urlpatterns = [
    path('commit/', views.commit_message),
    # path('report/', views.get_commit_log),
    # path('report-gen/', views.generate_report_api),
]