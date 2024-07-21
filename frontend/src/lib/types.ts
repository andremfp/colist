export interface RegisterData {
    username: string;
    email: string;
    password: string;
}

export interface LoginData {
    username: string;
    password: string;
}

export interface ListData {
    id: number;
    name: string;
    owner: number;
    shared_with: number[];
    item_count: number;
    items: ListItemData[];
}

export interface ListItemData {
    id: number;
    name: string;
    list_id: number;
    added_by: number;
}