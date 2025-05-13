import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { account, databases } from "../../Libraries/appwriteConfig";
import { Query } from "appwrite";
import { Ionicons } from "@expo/vector-icons"; // For back button

const DATABASE_ID = "67dd8a42000b2f5184aa";
const USERS_COLLECTION_ID = "67f22df100281c3981da";
const COMPLETED_PRESENTATION_COLLECTION_ID = "PresentationSchedules";

const UpcomingPresentation = ({ navigation }) => {
  const [studentData, setStudentData] = useState(null);
  const [completedPresentations, setCompletedPresentations] = useState([]);
  const [filteredPresentations, setFilteredPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await account.get();
        const studentResponse = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.equal("email", user.email)]
        );

        if (studentResponse.documents.length === 0) {
          setStudentData(null);
          setCompletedPresentations([]);
          setFilteredPresentations([]);
          setLoading(false);
          return;
        }

        const student = studentResponse.documents[0];
        setStudentData(student);

        const completedResponse = await databases.listDocuments(
          DATABASE_ID,
          COMPLETED_PRESENTATION_COLLECTION_ID,
          [Query.equal("group_id", student.groupID)]
        );

        setCompletedPresentations(completedResponse.documents);
        setFilteredPresentations(completedResponse.documents);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load completed presentations.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === "") {
      setFilteredPresentations(completedPresentations);
    } else {
      const filtered = completedPresentations.filter((presentation) =>
        presentation.title.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPresentations(filtered);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#003366" />
        </TouchableOpacity>
        <Text style={styles.header}>My Upcoming Presentations</Text>
      </View>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <ScrollView style={styles.scroll}>
          {studentData ? (
            <View style={styles.card}>
              <Text style={styles.title}>
                Name: {studentData.firstName} {studentData.lastName}
              </Text>
              <Text style={styles.text}>Index Number: {studentData.indexNumber}</Text>
              <Text style={styles.text}>Group ID: {studentData.groupID}</Text>
              <Text style={styles.text}>Semester: {studentData.semester}</Text>
            </View>
          ) : (
            <Text>No student information found.</Text>
          )}

          <TextInput
            style={styles.searchInput}
            placeholder="Search by presentation title"
            value={searchText}
            onChangeText={handleSearch}
          />

          {filteredPresentations.length === 0 ? (
            <Text>No matching presentations found.</Text>
          ) : (
            filteredPresentations.map((presentation, index) => (
              <View key={index} style={styles.presentationCard}>
                <Text style={styles.presentationTitle}>{presentation.title}</Text>
                <Text style={styles.text}>Group ID: {presentation.group_id}</Text>
                <Text style={styles.text}>Semester: {presentation.semester}</Text>
                <Text style={styles.text}>Date: {presentation.date}</Text>
                <Text style={styles.text}>Time: {presentation.time}</Text>
                <Text style={styles.text}>Venue: {presentation.venue}</Text>
                <Text style={styles.text}>Status: {presentation.status}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#003366", // Dark blue for the header
  },
  scroll: {
    width: "100%",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366", // Dark blue for title
  },
  text: {
    fontSize: 16,
    color: "#555",
    marginTop: 4,
  },
  searchInput: {
    height: 40,
    borderColor: "#2196F3", // Light blue border
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  presentationCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  presentationTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2196F3", // Light blue for the presentation title
    marginBottom: 8,
  },
});

export default UpcomingPresentation;
