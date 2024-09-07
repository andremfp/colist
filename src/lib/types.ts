export interface UserData {
	id: string;
	name: string;
	email: string;
	createdAt: Date;
}

export interface List {
	id: string;
	name: string;
	ownerId: string;
	sharedBy: string[];
	itemCount: number;
}

export interface ListItem {
	id: string;
	name: string;
	listId: string;
	addedBy: string;
	checked: boolean;
}
