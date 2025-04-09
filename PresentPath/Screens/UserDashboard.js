import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import { account, databases } from "../Libraries/appwriteConfig";
import { Query } from "appwrite"; // Ensure you have this import for Query

const DATABASE_ID = "67dd8a42000b2f5184aa"; // Replace with your database ID
const COLLECTION_ID = "67f22df100281c3981da"; // Replace with your collection ID

const UserDashboard = ({ navigation }) => {
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const user = await account.get(); // Check if there's a logged-in user

        if (!user.email) {
          // No user is logged in, redirect to login page
          navigation.replace("UserLogin");
        } else {
          // User is logged in, fetch student details
          fetchStudentDetails(user.email);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        navigation.replace("UserLogin"); // Redirect to login if session fetch fails
      }
    };

    const fetchStudentDetails = async (email) => {
      try {
        // Query the database for student data by email
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal("email", email)] // Corrected query
        );

        if (response.documents.length === 0) {
          setStudentData([]); // If no documents found, set empty array
        } else {
          setStudentData(response.documents); // Set fetched documents to state
        }

        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        setLoading(false); // Set loading to false even on error
        Alert.alert("Error", "Failed to fetch student details.");
        console.error("Error fetching student details:", error);
      }
    };

    checkLoggedInUser(); // Check if the user is logged in when the component mounts
  }, []); // Empty dependency array ensures the effect runs only once on mount

  const handleLogout = async () => {
    try {
      await account.deleteSession("current"); // Logs out the user
      Alert.alert("Logout Successful", "You have been logged out.");
      navigation.replace("UserLogin"); // Navigate to login screen
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Logout Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello, Student!</Text>

      {loading ? (
        <Text>Loading student details...</Text>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {studentData.length === 0 ? (
            <Text>No student details found.</Text>
          ) : (
            studentData.map((student, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>
                  Name: {student.firstName} {student.lastName}
                </Text>
                <Text style={styles.cardText}>
                  Semester: {student.semester}
                </Text>
                <Text style={styles.cardText}>Role: {student.role}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Button title="Logout" onPress={handleLogout} color="#d9534f" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  text: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  scrollContainer: {
    width: "100%",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 10,
    borderRadius: 8,
    elevation: 5, // Gives a shadow effect on Android
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
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
});

export default UserDashboard;
