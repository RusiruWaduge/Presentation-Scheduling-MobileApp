import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { account, databases } from "../../Libraries/appwriteConfig";
import { Query } from "appwrite";
import { Ionicons } from "@expo/vector-icons"; // You can replace this with other icons if needed

const DATABASE_ID = "67dd8a42000b2f5184aa";
const COLLECTION_ID = "67f22df100281c3981da";

const StudentProfile = ({ navigation }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const user = await account.get();
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal("email", user.email)]
        );

        if (response.documents.length > 0) {
          setStudent(response.documents[0]);
        } else {
          Alert.alert("Not Found", "Student details not found.");
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
        Alert.alert("Error", "Unable to fetch student details.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No student data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#003366" />
        </TouchableOpacity>
        <Text style={styles.header}>Student Details</Text>
      </View>

      <View style={styles.card}>
        <DetailItem label="Full Name" value={`${student.firstName} ${student.lastName}`} />
        <DetailItem label="Email" value={student.email} />
        <DetailItem label="Index Number" value={student.indexNumber} />
        <DetailItem label="Group ID" value={student.groupID} />
        <DetailItem label="Semester" value={student.semester} />
        <DetailItem label="Contact Number" value={student.contactNumber} />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("UpdateProfile")}
      >
        <Text style={styles.buttonText}>Update</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const DetailItem = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "-"}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",  // Lighter background color
    padding: 20,
    alignItems: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#003366",  // Dark blue header
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  detailRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#003366",  // Dark blue for labels
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2196F3",  // Light blue for values
  },
  errorText: {
    fontSize: 16,
    color: "#cc0000",  // Red color for errors
  },
  button: {
    backgroundColor: "#2196F3",  // Light blue button
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default StudentProfile;
