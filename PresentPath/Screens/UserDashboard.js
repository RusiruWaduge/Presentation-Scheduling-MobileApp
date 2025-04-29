import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { account, databases } from "../Libraries/appwriteConfig";
import { Query } from "appwrite";

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
            <Text style={styles.buttonText}>View Presentations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("UpdateProfileScreen")}
          >
            <Text style={styles.buttonText}>Update Profile</Text>
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
    elevation: 5,
    shadowColor: "#000",
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
