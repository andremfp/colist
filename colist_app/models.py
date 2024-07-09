from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser

# Custom User model required to make email unique in DB
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True, error_messages={'unique': 'A user with that email already exists.'})

class List(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    shared_with = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='shared_lists', blank=True)

    def __str__(self):
        return self.name

class ListItem(models.Model):
    name = models.CharField(max_length=255)
    list = models.ForeignKey(List, on_delete=models.CASCADE, related_name='items')
    added_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
