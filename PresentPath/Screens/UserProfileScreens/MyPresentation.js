import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { account, databases } from "../../Libraries/appwriteConfig";
import { Query } from "appwrite";

const DATABASE_ID = "67dd8a42000b2f5184aa";
const USERS_COLLECTION_ID = "67f22df100281c3981da";
const PRESENTATION_COLLECTION_ID = "67e012b2000fd11e41fb";

const MyPresentation = ({ navigation }) => {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresentationData = async () => {
      try {
        const session = await account.get();
        const email = session.email;

        const userRes = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.equal("email", email)]
        );

        if (userRes.documents.length === 0) {
          Alert.alert("User not found", "No student data found.");
          setLoading(false);
          return;
        }

        const student = userRes.documents[0];
        const groupID = student.groupID;

        if (!groupID) {
          Alert.alert("No group assigned", "Student group ID not found.");
          setLoading(false);
          return;
        }

        const presentationRes = await databases.listDocuments(
          DATABASE_ID,
          PRESENTATION_COLLECTION_ID,
          [Query.equal("group_id", groupID)]
        );

        setPresentations(presentationRes.documents);
      } catch (error) {
        console.error("Error fetching presentation data:", error);
        Alert.alert("Error", "Failed to fetch presentation data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPresentationData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 10 }}>Loading presentations...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Presentations</Text>

      {presentations.length === 0 ? (
        <Text style={styles.noData}>No presentations found for your group.</Text>
      ) : (
        presentations.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>Title: {item.title || "N/A"}</Text>
            <Text style={styles.cardDetail}>Semester: {item.semester || "N/A"}</Text>
            <Text style={styles.cardDetail}>
              Date: {item.date ? new Date(item.date).toLocaleDateString() : "TBD"}
            </Text>
            <Text style={styles.cardDetail}>
              Time: {item.time ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD"}
            </Text>
            <Text style={styles.cardDetail}>Venue: {item.venue || "TBD"}</Text>
            <Text style={styles.cardDetail}>Status: {item.status || "Pending"}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default MyPresentation;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    minHeight: "100%",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  noData: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 5,
  },
  cardDetail: {
    fontSize: 16,
    color: "#555",
    marginTop: 4,
  },
});
