from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [

    #########################
    #    ADMIN ENDPOINTS    #
    #########################

    # GET /admin/
    path('admin/', admin.site.urls),

    
    #########################
    #    API ENDPOINTS    #
    #########################

    # * /api/<app_endpoint>
    path('api/', include('colist_app.urls')),

    
    #########################
    #     JWT ENDPOINTS     #
    #########################

    # POST /api/token/
    # Payload:
    # {
    #   "username": "example_user",
    #   "password": "example_password"
    # }
    # Response:
    # {
    #   "refresh": "refresh_token_here",
    #   "access": "access_token_here"
    # }
    path('api/token/', TokenObtainPairView.as_view(), name='token-pair-get'),

    # POST /api/token/refresh/
    # Payload:
    # {
    #   "refresh": "refresh_token_here"
    # }
    # Response:
    # {
    #   "access": "new_access_token_here"
    # }
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    #=== REACT APP ENDPOINTS ===#
    # path('', TemplateView.as_view(template_name='index.html')),
]
