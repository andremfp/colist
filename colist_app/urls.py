from django.urls import path
from .views import ListItemListCreate, ListItemDetail, UserCreate, UserLogin, UserLogout

urlpatterns = [
    #=== USERS ENDPOINTS ===#
    # POST /api/users/register/
    # Payload:
    # {
    #   "username": "new_user",
    #   "email": "new_user@example.com",
    #   "password": "password123"
    # }
    path('users/register/', UserCreate.as_view(), name='user-register'),

    # POST /api/users/login/
    # Payload:
    # {
    #   "username": "existing_user",
    #   "password": "existing_password"
    # }
    #Response:
    # {
    #   "user_id": 1,
    #   "username": "test_user",
    #   "token": "<token>"
    # }
    path('users/login/', UserLogin.as_view(), name='user-login'),

    # POST /api/users/logout/
    path('users/logout/', UserLogout.as_view(), name='user-logout'),

    #=== ITEMS ENDPOINTS ===#
    # GET /api/items/
    # Response: List of items
    #
    # POST /api/items/
    # Payload:
    # {
    #   "name": "New Item Name",
    #   "user": 1
    #   "shared_with": [1, 2, 3]  // Optional: List of user IDs to share the item with
    # }
    # Response:
    # {
    #   "id": 1,
    #   "name": "Item 1",
    #   "user": 2,
    #   "shared_with": [1]
    # }
    path('items/', ListItemListCreate.as_view(), name='list-create-items'),

    # GET /api/items/<int:pk>/
    # Response: Details of the specific item
    path('items/<int:pk>/', ListItemDetail.as_view(), name='item-detail'),
]
