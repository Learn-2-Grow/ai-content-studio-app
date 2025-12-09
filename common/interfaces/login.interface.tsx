
export interface LoginResponse {
    user: {
        _id: string;
        name: string;
        email: string;
    };
    tokens: {
        access: string;
        refresh: string;
    };
}