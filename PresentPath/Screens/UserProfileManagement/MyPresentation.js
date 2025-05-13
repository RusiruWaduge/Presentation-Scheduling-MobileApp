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
import { Ionicons } from "@expo/vector-icons";
import { account, databases } from "../../Libraries/appwriteConfig";
import { Query } from "appwrite";

const DATABASE_ID = "67dd8a42000b2f5184aa";
const USERS_COLLECTION_ID = "67f22df100281c3981da";
const COMPLETED_PRESENTATION_COLLECTION_ID = "completed_presentations";

const MyPresentation = ({ navigation }) => {
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
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>My Completed Presentations</Text>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
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
            <Text style={styles.noDataText}>No student information found.</Text>
          )}

          <TextInput
            style={styles.searchInput}
            placeholder="Search by presentation title"
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#aaa"
          />

          {filteredPresentations.length === 0 ? (
            <Text style={styles.noDataText}>No matching presentations found.</Text>
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
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  scroll: {
    marginTop: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
  },
  text: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  noDataText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 20,
    color: "#333",
  },
  presentationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  presentationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 6,
  },
});

export default MyPresentation;
