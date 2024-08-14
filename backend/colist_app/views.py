import logging
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.tokens import TokenError, Token
from django.contrib.auth import login, logout
from django.http import Http404
from django.shortcuts import render
from django.db.models import Count
from .serializers import ListSerializer, ListItemSerializer, UserSerializer, LoginSerializer
from .models import CustomUser, List, ListItem

logger = logging.getLogger(__name__)

def index(request):
    return render(request, 'index.html')

###############
#    USERS    #
###############
class UsersGet(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserCreate(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer

class UserGetDelete(generics.RetrieveDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

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

    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response({'error': 'No refresh token provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            if BlacklistedToken.objects.filter(token__jti=token['jti']).exists():
                return Response({'error': 'Token is already blacklisted'}, status=status.HTTP_400_BAD_REQUEST)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except TokenError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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