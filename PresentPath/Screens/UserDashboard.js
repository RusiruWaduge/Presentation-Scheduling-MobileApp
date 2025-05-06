import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { account, databases } from "../Libraries/appwriteConfig";
import { Query } from "appwrite";
import { Ionicons } from "@expo/vector-icons"; // Make sure you have expo/vector-icons installed

const DATABASE_ID = "67dd8a42000b2f5184aa";
const COLLECTION_ID = "67f22df100281c3981da";

const UserDashboard = ({ navigation }) => {
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const user = await account.get();
        if (!user.email) {
          navigation.replace("UserLogin");
        } else {
          fetchStudentDetails(user.email);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        navigation.replace("UserLogin");
      }
    };

    const fetchStudentDetails = async (email) => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal("email", email)]
        );

        if (response.documents.length === 0) {
          setStudentData([]);
        } else {
          setStudentData(response.documents);
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
        Alert.alert("Error", "Failed to fetch student details.");
        console.error("Error fetching student details:", error);
      }
    };

    checkLoggedInUser();
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      Alert.alert("Logout Successful", "You have been logged out.");
      navigation.replace("UserLogin");
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Logout Failed", error.message);
    }
  };

  const goToNotifications = () => {
    navigation.navigate("Notifications"); // Make sure you have a Notifications screen set up
  };

  const renderProfilePhoto = (photoUrl) => {
    return photoUrl ? (
      <Image source={{ uri: photoUrl }} style={styles.profilePhoto} />
    ) : (
      <Ionicons name="person-circle-outline" size={80} color="#aaa" />
    );
  };

  return (
    <View style={styles.container}>
      {/* Top bar with notifications button */}
      <View style={styles.topBar}>
        <Text style={styles.text}>User Dashboard</Text>
        <TouchableOpacity onPress={goToNotifications} style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text>Loading student details...</Text>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {studentData.length === 0 ? (
            <Text>No student details found.</Text>
          ) : (
            studentData.map((student, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.profileSection}>
                  {renderProfilePhoto(student.profilePhoto)}
                  <View>
                    <Text style={styles.cardTitle}>
                      {student.firstName} {student.lastName}
                    </Text>
                    <Text style={styles.cardText}>Semester: {student.semester}</Text>
                  </View>
                </View>
              </View>
            ))
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("UpdateProfile")}
          >
            <Text style={styles.buttonText}>Update Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Marks")}
          >
            <Text style={styles.buttonText}>View Marks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("MyPresentation")}
          >
            <Text style={styles.buttonText}>Completed Presentations</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    paddingTop: 50,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  notificationButton: {
    padding: 8,
  },
  text: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  scrollContainer: {
    width: "100%",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 10,
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    backgroundColor: "#ddd",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardText: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#0275d8",
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#d9534f",
    padding: 15,
    borderRadius: 8,
    marginTop: 25,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserDashboard;
