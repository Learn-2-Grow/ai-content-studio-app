export const getUser = () => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const setUser = (user: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
};

export const removeUser = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
};