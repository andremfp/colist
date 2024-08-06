from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from colist_app.models import CustomUser

ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'admin'


###############
#    ADMIN    #
###############
class ProjectTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(username='testuser', password='testpass123')

    def testAdminEndpoint(self):
        url = '/admin/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(response.url, '/admin/login/?next=/admin/')

        # Login and follow the redirect
        self.client.login(username=ADMIN_USERNAME, password=ADMIN_PASSWORD)
        response = self.client.get(response.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "Log in")
    
    def testTokenObtainPair(self):
        url = '/api/token/'
        data = {'username': 'testuser', 'password': 'testpass123'}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def testTokenRefresh(self):
        # First, obtain a token
        refresh = RefreshToken.for_user(self.user)
        
        url = '/api/token/refresh/'
        data = {'refresh': str(refresh)}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)