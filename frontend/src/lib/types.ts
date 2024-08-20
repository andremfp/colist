export interface RegisterData {
    username: string;
    email: string;
    password: string;
}

export interface LoginPayloadData {
    username: string;
    password: string;
}

export interface LoginResponseData {
    id: number;
    username: string;
    access: string;
    refresh: string;
}

export interface DeleteResponseData {
    detail: string;
}

export interface UserData {
    id: number;
    username: string;
    email: number;
}

export interface ListPayloadData {
    name: string;
    shared_with: number[];
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
    checked: boolean;
}