from django.urls import path
from .views import ListCreate, ListDetail, ListItemListCreate, ListItemDetail, UserCreate, UserList, UserDetail, UserLogin, UserLogout

urlpatterns = [
    #########################
    #    USERS ENDPOINTS    #
    #########################
    
    # GET /api/users/
    # Headers:
    #   Authorization: Bearer <access_token>
    # Response:
    # [
    #   {
    #     "id": 1,
    #     "username": "user1",
    #     "email": "user1@example.com"
    #   },
    #   {
    #     "id": 2,
    #     "username": "user2",
    #     "email": "user2@example.com"
    #   }
    # ]
    path('users/', UserList.as_view(), name='user-list'),

    # GET /api/users/<int:pk>/
    # Headers:
    #   Authorization: Bearer <access_token>
    # Response:
    # {
    #   "id": 1,
    #   "username": "user1",
    #   "email": "user1@example.com"
    # }
    #
    # DELETE /api/users/<int:pk>/
    # Headers:
    #   Authorization: Bearer <access_token>
    # Response:
    # {
    #   "detail": "User deleted."
    # }
    path('users/<int:pk>/', UserDetail.as_view(), name='user-detail'),

    # POST /api/users/register/
    # Payload:
    # {
    #   "username": "new_user",
    #   "email": "new_user@example.com",
    #   "password": "password123"
    # }
    # Response:
    # {
    #   "id": 1,
    #   "username": "new_user",
    #   "email": "new_user@example.com"
    # }
    path('users/register/', UserCreate.as_view(), name='user-register'),

    # POST /api/users/login/
    # Payload:
    # {
    #   "username": "existing_user",
    #   "password": "existing_password"
    # }
    # Response:
    # {
    #   "user_id": 1,
    #   "username": "test_user",
    #   "token": "<token>"
    # }
    path('users/login/', UserLogin.as_view(), name='user-login'),

    # POST /api/users/logout/
    # Headers:
    #   Authorization: Bearer <access_token>
    # Response:
    # {
    #   "detail": "Successfully logged out."
    # }
    path('users/logout/', UserLogout.as_view(), name='user-logout'),


    #########################
    #    LISTS ENDPOINTS    #
    #########################

    # GET /api/lists/
    # Headers:
    #   Authorization: Bearer <access_token>
    # Response:
    # [
    #   {
    #     "id": 1,
    #     "name": "List 1",
    #     "owner": 1,
    #     "shared_with": [2, 3]
    #   },
    #   {
    #     "id": 2,
    #     "name": "List 2",
    #     "owner": 1,
    #     "shared_with": []
    #   }
    # ]
    #
    # POST /api/lists/
    # Headers:
    #   Authorization: Bearer <access_token>
    # Payload:
    # {
    #   "name": "New List Name",
    #   "shared_with": [1, 2, 3]  // Optional
    # }
    # Response:
    # {
    #   "id": 3,
    #   "name": "New List Name",
    #   "owner": 1,
    #   "shared_with": [1, 2, 3]
    # }
    path('lists/', ListCreate.as_view(), name='list-create'),

    # GET /api/lists/<int:pk>/
    # Headers:
    #   Authorization: Bearer <access_token>
    # Response:
    # {
    #   "id": 1,
    #   "name": "List 1",
    #   "owner": 1,
    #   "shared_with": [2, 3]
    # }
    #
    # PUT /api/lists/<int:pk>/
    # Headers:
    #   Authorization: Bearer <access_token>
    # Payload:
    # {
    #   "name": "Updated List Name",
    #   "shared_with": [1, 2, 3]  // Optional
    # }
    # Response:
    # {
    #   "id": 1,
    #   "name": "Updated List Name",
    #   "owner": 1,
    #   "shared_with": [1, 2, 3]
    # }
    #
    # DELETE /api/lists/<int:pk>/
    # Headers:
    #   Authorization: Bearer <access_token>
    # Response:
    # {
    #   "detail": "List deleted."
    # }
    path('lists/<int:pk>/', ListDetail.as_view(), name='list-detail'),


    #########################
    #    ITEMS ENDPOINTS    #
    #########################

    # GET /api/lists/<int:list_id>/items/
    # Headers:
    #   Authorization: Bearer <access_token>
    # Response:
    # [
    #   {
    #     "id": 1,
    #     "name": "Milk",
    #     "list_id": 1,
    #     "added_by": 1
    #   },
    #   {
    #     "id": 2,
    #     "name": "Eggs",
    #     "list_id": 1,
    #     "added_by": 1
    #   }
    # ]
    #
    # POST /api/lists/<int:list_id>/items/
    # Headers:
    #   Authorization: Bearer <access_token>
    # Payload:
    # {
    #   "name": "New Item Name"
    # }
    # Response:
    # {
    #   "id": 3,
    #   "name": "New Item Name",
    #   "list_id": 1,
    #   "added_by": 1
    # }
    path('lists/<int:list_id>/items/', ListItemListCreate.as_view(), name='listitem-list-create'),

    # GET /api/lists/<int:list_id>/items/<int:pk>/
    # Headers:
    #   Authorization: Bearer <access_token>
    # Response:
    # {
    #   "id": 1,
    #   "name": "Milk",
    #   "list_id": 1,
    #   "added_by": 1
    # }
    #
    # PUT /api/lists/<int:list_id>/items/<int:pk>/
    # Headers:
    #   Authorization: Bearer <access_token>
    # Payload:
    # {
    #   "name": "Updated Item Name"
    # }
    # Response:
    # {
    #   "id": 1,
    #   "name": "Updated Item Name",
    #   "list_id": 1,
    #   "added_by": 1
    # }
    #
    # DELETE /api/lists/<int:list_id>/items/<int:pk>/
    # Headers:
    #   Authorization: Bearer <access_token>
    # Payload:
    # {
    #
    # }
    # Response:
    # {
    #   "detail": "Item deleted."
    # }
    path('lists/<int:list_id>/items/<int:pk>/', ListItemDetail.as_view(), name='listitem-detail'),
]
