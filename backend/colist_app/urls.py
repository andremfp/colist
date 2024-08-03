from django.urls import path, re_path
from .views import index, ListsGetCreate, ListGetUpdateDelete, ItemsGetCreate, ItemGetUpdateDelete, UserCreate, UsersGet, UserGetDelete, UserLogin, UserLogout

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
    path('users/', UsersGet.as_view(), name='users-get'),

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
    path('users/<int:pk>/', UserGetDelete.as_view(), name='user-get-delete'),

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
    path('users/register/', UserCreate.as_view(), name='user-create'),

    # POST /api/users/login/
    # Payload:
    # {
    #   "username": "existing_user",
    #   "password": "existing_password"
    # }
    # Response:
    # {
    #   "id": 1,
    #   "username": "test_user",
    #   "access": "<access_token>"
    #   "refresh": "<refresh_token>"
    # }
    path('users/login/', UserLogin.as_view(), name='user-login'),

    # POST /api/users/logout/
    # Headers:
    #   Authorization: Bearer <access_token>
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
    #     "shared_with": [2, 3],
    #     "item_count": 2
    #   },
    #   {
    #     "id": 2,
    #     "name": "List 2",
    #     "owner": 1,
    #     "shared_with": [],
    #     "item_count": 5
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
    #   "shared_with": [1, 2, 3],
    #   "item_count": 0
    # }
    path('lists/', ListsGetCreate.as_view(), name='lists'),

    # GET /api/lists/<int:pk>/
    # Headers:
    #   Authorization: Bearer <access_token>
    # Response:
    # {
    #   "id": 1,
    #   "name": "List 1",
    #   "owner": 1,
    #   "shared_with": [2, 3],
    #   "item_count": 5
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
    #   "shared_with": [1, 2, 3],
    #   "item_count": 5
    # }
    #
    # DELETE /api/lists/<int:pk>/
    # Headers:
    #   Authorization: Bearer <access_token>
    # Response:
    # {
    #   "detail": "List deleted."
    # }
    path('lists/<int:pk>/', ListGetUpdateDelete.as_view(), name='list-get-update-delete'),


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
    path('lists/<int:list_id>/items/', ItemsGetCreate.as_view(), name='items-get-create'),

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
    path('lists/<int:list_id>/items/<int:pk>/', ItemGetUpdateDelete.as_view(), name='item-get-update-delete'),
]