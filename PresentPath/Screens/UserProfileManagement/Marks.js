import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Button,
  SafeAreaView,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { account, databases } from "../../Libraries/appwriteConfig";
import { Query } from "appwrite";
import { Ionicons } from "@expo/vector-icons";

const DATABASE_ID = "67dd8a42000b2f5184aa";
const USERS_COLLECTION_ID = "67f22df100281c3981da";
const MARKS_COLLECTION_ID = "67e012b2000fd11e41fb";

const Presentation_Marks = ({ navigation }) => {
  const [studentData, setStudentData] = useState(null);
  const [presentationData, setPresentationData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresentationDetails = async () => {
      try {
        const user = await account.get();
        const studentResponse = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.equal("email", user.email)]
        );

        if (studentResponse.documents.length === 0) {
          setStudentData(null);
          setPresentationData([]);
          setLoading(false);
          return;
        }

        const student = studentResponse.documents[0];
        setStudentData(student);

        const marksResponse = await databases.listDocuments(
          DATABASE_ID,
          MARKS_COLLECTION_ID,
          [Query.equal("Student_no", student.indexNumber)]
        );

        setPresentationData(marksResponse.documents);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load presentation details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPresentationDetails();
  }, []);

  const calculateTotal = (mark) => {
    return (
      mark.Content_Quality +
      mark.Presentation_Skills +
      mark.Slide_Design +
      mark.Engagement_And_Interaction +
      mark.Time_Management
    );
  };

  const calculateAverage = (mark) => {
    return (calculateTotal(mark) / 5).toFixed(2);
  };

  const handleGenerateCSV = async () => {
    if (!studentData || presentationData.length === 0) {
      Alert.alert("Error", "Missing data to generate report.");
      return;
    }

    let csv = `Student Name,${studentData.firstName} ${studentData.lastName}\n`;
    csv += `Index Number,${studentData.indexNumber}\n`;
    csv += `Semester,${studentData.semester}\n\n`;
    csv += `Presentation,Content,Skills,Slides,Engage,Time,Total,Average\n`;

    presentationData.forEach((mark) => {
      const total = calculateTotal(mark);
      const average = calculateAverage(mark);
      csv += `${mark.Presentation},${mark.Content_Quality},${mark.Presentation_Skills},${mark.Slide_Design},${mark.Engagement_And_Interaction},${mark.Time_Management},${total},${average}\n`;
    });

    try {
      const fileUri = FileSystem.documentDirectory + "presentation_report.csv";
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Share or save your presentation report",
      });
    } catch (err) {
      console.error("Error generating CSV:", err);
      Alert.alert("Error", "Failed to generate or share CSV.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#003366" />
        </TouchableOpacity>

        <Text style={styles.header}>Presentation Marks</Text>

        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <ScrollView style={styles.scroll}>
            {studentData ? (
              <View style={styles.card}>
                <Text style={styles.title}>
                  Name: {studentData.firstName} {studentData.lastName}
                </Text>
                <Text style={styles.text}>
                  Index Number: {studentData.indexNumber}
                </Text>
                <Text style={styles.text}>
                  Semester: {studentData.semester}
                </Text>
              </View>
            ) : (
              <Text style={styles.infoText}>No student information found.</Text>
            )}

            <Text style={[styles.header, { marginTop: 20 }]}>
              Presentation Marks
            </Text>

            {presentationData.length === 0 ? (
              <Text style={styles.infoText}>No presentation records found.</Text>
            ) : (
              <ScrollView horizontal>
                <View style={styles.table}>
                  <View style={[styles.row, styles.headerRow]}>
                    <Text style={styles.cellHeader}>Presentation</Text>
                    <Text style={styles.cellHeader}>Content</Text>
                    <Text style={styles.cellHeader}>Skills</Text>
                    <Text style={styles.cellHeader}>Slides</Text>
                    <Text style={styles.cellHeader}>Engage</Text>
                    <Text style={styles.cellHeader}>Time</Text>
                    <Text style={styles.cellHeader}>Total</Text>
                    <Text style={styles.cellHeader}>Avg</Text>
                  </View>

                  {presentationData.map((item, index) => (
                    <View key={index} style={styles.row}>
                      <Text style={styles.cell}>{item.Presentation}</Text>
                      <Text style={styles.cell}>{item.Content_Quality}</Text>
                      <Text style={styles.cell}>
                        {item.Presentation_Skills}
                      </Text>
                      <Text style={styles.cell}>{item.Slide_Design}</Text>
                      <Text style={styles.cell}>
                        {item.Engagement_And_Interaction}
                      </Text>
                      <Text style={styles.cell}>{item.Time_Management}</Text>
                      <Text style={styles.cell}>{calculateTotal(item)}</Text>
                      <Text style={styles.cell}>{calculateAverage(item)}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title="Download Report (CSV)"
                color="#2196F3"
                onPress={handleGenerateCSV}
              />
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    padding: 20,
    position: "relative",
  },
  scroll: {
    marginTop: 10,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 15,
    textAlign: "center",
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
  infoText: {
    textAlign: "center",
    color: "#888",
    marginVertical: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
  },
  text: {
    fontSize: 16,
    color: "#333",
    marginTop: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: "#2196F3",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  headerRow: {
    backgroundColor: "#003366",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cellHeader: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    minWidth: 80,
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    minWidth: 80,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});

export default Presentation_Marks;
