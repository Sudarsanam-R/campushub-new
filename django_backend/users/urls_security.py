from django.urls import path
from .views_security import get_security_question, verify_security_answer

urlpatterns = [
    path('api/get-security-question/', get_security_question, name='get_security_question'),
    path('api/verify-security-answer/', verify_security_answer, name='verify_security_answer'),
]
