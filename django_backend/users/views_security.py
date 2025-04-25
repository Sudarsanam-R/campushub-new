from django.http import JsonResponse
from django.contrib.auth.models import User
from .models import UserProfile
from django.views.decorators.csrf import csrf_exempt
import json

def get_security_question(request):
    email = request.GET.get('email')
    try:
        user = User.objects.get(email=email)
        profile = user.profile
        return JsonResponse({'security_question': profile.security_question})
    except (User.DoesNotExist, UserProfile.DoesNotExist):
        return JsonResponse({'error': 'User not found'}, status=404)

@csrf_exempt
def verify_security_answer(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        answer = data.get('security_answer')
        try:
            user = User.objects.get(email=email)
            profile = user.profile
            if profile.security_answer.strip().lower() == answer.strip().lower():
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'success': False, 'error': 'Incorrect answer'}, status=400)
        except (User.DoesNotExist, UserProfile.DoesNotExist):
            return JsonResponse({'error': 'User not found'}, status=404)
