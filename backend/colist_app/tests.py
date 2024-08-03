from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from django.urls import reverse
from .models import CustomUser, List, ListItem
import json

TEST_ADMIN_USERNAME = 'adminuser'
TEST_ADMIN_PASSWORD = 'adminpassword'
TEST_ADMIN_EMAIL = 'admin@example.com'
TEST_USER_USERNAME = 'testuser'
TEST_USER_PASSWORD = 'testpassword'
TEST_USER_EMAIL = 'test@example.com'
TEST_LIST_1_NAME = 'Test List 1'
TEST_LIST_2_NAME = 'Test List 2'

###############
#   HELPERS   #
###############

def assertUserDetail(testCase, userData, id, username, email):
    testCase.assertEqual(userData['id'], id)
    testCase.assertEqual(userData['username'], username)
    testCase.assertEqual(userData['email'], email)

def assertListDetail(testCase, listData, id, name, owner, sharedWith, itemCount):
    testCase.assertEqual(listData['id'], id)
    testCase.assertEqual(listData['name'], name)
    testCase.assertEqual(listData['owner'], owner)
    testCase.assertEqual(listData['shared_with'], sharedWith)
    testCase.assertEqual(listData['item_count'], itemCount)

def assertListItemDetail(testCase, listItemData, id, name, listId, addedBy):
    testCase.assertEqual(listItemData['id'], id)
    testCase.assertEqual(listItemData['name'], name)
    testCase.assertEqual(listItemData['list_id'], listId)
    testCase.assertEqual(listItemData['added_by'], addedBy)


