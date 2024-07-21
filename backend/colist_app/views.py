from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import login, logout
from django.http import Http404
from django.shortcuts import render
from django.db.models import Count
from .serializers import ListSerializer, ListItemSerializer, UserSerializer, LoginSerializer
from .models import CustomUser, List, ListItem

def index(request):
    return render(request, 'index.html')

###############
#    USERS    #
###############
class UsersGet(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

class UserCreate(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer

class UserGetDelete(generics.RetrieveDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

class UserLogin(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        user = CustomUser.objects.get(username=validated_data['username'])
        login(request, user)

        return Response({
            'id': user.id,
            'username': user.username,
            'access': validated_data['access'],
            'refresh': validated_data['refresh']
        }, status=status.HTTP_200_OK)

class UserLogout(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


###############
#    LISTS    #
###############
class ListsGetCreate(generics.ListCreateAPIView):
    serializer_class = ListSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = List.objects.annotate(item_count=Count('items'))

    def get_queryset(self):
        # Return lists owned by the authenticated user or shared with them
        return List.objects.filter(owner=self.request.user) | List.objects.filter(shared_with=self.request.user)


    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class ListGetUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = List.objects.all()
    serializer_class = ListSerializer
    permission_classes = [permissions.IsAuthenticated]


###############
#    ITEMS    #
###############
class ItemsGetCreate(generics.ListCreateAPIView):
    queryset = ListItem.objects.all()
    serializer_class = ListItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        list_id = self.kwargs['list_id']
        list = List.objects.filter(id=list_id).first()
        if not list:
            raise Http404('The specified list does not exist.')
        serializer.save(added_by=self.request.user, list=list)

    def get_queryset(self):
        list_id = self.kwargs['list_id']
        list = List.objects.filter(id=list_id).first()
        if not list:
            raise Http404('The specified list does not exist.')
        return ListItem.objects.filter(list_id=list.id)

    def finalize_response(self, request, response, *args, **kwargs):
        # Update item_count on related list after creating/deleting item
        list_id = self.kwargs['list_id']
        list_obj = List.objects.filter(id=list_id).first()
        if list_obj:
            list_obj.item_count = list_obj.items.count()
            list_obj.save()
        return super().finalize_response(request, response, *args, **kwargs)

class ItemGetUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = ListItem.objects.all()
    serializer_class = ListItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        list_id = self.kwargs['list_id']
        list = List.objects.filter(id=list_id).first()
        if not list:
            raise Http404('The specified list does not exist.')
        return ListItem.objects.filter(list_id=list.id)

    def finalize_response(self, request, response, *args, **kwargs):
        # Update item_count on related list after updating/deleting item
        list_id = self.kwargs['list_id']
        list_obj = List.objects.filter(id=list_id).first()
        if list_obj:
            list_obj.item_count = list_obj.items.count()
            list_obj.save()
        return super().finalize_response(request, response, *args, **kwargs)