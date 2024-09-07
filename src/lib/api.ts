// import { jwtDecode } from "jwt-decode";

// import { goto } from '$app/navigation';
import type { List, ListItem, UserData } from './types';
import { db, auth } from './firebase';
import {
	collection,
	doc,
	getDocs,
	getDoc,
	addDoc,
	updateDoc,
	deleteDoc,
	query,
	where
} from 'firebase/firestore';

// interface JwtPayload {
//     exp: number;
//     // Add other fields from your JWT payload as needed
// }

//------------------
// Firebase

// Fetch all items from a Firestore collection
export async function fetchLists(): Promise<List[]> {
	const userId = auth.currentUser?.uid;

	const listsCollection = collection(db, 'lists');

	// Query for lists where the user is the owner
	const ownerQuery = query(listsCollection, where('ownerId', '==', userId));

	// Query for lists where the user is in the sharedWith array
	const sharedWithQuery = query(listsCollection, where('sharedBy', 'array-contains', userId));

	// Execute both queries
	const [ownerSnapshot, sharedWithSnapshot] = await Promise.all([
		getDocs(ownerQuery),
		getDocs(sharedWithQuery)
	]);

	// Combine the results and remove duplicates (if any)
	const lists = [
		...ownerSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as List),
		...sharedWithSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as List)
	];

	// Optionally, you can remove duplicates based on the list id
	const uniqueLists = Array.from(new Map(lists.map((list) => [list.id, list])).values());

	return uniqueLists;
}

// Fetch a single list by ID from a Firestore collection
export async function fetchListById(listId: string): Promise<List> {
	const listDoc = doc(db, 'lists', listId);
	const listSnapshot = await getDoc(listDoc);

	return listSnapshot.data() as List;
}

// Add a new list to a Firestore collection
export async function addList(newList: {
	name: string;
	ownerId: string;
	sharedBy: string[];
}): Promise<List> {
	const listsCollection = collection(db, 'lists');
	const docRef = await addDoc(listsCollection, {
		...newList,
		itemCount: 0
	});
	const addedList: List = {
		id: docRef.id,
		...newList,
		itemCount: 0
	};
	return addedList;
}

// Update an existing list in a Firestore collection
export async function updateList(listId: string, updatedList: Partial<List>) {
	const listDoc = doc(db, 'lists', listId);
	await updateDoc(listDoc, updatedList);
	return { id: listId };
}

// Delete a list from a Firestore collection
export async function deleteList(listId: string) {
	const listDoc = doc(db, 'lists', listId);
	await deleteDoc(listDoc);
	return { id: listId };
}

// Fetch all items in a specific list from Firestore
export async function fetchListItems(listId: string): Promise<ListItem[]> {
	const listItemsCollection = collection(db, 'listItems');

	// Query for lists where the user is the owner
	const listItemsQuery = query(listItemsCollection, where('listId', '==', listId));

	// Execute the query
	const listItemsSnapshot = await getDocs(listItemsQuery);

	return listItemsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ListItem);
}

// Add a new item to a list in Firestore
export async function addListItem(newItem: Omit<ListItem, 'id'>): Promise<ListItem> {
	const listItemsCollection = collection(db, 'listItems');
	const docRef = await addDoc(listItemsCollection, {
		...newItem,
		checked: false
	});
	const addedListItem: ListItem = {
		id: docRef.id,
		...newItem,
		checked: false
	};
	return addedListItem;
}

// Update an existing list item in Firestore
export async function updateListItem(
	itemId: string,
	updatedItem: Partial<ListItem>
): Promise<string> {
	const itemDoc = doc(db, 'listItems', itemId);
	await updateDoc(itemDoc, updatedItem);
	return itemId;
}

// Delete a list item from Firestore
export async function deleteListItem(itemId: string) {
	const itemDoc = doc(db, 'listItems', itemId);
	await deleteDoc(itemDoc);
	return { id: itemId };
}

export async function fetchAllUserProfilesExceptCurrent(
	currentUserId: string
): Promise<UserData[]> {
	const userProfilesCollection = collection(db, 'users');
	const userQuery = query(userProfilesCollection, where('id', '!=', currentUserId));
	const userSnapshot = await getDocs(userQuery);

	return userSnapshot.docs.map((doc) => ({
		id: doc.data().id,
		email: doc.data().email,
		name: doc.data().name,
		createdAt: doc.data().createdAt
	}));
}

export async function fetchUserById(userId: string): Promise<UserData> {
	const userDoc = doc(db, 'users', userId);
	console.log(userDoc);
	const userSnapshot = await getDoc(userDoc);
	return userSnapshot.data() as UserData;
}
