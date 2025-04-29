import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Button,
  Platform,
} from "react-native";
import { account, databases } from "../../Libraries/appwriteConfig";
import { Query } from "appwrite";
import RNHTMLtoPDF from "react-native-html-to-pdf";

const DATABASE_ID = "67dd8a42000b2f5184aa";
const USERS_COLLECTION_ID = "67f22df100281c3981da";
const MARKS_COLLECTION_ID = "67e012b2000fd11e41fb";

const Marks = ({ navigation }) => {
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

  const handleDownloadPDF = async () => {
    if (!studentData) {
      Alert.alert("Error", "Student data not available.");
      return;
    }

    const htmlContent = `
      <h1>Presentation Marks Report</h1>
      <p><strong>Name:</strong> ${studentData.firstName} ${studentData.lastName}</p>
      <p><strong>Index Number:</strong> ${studentData.indexNumber}</p>
      <p><strong>Semester:</strong> ${studentData.semester}</p>
      <br />
      <table border="1" cellspacing="0" cellpadding="5">
        <thead>
          <tr>
            <th>Presentation</th>
            <th>Content</th>
            <th>Skills</th>
            <th>Slides</th>
            <th>Engage</th>
            <th>Time</th>
            <th>Total</th>
            <th>Avg</th>
          </tr>
        </thead>
        <tbody>
          ${presentationData
            .map((mark) => {
              return `
                <tr>
                  <td>${mark.Presentation}</td>
                  <td>${mark.Content_Quality}</td>
                  <td>${mark.Presentation_Skills}</td>
                  <td>${mark.Slide_Design}</td>
                  <td>${mark.Engagement_And_Interaction}</td>
                  <td>${mark.Time_Management}</td>
                  <td>${calculateTotal(mark)}</td>
                  <td>${calculateAverage(mark)}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    `;

    try {
      const options = {
        html: htmlContent,
        fileName: "presentation_report",
        directory: "Documents",
        base64: false,
      };

      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert("PDF Generated", `Saved to: ${file.filePath}`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      Alert.alert("Error", "Failed to generate PDF.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Presentation</Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <ScrollView style={styles.scroll}>
          {studentData ? (
            <View style={styles.card}>
              <Text style={styles.title}>Welcome, {studentData.firstName}!</Text>
              <Text style={styles.text}>Index Number: {studentData.indexNumber}</Text>
              <Text style={styles.text}>Semester: {studentData.semester}</Text>
            </View>
          ) : (
            <Text>No student information found.</Text>
          )}

          <Text style={[styles.header, { marginTop: 20 }]}>Presentation Marks</Text>

          {presentationData.length === 0 ? (
            <Text>No presentation records found.</Text>
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
                    <Text style={styles.cell}>{item.Presentation_Skills}</Text>
                    <Text style={styles.cell}>{item.Slide_Design}</Text>
                    <Text style={styles.cell}>{item.Engagement_And_Interaction}</Text>
                    <Text style={styles.cell}>{item.Time_Management}</Text>
                    <Text style={styles.cell}>{calculateTotal(item)}</Text>
                    <Text style={styles.cell}>{calculateAverage(item)}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          <View style={{ marginTop: 20 }}>
            <Button title="Download PDF" onPress={handleDownloadPDF} />
          </View>
        </ScrollView>
      )}

      <Button title="Logout" onPress={handleLogout} color="#d9534f" />
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
  scroll: {
    width: "100%",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
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
    color: "#222",
  },
  text: {
    fontSize: 16,
    color: "#555",
    marginTop: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 30,
  },
  headerRow: {
    backgroundColor: "#4f46e5",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
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
});

export default Marks;
