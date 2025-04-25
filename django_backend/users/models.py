# from django.db import models
# from django.conf import settings
# from django.conf import settings

<<<<<<< HEAD

# class UserProfile(models.Model):
#     user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
#     phone = models.CharField(max_length=20, blank=True)
#     dob = models.CharField(max_length=20, blank=True)
#     gender = models.CharField(max_length=20, blank=True)
#     stream = models.CharField(max_length=100, blank=True)
#     degree = models.CharField(max_length=100, blank=True)
#     course = models.CharField(max_length=100, blank=True)
#     state = models.CharField(max_length=100, blank=True)
#     city = models.CharField(max_length=100, blank=True)
#     college = models.CharField(max_length=100, blank=True)
#     role = models.CharField(max_length=50, blank=True)

#     def __str__(self):
#         return f"{self.user.email} Profile"



from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
=======
class UserProfile(models.Model):
    security_question = models.CharField(max_length=255, blank=True)
    security_answer = models.CharField(max_length=255, blank=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    dob = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    stream = models.CharField(max_length=100, blank=True)
    degree = models.CharField(max_length=100, blank=True)
    course = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    college = models.CharField(max_length=100, blank=True)
    role = models.CharField(max_length=50, blank=True)
>>>>>>> 3aaad65c89a9ab9f2a6beb4b9f2fff26ad610b1b

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True
