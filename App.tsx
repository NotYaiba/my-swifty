import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaView } from "react-native-safe-area-context";

import { CLIENT_ID, CLIENT_SECRET } from "@env";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import useAuthStore from "./store/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Profile from "./pages/Profile";
const Stack = createStackNavigator();
const MainStack = createStackNavigator();
SplashScreen.preventAutoHideAsync();
export default function App() {
  const [token, setToken] = useState<any>(null);
  const { logedIn , setLogedIn  } = useAuthStore();

  useEffect(() => {
    const prepare = async () => {
      try {
        // Simulate loading (e.g., auth check)
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    };
    prepare();
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await AsyncStorage.getItem("userToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (storedToken) {
        setLogedIn(true);
      } else {
        console.log("No token found");
      }
    }
    checkToken();
  }, [] );
  
  function MainStackNavigator() {
    return (
      <MainStack.Navigator initialRouteName="Home">
        <MainStack.Screen name="Home" 
              options={{ headerShown: false }}
        
        component={Home} />
        <MainStack.Screen name="Profile" 
              options={{ headerShown: false }}
        
        component={Profile} />
      </MainStack.Navigator>
    );
  }
  return (
    <NavigationContainer >
      <SafeAreaView style={{ flex: 1,
        backgroundColor : "#000",
      }}>
        {!logedIn
         ? (
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              options={{ headerShown: false }}
              component={Login}
            />
          </Stack.Navigator>
        ) : (
          <MainStackNavigator />
        )}
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
});
