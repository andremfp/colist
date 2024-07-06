from django.db import models
from django.contrib.auth.models import User

class List(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    shared_with = models.ManyToManyField(User, related_name='shared_lists', blank=True)

    def __str__(self):
        return self.name

class ListItem(models.Model):
    name = models.CharField(max_length=255)
    list = models.ForeignKey(List, on_delete=models.CASCADE, related_name='items')
    added_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
