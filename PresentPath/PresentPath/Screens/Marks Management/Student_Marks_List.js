import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Client, Databases } from 'appwrite';
import MainTab from './MainTabs';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook

// ✅ Configure Appwrite
const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
  .setProject('67dd8453002a601838ad'); // Your Appwrite Project ID

const databases = new Databases(client);
const databaseId = '67dd8a42000b2f5184aa'; // Your Database ID
const collectionId = '67e012b2000fd11e41fb'; // Your Collection ID

const StudentMarksList = () => {
  const navigation = useNavigation(); // Initialize navigation
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStudent, setEditStudent] = useState(null);
  const [updatedMarks, setUpdatedMarks] = useState({});

  // 🔹 Fetch student marks and additional details from Appwrite
  const fetchStudentMarks = async () => {
    try {
      const response = await databases.listDocuments(databaseId, collectionId);
      setStudents(response.documents);
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete Student
  const deleteStudent = async (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this student?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              console.log("🔹 Deleting student with ID:", id);
              setLoading(true);

              // ✅ Check if the document ID exists
              if (!id) {
                console.error("❌ No document ID provided!");
                return;
              }

              // ✅ Appwrite delete function
              await databases.deleteDocument(databaseId, collectionId, id);

              // ✅ Remove from UI
              setStudents((prev) => prev.filter((student) => student.$id !== id));

              console.log("✅ Student deleted successfully!");
            } catch (error) {
              console.error('❌ Error deleting student:', error);
              Alert.alert("Error", error.message || "Failed to delete student. Check console for details.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // 🔹 Enable Edit Mode
  const startEdit = (student) => {
    setEditStudent(student.$id);
    setUpdatedMarks({
      Content_Quality: student.Content_Quality.toString(),
      Presentation_Skills: student.Presentation_Skills.toString(),
      Slide_Design: student.Slide_Design.toString(),
      Engagement_And_Interaction: student.Engagement_And_Interaction.toString(),
      Time_Management: student.Time_Management.toString(),
    });
  };

  // 🔹 Update Student Marks
  const updateStudent = async (id) => {
    try {
      setLoading(true);
      const updatedStudent = await databases.updateDocument(databaseId, collectionId, id, {
        Content_Quality: parseInt(updatedMarks.Content_Quality),
        Presentation_Skills: parseInt(updatedMarks.Presentation_Skills),
        Slide_Design: parseInt(updatedMarks.Slide_Design),
        Engagement_And_Interaction: parseInt(updatedMarks.Engagement_And_Interaction),
        Time_Management: parseInt(updatedMarks.Time_Management),
      });

      setStudents((prev) =>
        prev.map((student) => (student.$id === id ? updatedStudent : student))
      );

      setEditStudent(null);
    } catch (error) {
      console.error('❌ Error updating student:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentMarks();
  }, []);

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Student Marks List</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : students.length === 0 ? (
        <Text style={styles.noDataText}>No student data found</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {students.map((student) => (
            <View key={student.$id} style={styles.card}>
              <Text style={styles.cardTitle}>Student No: {student.Student_no}</Text>

              {/* Display Year, Semester, and Presentation */}
              <View style={styles.row}>
                <Text style={styles.label}>📅 Year:</Text>
                <Text style={styles.value}>Y {student.Year}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>📆 Semester:</Text>
                <Text style={styles.value}>S {student.Semester}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>🖼️ Presentation:</Text>
                <Text style={styles.value}>{student.Presentation}</Text>
              </View>

              {editStudent === student.$id ? (
                // Editable Inputs for Updating Student Marks
                <>
                  {["Content_Quality", "Presentation_Skills", "Slide_Design", "Engagement_And_Interaction", "Time_Management"].map((field) => (
                    <View key={field} style={styles.row}>
                      <Text style={styles.label}>{field.replace(/_/g, " ")}:</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={updatedMarks[field]}
                        onChangeText={(text) => setUpdatedMarks({ ...updatedMarks, [field]: text })}
                      />
                    </View>
                  ))}
                  <TouchableOpacity style={styles.saveButton} onPress={() => updateStudent(student.$id)}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Display Student Marks
                <>
                  <View style={styles.row}><Text style={styles.label}>📚 Content Quality:</Text><Text style={styles.value}>{student.Content_Quality}</Text></View>
                  <View style={styles.row}><Text style={styles.label}>🎤 Presentation Skills:</Text><Text style={styles.value}>{student.Presentation_Skills}</Text></View>
                  <View style={styles.row}><Text style={styles.label}>🖥️ Slide Design:</Text><Text style={styles.value}>{student.Slide_Design}</Text></View>
                  <View style={styles.row}><Text style={styles.label}>🤝 Engagement:</Text><Text style={styles.value}>{student.Engagement_And_Interaction}</Text></View>
                  <View style={styles.row}><Text style={styles.label}>⏳ Time Management:</Text><Text style={styles.value}>{student.Time_Management}</Text></View>
                  <Text style={styles.overallScore}>⭐ Overall Score: {((student.Content_Quality + student.Presentation_Skills + student.Slide_Design + student.Engagement_And_Interaction + student.Time_Management)).toFixed(2)}</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.editButton} onPress={() => startEdit(student)}><Text style={styles.buttonText}>Edit</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteStudent(student.$id)}><Text style={styles.buttonText}>Delete</Text></TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#007bff', marginBottom: 15 },
  loader: { marginTop: 20 },
  noDataText: { fontSize: 18, textAlign: 'center', marginTop: 20, color: '#6c757d' },
  scrollContainer: { paddingBottom: 20 },
  card: { backgroundColor: '#fff', padding: 18, borderRadius: 10, marginBottom: 15, elevation: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  label: { fontSize: 16, fontWeight: 'bold' },
  value: { fontSize: 16 },
  overallScore: { fontSize: 18, fontWeight: 'bold', color: '#28a745', marginTop: 10, textAlign: 'right' },
  input: { borderBottomWidth: 1, width: 50, textAlign: 'right' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  editButton: { backgroundColor: '#ffc107', padding: 10, borderRadius: 5 },
  deleteButton: { backgroundColor: '#dc3545', padding: 10, borderRadius: 5 },
  saveButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 5 },
  buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
});

export default StudentMarksList;