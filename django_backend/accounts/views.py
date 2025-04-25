from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_protect
from django.core.exceptions import ValidationError
from django.contrib.auth import password_validation
from django.core.validators import validate_email

@csrf_protect  # Use CSRF protection instead of csrf_exempt
def register_view(request):
    if request.method == "POST":
        # Get the posted data
        username = request.POST.get('username')
        password = request.POST.get('password')
        email = request.POST.get('email')

        # Basic validation
        if not username or not password or not email:
            return JsonResponse({"message": "All fields are required."}, status=400)

        # Check if email is valid
        try:
            validate_email(email)
        except ValidationError:
            return JsonResponse({"message": "Invalid email address."}, status=400)

        # Validate password
        try:
            password_validation.validate_password(password)
        except ValidationError as e:
            return JsonResponse({"message": f"Password error: {', '.join(e.messages)}"}, status=400)

        # Create the user if all validation passes
        try:
            user = User.objects.create_user(username=username, password=password, email=email)
            return JsonResponse({"message": "User created successfully!"}, status=201)
        except Exception as e:
            return JsonResponse({"message": f"Error creating user: {str(e)}"}, status=500)

    return JsonResponse({"message": "Invalid method. Only POST is allowed."}, status=405)
