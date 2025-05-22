import { create } from "zustand";
import useAuthStore from "./authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { CLIENT_ID, CLIENT_SECRET } from '@env';

interface User {
  id: number;
  name: string;
  email: string;
  address: { city: string };
}

interface UserStore {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUser: (login: string, navigation: any) => Promise<any>;
}



const refreshAccessToken = async (navigation: any) => {
  try {
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.log("No refresh token found. Redirecting to login...");
      navigation.navigate("login");

      return null;
    }

    const response = await axios.post("https://api.intra.42.fr/oauth/token", {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    if (response.data.access_token) {
      await AsyncStorage.setItem("userToken", response.data.access_token);
      await AsyncStorage.setItem("refreshToken", response.data.refresh_token); // Update refresh token
      console.log("Token refreshed successfully");
      return response.data.access_token;
    }
  } catch (error) {
    console.log("Failed to refresh token:", error);
    return null;
  }
};

const checkTokenExpiry = async (navigation: any) => {
  try {
    let token = await AsyncStorage.getItem("userToken");



    const response = await axios.get(
      "https://api.intra.42.fr/oauth/token/info",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    let { expires_in_seconds, created_at } = response.data;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expiryTimestamp = created_at + expires_in_seconds;

    if (
      currentTimestamp >= expiryTimestamp - 60 // Refresh token 1 minute before expiry
    ) {
      token = await refreshAccessToken(navigation);
      if (!token) {
        console.log("Failed to refresh token. Redirecting to login...");
        return false;
      }
    }

    return true;
  } catch (error : any) {
    if (error.response?.status === 401) {
      console.log("Unauthorized. Refreshing token...");
      const token = await refreshAccessToken(navigation);


      if (!token) {
        console.log("Failed to refresh token. Redirecting to login...");

        return false;
      }
      return true;
    }

    return false;
  }
};

export const useUsersStore = create<UserStore>((set) => ({
  users: [],
  loading: false,
  error: null,
  fetchUser: async (login, navigation) => {
    set({ error: "" });
    const isTokenValid = await checkTokenExpiry(navigation);
    if (!isTokenValid) {
      // navigation.navigate("login"); // Redirect to login if expired
    }
    if (login.trim() === "") {
      set({ error: "Please enter a valid login." });
      return;
    }
      try {

      const token = await AsyncStorage.getItem("userToken");


      const response = await axios.get(
        `https://api.intra.42.fr/v2/users/${login}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigation.navigate("Profile", { student: response.data });

      return response.data;
    } catch (error : any) {
      if (error.response?.status === 401) {
        console.log("Unauthorized. Refreshing token...");
        const token = await refreshAccessToken(navigation);

        if (!token) {
          console.log("Failed to refresh token. Redirecting to login...");
        }
      } else if (error.response?.status === 404) {
        set({ error: "User not found. Please check the login and try again." });
      }
    }
    return;
  },

}));
