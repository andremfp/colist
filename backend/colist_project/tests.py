from rest_framework.test import APIClient, APITestCase
from rest_framework import status

ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'admin'


###############
#    ADMIN    #
###############
class ProjectTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

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