###############
#    USERS    #
###############
class AdminUserTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        # setup admin and test user and auth for tests
        self.testAdminUser = CustomUser.objects.create_superuser(
            username=TEST_ADMIN_USERNAME, email=TEST_ADMIN_EMAIL, password=TEST_ADMIN_PASSWORD
        )
        self.testUser = CustomUser.objects.create_user(
            username=TEST_USER_USERNAME, email=TEST_USER_EMAIL, password=TEST_USER_PASSWORD
        )

        response = self.client.post(reverse('token-pair-get'), {'username': TEST_ADMIN_USERNAME, 'password': TEST_ADMIN_PASSWORD}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.access_token = response.data['access']
        self.refresh_token = response.data['refresh']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def testListUsers(self):
        url = reverse('users-get')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        expectedUsers = [
            (1, TEST_ADMIN_USERNAME, TEST_ADMIN_EMAIL),
            (2, TEST_USER_USERNAME, TEST_USER_EMAIL)
        ]

        for i, expectedUser in enumerate(expectedUsers):
            with self.subTest(i=i):
                assertUserDetail(self, response.data[i], *expectedUser)

    def testGetUserDetail(self):
        url = reverse('user-get-delete', kwargs={'pk': self.testUser.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assertUserDetail(self, response.data, 2, TEST_USER_USERNAME, TEST_USER_EMAIL)
    
    def testGetInvalidUserDetail(self):
        url = reverse('user-get-delete', kwargs={'pk': 999})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def testDeleteUserDetail(self):
        url = reverse('user-get-delete', kwargs={'pk': self.testUser.pk})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def testDeleteInvalidUserDetail(self):
        url = reverse('user-get-delete', kwargs={'pk': 999})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def tearDown(self):
        self.client.credentials()

class UserTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        # setup test user and auth for tests
        self.testUser = CustomUser.objects.create_user(
            username=TEST_USER_USERNAME, email=TEST_USER_EMAIL, password=TEST_USER_PASSWORD
        )

        response = self.client.post(reverse('token-pair-get'), {'username': TEST_USER_USERNAME, 'password': TEST_USER_PASSWORD}, format='json')
        self.assertEqual(response.status_code, 200)
        self.access_token = response.data['access']
        self.refresh_token = response.data['refresh']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def testForbiddenUserList(self):
        url = reverse('users-get')
        response = self.client.get(url)

        # regular user should not be able to access admin endpoints
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def testForbiddenUserDetail(self):
        url = reverse('user-get-delete', kwargs={'pk': self.testUser.pk})
        response = self.client.get(url)

        # regular user should not be able to access admin endpoints
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def testUserRegister(self):
        url = reverse('user-create')
        data = {
            'username': 'new_user',
            'email': 'new_user@example.com',
            'password': 'password123'
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        assertUserDetail(self, response.data, 2, 'new_user', 'new_user@example.com')

    def testUserLogin(self):
        url = reverse('user-login')
        data = {
            'username': TEST_USER_USERNAME,
            'password': TEST_USER_PASSWORD
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], 1)
        self.assertEqual(response.data['username'], TEST_USER_USERNAME)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def testUserLogout(self):
        url = reverse('user-logout')
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def testUserGetAndRefreshToken(self):        
        url = reverse('token-refresh')
        data = {
            'refresh': self.refresh_token
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('refresh', response.data)

    def tearDown(self):
       self.client.credentials()


###############
#    LISTS    #
###############
class ListTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        # setup test and shared user and auth for tests
        self.testUser = CustomUser.objects.create_user(
            username=TEST_USER_USERNAME, email=TEST_USER_EMAIL, password=TEST_USER_PASSWORD
        )
        self.share_user = CustomUser.objects.create_user(
             username='shareduser', password='sharedpass'
        )

        # setup lists for tests
        self.testList1 = List.objects.create(
            name=TEST_LIST_1_NAME, owner=self.testUser
        )
        self.testList1.shared_with.add(self.share_user)

        self.testList2 = List.objects.create(
            name=TEST_LIST_2_NAME, owner=self.share_user
        )
        self.testList2.shared_with.add(self.testUser)

        response = self.client.post(reverse('token-pair-get'), {'username': TEST_USER_USERNAME, 'password': TEST_USER_PASSWORD}, format='json')
        self.assertEqual(response.status_code, 200)
        self.access_token = response.data['access']
        self.refresh_token = response.data['refresh']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def testGetLists(self):
        url = reverse('lists')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        expectedLists = [
            (1, TEST_LIST_1_NAME, 1, [2], 0),
            (2, TEST_LIST_2_NAME, 2, [1], 0)
        ]

        for i, expectedList in enumerate(expectedLists):
            with self.subTest(i=i):
                assertListDetail(self, response.data[i], *expectedList)

    def testCreateList(self):
        url = reverse('lists')
        data = {
            'name': 'Test List 3',
            'shared_with': [self.share_user.id]
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        assertListDetail(self, response.data, 3, 'Test List 3', 1, [2], 0)

    def testGetListDetail(self):
        url = reverse('list-get-update-delete', args=[self.testList1.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assertListDetail(self, response.data, 1, TEST_LIST_1_NAME, 1, [2], 0)
    
    def testGetInvalidListDetail(self):
        url = reverse('list-get-update-delete', args=[999])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def testListUpdate(self):
        url = reverse('list-get-update-delete', args=[self.testList1.id])
        data = {
            'name': 'Updated Test List 1',
            'shared_with': []
        }
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assertListDetail(self, response.data, 1, 'Updated Test List 1', 1, [], 0)

    def testUpdateInvalidList(self):
        url = reverse('list-get-update-delete', args=[999])
        data = {
            'name': 'Updated Test List 1',
            'shared_with': []
        }
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def testListDelete(self):
        url = reverse('list-get-update-delete', args=[self.testList2.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def testDeleteInvalidList(self):
        url = reverse('list-get-update-delete', args=[999])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def tearDown(self):
       self.client.credentials()


###############
#    ITEMS    #
###############
class ListItemsTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        # setup test and shared user and auth for tests
        self.testUser = CustomUser.objects.create_user(
            username=TEST_USER_USERNAME, email=TEST_USER_EMAIL, password=TEST_USER_PASSWORD
        )

        # setup list with items for tests
        self.testList = List.objects.create(
            name=TEST_LIST_1_NAME, owner=self.testUser
        )

        self.listItem = ListItem.objects.create(
            name='Test Item 1',
            list=self.testList,
            added_by=self.testUser
        )

        response = self.client.post(reverse('token-pair-get'), {'username': TEST_USER_USERNAME, 'password': TEST_USER_PASSWORD}, format='json')
        self.assertEqual(response.status_code, 200)
        self.access_token = response.data['access']
        self.refresh_token = response.data['refresh']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def testGetListItems(self):
        url = reverse('items-get-create', args=[self.testList.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1) 
        assertListItemDetail(self, response.data[0], 1, 'Test Item 1', 1, 1)

    def testGetListItemsInvalidList(self):
        url = reverse('items-get-create', args=[999])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('The specified list does not exist.', response.data['detail'])

    def testCreateListItem(self):
        url = reverse('items-get-create', args=[self.testList.id])
        data = {
            'name': 'Test Item 2',
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        assertListItemDetail(self, response.data, 2, 'Test Item 2', 1, 1)

    def testCreateListItem(self):
        url = reverse('items-get-create', args=[999])
        data = {
            'name': 'Test Item 2',
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('The specified list does not exist.', response.data['detail'])

    def testGetListItemDetail(self):
        url = reverse('item-get-update-delete', args=[self.testList.id, self.listItem.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assertListItemDetail(self, response.data, 1, 'Test Item 1', 1, 1)
    
    def testUpdateListItem(self):
        url = reverse('item-get-update-delete', args=[self.testList.id, self.listItem.id])
        data = {
            'name': 'Updated Test Item 1',
        }
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assertListItemDetail(self, response.data, 1, 'Updated Test Item 1', 1, 1)

    def testDeleteListItem(self):
        url = reverse('item-get-update-delete', args=[self.testList.id, self.listItem.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def tearDown(self):
        self.client.credentials()