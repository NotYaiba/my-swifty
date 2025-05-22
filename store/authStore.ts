import {create} from 'zustand';

// Define the types for the store's state
interface AuthState {
    token: string | null;
    refreshToken: string | null;
    logedIn: boolean;
    setLogedIn: (logedIn: boolean) => void;
    userProfile: UserProfile | null;
    logOut : () => void;

}

// Define the types for the user profile data
interface UserProfile {
    id: number;
    name: string;
    email: string;


}

// Define the types for the store's actions
interface AuthActions {
    setToken: (token: string | null, refreshToken: string | null) => void;
    setUserProfile: (profile: UserProfile | null) => void;
    logOut: () => void;

}

// Create the store combining state and actions
const useAuthStore = create<AuthState & AuthActions>((set) => ({
    token: null,
    refreshToken: null,
    userProfile: null,
    logedIn : false,
    setLogedIn : (logedIn) => set({ logedIn }),
    setToken: (token, refreshToken ) => set({ token, refreshToken }),
    setUserProfile: (profile ) => set({ userProfile: profile }),
    logOut: () => set({ token: null, refreshToken: null, userProfile: null, logedIn : false }),
}));

export default useAuthStore;
