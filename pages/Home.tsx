import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Platform,
  Image,
  TouchableOpacity, // Added for logo
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUsersStore } from "../store/usersStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../store/authStore";

export default function Home({}: any) {
  const router = useRouter();
  const navigation = useNavigation();
  const { fetchUser, error } = useUsersStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState<any>("");
  const {logOut } = useAuthStore();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("refreshToken");
    // setLogedIn(false)
    logOut()

  };



  const handleSearch = async (text: string) => {
    setSearchQuery(text);

    setLoading(true);
    var test = await fetchUser(text.toLowerCase(), navigation);
    setLoading(false);


  };

  const maxLogin = (login: string) => {
    if (login.includes(" ")) {
      login = login.replace(" ", "");
      return;
    }
    if (login.length > 20) {
      login = login.substring(0, 20);
      return;
    } else {
      setLogin(login);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Top Bar with Title and Logout Button */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Swifty Companion</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Logo Placeholder */}
        <View style={styles.logoContainer}>
          <Image
            style={styles.logo}
            source={{
              uri:
                "https://ucarecdn.com/811323e9-be84-4030-95d9-510be3b325d4/-/preview/960x960/",
            }} // Replace with your logo URL
            resizeMode="contain"
          />
        </View>

        <Text style={styles.header}>Welcome to Swifty Companion</Text>
        <Text style={styles.title}>Search Users</Text>
        <View style={styles.customSearchContainer}>
          <Ionicons
            name="search"
            size={24}
            color="#999" // Lighter gray for contrast
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.customInput}
            placeholder="Type a Login .."
            placeholderTextColor="#999" // Gray placeholder
            onChangeText={(text) => maxLogin(text)}
            value={login}
            autoCorrect={false}
            autoCapitalize="none"
            onSubmitEditing={() => handleSearch(login)}
          />
          {login.length > 0 && (
            <Pressable onPress={() => setLogin("")}>
              <Ionicons
                name="close-circle"
                size={24}
                color="#999"
                style={styles.clearIcon}
              />
            </Pressable>
          )}
          <Pressable
            style={styles.searchButton}
            onPress={() => handleSearch(login)}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF8040" /> // Orange spinner
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null }
      </View>
    </SafeAreaView>
  );
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
    justifyContent: "space-between",
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 16,
    marginLeft: 8,
    fontFamily: "Courier New",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#000", // Match DisplayPage
  },
  logoContainer: {
    width: 100,
    height: 100,
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
    fontFamily: "Courier New",
    color: "#FFF", // White text
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Courier New",
    color: "#FFF", // White text
    marginBottom: 10,
  },
  customSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333", // Darker gray border
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
    backgroundColor: "#222", // Dark input background
  },
  customInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
    color: "#FFF", // White text input
    fontFamily: "Courier New",
  },
  searchIcon: {
    marginRight: 8,
  },
  clearIcon: {
    marginLeft: 8,
  },
  searchButton: {
    backgroundColor: "#FF8040", // Orange button
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  searchButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Courier New",
  },
  error: {
    color: "#FF4040", // Red error text, slightly darker than orange
    textAlign: "center",
    marginTop: 10,
    fontFamily: "Courier New",
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333", // Darker separator
  },
  username: {
    fontSize: 18,
    color: "#FFF", // White text
    fontFamily: "Courier New",
  },
});
