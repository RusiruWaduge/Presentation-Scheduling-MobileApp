import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { account, databases } from "../Libraries/appwriteConfig";
import { Query } from "appwrite";
import { Ionicons } from "@expo/vector-icons";

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

        setStudentData(response.documents || []);
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
    navigation.navigate("Notifications");
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.headerText}>User Dashboard</Text>
        <TouchableOpacity onPress={goToNotifications} style={styles.notificationButton}>
          <Ionicons name="notifications-circle-outline" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading student details...</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {studentData.length === 0 ? (
            <Text style={styles.noDataText}>No student details found.</Text>
          ) : (
            studentData.map((student, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.profileSection}>
                  <Image
                    source={{
                      uri:
                        student?.profilePic ||
                        "https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png",
                    }}
                    style={styles.profilePhoto}
                  />
                  <View>
                    <Text style={styles.cardTitle}>
                      {student.firstName} {student.lastName}
                    </Text>
                    <Text style={styles.cardText}>Index Number: {student.indexNumber}</Text>
                    <Text style={styles.cardText}>Semester: {student.semester}</Text>
                  </View>
                </View>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>🚀 View Your Performance</Text>
          <View style={styles.featureContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('StdProfile')}
            >
              <Text style={styles.buttonText}>View Your Performance</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonGrid}>
            <TouchableOpacity
              style={styles.gridButton}
              onPress={() => navigation.navigate("StudentProfile")}
            >
              <Ionicons name="person-circle-outline" size={28} color="#fff" />
              <Text style={styles.buttonText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridButton}
              onPress={() => navigation.navigate("Presentation_Marks")}
            >
              <Ionicons name="stats-chart" size={28} color="#fff" />
              <Text style={styles.buttonText}>View Marks</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridButton}
              onPress={() => navigation.navigate("MyPresentation")}
            >
              <Ionicons name="checkmark-done-circle-outline" size={28} color="#fff" />
              <Text style={styles.buttonText}>Completed Presentation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridButton}
              onPress={() => navigation.navigate("StickyNotes")}
            >
              <Ionicons name="clipboard-outline" size={28} color="#fff" />
              <Text style={styles.buttonText}>Sticky Notes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridButton}
              onPress={() => navigation.navigate("UpcomingPresentation")}
            >
              <Ionicons name="calendar-clear-outline" size={28} color="#fff" />
              <Text style={styles.buttonText}>Upcoming Presentation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridButton}
              onPress={() => navigation.navigate("ExaminerContact")}
            >
              <Ionicons name="mail-open-outline" size={28} color="#fff" />
              <Text style={styles.buttonText}>Contact Examiners</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={28} color="#fff" />
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
    backgroundColor: "#e6f0fa",
    padding: 20,
    paddingTop: 50,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#003366",
  },
  notificationButton: {
    padding: 10,
    backgroundColor: "#2196F3",
    borderRadius: 50,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginTop: 20,
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 5,
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
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#003366",
  },
  cardText: {
    fontSize: 16,
    color: "#333",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#003366",
  },
  featureContainer: {
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  gridButton: {
    backgroundColor: "#003366",
    width: "48%",
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 15,
    alignItems: "center",
    elevation: 4,
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#cc0000",
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 30,
  },
});

export default UserDashboard;
