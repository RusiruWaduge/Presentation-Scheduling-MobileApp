import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { getCurrentUser } from "../../Libraries/appwrite";

const TopBar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light"); // Manage theme state locally

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    fetchUser();
  }, []);

  return (
    <View
      style={[
        styles.container,
        theme === "dark" ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <View style={styles.leftSection}>
        <Text
          style={[
            styles.welcomeText,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          Welcome to your
        </Text>
        <Text
          style={[
            styles.title,
            theme === "dark" ? styles.darkText : styles.lightText,
          ]}
        >
          Performance Analysis
        </Text>
      </View>

      <View style={styles.rightSection}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={theme === "dark" ? "#FFD700" : "#fff"}
          />
        ) : user ? (
          <View style={styles.profileContainer}>
            <Text
              style={[
                styles.userName,
                theme === "dark" ? styles.darkText : styles.lightText,
              ]}
            >
              {user.name}
            </Text>
            <Image
              source={{
                uri:
                  user.profileImage ||
                  "https://i.pinimg.com/736x/38/41/97/384197530d32338dd6caafaf1c6a26c4.jpg",
              }}
              style={styles.profileImage}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  leftSection: {
    flexDirection: "column",
  },
  lightContainer: {
    backgroundColor: "#007AFF",
  },
  darkContainer: {
    backgroundColor: "#1E1E1E",
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  lightText: {
    color: "#fff",
  },
  darkText: {
    color: "#FFD700",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: "500",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
});

export default TopBar;
