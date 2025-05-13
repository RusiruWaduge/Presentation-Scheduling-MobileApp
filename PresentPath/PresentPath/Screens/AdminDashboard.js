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
const EXAMINER_COLLECTION_ID = "67f22df100281c3981da"; // Replace with your Examiner collection ID

const ExaminerDashboard = ({ navigation }) => {
  const [examinerData, setExaminerData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExaminerDetails = async () => {
      try {
        // Get the logged-in user's data
        const user = await account.get();

        if (!user.email) {
          throw new Error("No email found for the logged-in user.");
        }

        // Query the database for examiner data by email
        const response = await databases.listDocuments(
          DATABASE_ID,
          EXAMINER_COLLECTION_ID,
          [Query.equal("email", user.email)] // Corrected query
        );

        if (response.documents.length === 0) {
          setExaminerData([]); // If no documents found, set empty array
        } else {
          setExaminerData(response.documents); // Set fetched documents to state
        }

        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        setLoading(false); // Set loading to false even on error
        Alert.alert("Error", "Failed to fetch examiner details.");
        console.error("Error fetching examiner details:", error);
      }
    };

    fetchExaminerDetails();
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
      <Text style={styles.text}>Hello, Examiner!</Text>

      {loading ? (
        <Text>Loading examiner details...</Text>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {examinerData.length === 0 ? (
            <Text>No examiner details found.</Text>
          ) : (
            examinerData.map((examiner, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>Name: {examiner.name}</Text>
                <Text style={styles.cardText}>Email: {examiner.email}</Text>
                <Text style={styles.cardText}>Role: Examiner</Text>
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

export default ExaminerDashboard;
