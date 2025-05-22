import { useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthRequest } from "expo-auth-session";

const discovery = {
  authorizationEndpoint: "https://api.intra.42.fr/oauth/authorize",
  tokenEndpoint: "https://api.intra.42.fr/oauth/token",
};

import { CLIENT_ID, CLIENT_SECRET } from "@env";
import useAuthStore from "../store/authStore";

export default function Login({}: any) {
  const { setToken  , setLogedIn} = useAuthStore();
  const navigation = useNavigation();

  const router = useRouter();
  console.log("CLIENT_ID: ", CLIENT_ID);

  const redirectUri = AuthSession.makeRedirectUri({
    //@ts-expect-error : error
    useProxy: true,
  });
  console.log("Redirect URI: ", redirectUri);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ["public", "profile"],
      clientSecret: CLIENT_SECRET,
      redirectUri: redirectUri,
      extraParams: {
        // Add additional parameters if needed
      },
      responseType: AuthSession.ResponseType.Code,
    },
    discovery
  );

  const getToken = async (code: string) => {
    console.log("CLIENT_SECRET",CLIENT_SECRET)
    const tokenResponse = await fetch("https://api.intra.42.fr/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=authorization_code&code=${code}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=${redirectUri}`,
    });

    const tokenData = await tokenResponse.json();
    console.log("Token Data:", tokenData);

    if (tokenData.access_token) {
      console.log("Access Token:", tokenData);
      setToken(tokenData.access_token, tokenData.refresh_token);
      await AsyncStorage.setItem("userToken", tokenData.access_token);
      await AsyncStorage.setItem("refreshToken", tokenData.refresh_token);
      setLogedIn(true);
      router.replace("Home");

      // Save the access token securely
    }
  };
  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      // Exchange the code for a token
      getToken(code);
    }

    console.log(response);
  }, [response]);

  const handleLogin = () => {
    promptAsync();
  };



  return <SafeAreaView style={styles.safeContainer}>

      <View style={styles.container}>
        {/* Logo Placeholder */}
        <View style={styles.logoContainer}>
          <Image
          width={200}
          height={200}
            style={styles.logo}
            source={{ uri: "https://ucarecdn.com/811323e9-be84-4030-95d9-510be3b325d4/-/preview/960x960/" }} // Replace with your logo URL
            resizeMode="contain"
          />
        </View>

        <Text style={styles.header}>
          Welcome to
        </Text>
        <Text style={styles.header}>
          Swifty Companion
        </Text>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
}
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#000", // Dark background
  },
  topBar: {
    height: 60,
    backgroundColor: "#111", // Slightly lighter than main background
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center the title
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  topBarTitle: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "Courier New",
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000", // Match DisplayPage
    padding: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 200,
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
    fontFamily: "Courier New",
    color: "#FFF", // White text
  },
  loginButton: {
    marginTop: 20,

    backgroundColor: "#FF8040", // Orange button
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Courier New",
    textAlign: "center",
  },
});
