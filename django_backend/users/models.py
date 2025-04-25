from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
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

    def __str__(self):
        return f"{self.user.username} Profile"

# Create your models here.
