import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Client, Databases } from 'appwrite';

let Print, Sharing;

// Only import print/share if not running on web
if (Platform.OS !== 'web') {
  Print = require('expo-print');
  Sharing = require('expo-sharing');
}

// ✅ Appwrite Configuration
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67dd8453002a601838ad');

const databases = new Databases(client);
const databaseId = '67dd8a42000b2f5184aa';
const collectionId = '67e012b2000fd11e41fb';

const StudentMarksList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStudent, setEditStudent] = useState(null);
  const [updatedMarks, setUpdatedMarks] = useState({});

  const fetchStudentMarks = async () => {
    try {
      const response = await databases.listDocuments(databaseId, collectionId);
      setStudents(response.documents);
    } catch (error) {
      console.error('❌ Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this student?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            setLoading(true);
            await databases.deleteDocument(databaseId, collectionId, id);
            setStudents(prev => prev.filter(student => student.$id !== id));
          } catch (error) {
            console.error("❌ Delete Error:", error);
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

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

  const updateStudent = async (id) => {
    try {
      setLoading(true);
      const updated = await databases.updateDocument(databaseId, collectionId, id, {
        Content_Quality: parseInt(updatedMarks.Content_Quality),
        Presentation_Skills: parseInt(updatedMarks.Presentation_Skills),
        Slide_Design: parseInt(updatedMarks.Slide_Design),
        Engagement_And_Interaction: parseInt(updatedMarks.Engagement_And_Interaction),
        Time_Management: parseInt(updatedMarks.Time_Management),
      });
      setStudents(prev => prev.map(s => s.$id === id ? updated : s));
      setEditStudent(null);
    } catch (err) {
      console.error('❌ Update Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (Platform.OS === 'web') {
      alert('PDF export is not supported on web.');
      return;
    }

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { color: #007bff; }
            .card { border: 1px solid #ccc; margin-bottom: 10px; padding: 10px; border-radius: 5px; }
            .row { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>Student Marks List</h1>
          ${students.map(student => `
            <div class="card">
              <div class="row"><strong>Student No:</strong> ${student.Student_no}</div>
              <div class="row"><strong>Year:</strong> Y${student.Year}</div>
              <div class="row"><strong>Semester:</strong> S${student.Semester}</div>
              <div class="row"><strong>Presentation:</strong> ${student.Presentation}</div>
              <div class="row"><strong>Content Quality:</strong> ${student.Content_Quality}</div>
              <div class="row"><strong>Presentation Skills:</strong> ${student.Presentation_Skills}</div>
              <div class="row"><strong>Slide Design:</strong> ${student.Slide_Design}</div>
              <div class="row"><strong>Engagement:</strong> ${student.Engagement_And_Interaction}</div>
              <div class="row"><strong>Time Management:</strong> ${student.Time_Management}</div>
              <div class="row"><strong>Overall Score:</strong> ${
                student.Content_Quality +
                student.Presentation_Skills +
                student.Slide_Design +
                student.Engagement_And_Interaction +
                student.Time_Management
              }</div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  useEffect(() => {
    fetchStudentMarks();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Marks List</Text>

      {Platform.OS !== 'web' && (
        <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
          <Text style={styles.buttonText}>📄 Export PDF</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {students.map(student => (
            <View key={student.$id} style={styles.card}>
              <Text style={styles.cardTitle}>Student No: {student.Student_no}</Text>
              <Text>📅 Year: Y{student.Year}</Text>
              <Text>📆 Semester: S{student.Semester}</Text>
              <Text>🖼️ Presentation: {student.Presentation}</Text>

              {editStudent === student.$id ? (
                <>
                  {Object.keys(updatedMarks).map((key) => (
                    <View key={key} style={styles.row}>
                      <Text>{key.replace(/_/g, " ")}:</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={updatedMarks[key]}
                        onChangeText={text => setUpdatedMarks({ ...updatedMarks, [key]: text })}
                      />
                    </View>
                  ))}
                  <TouchableOpacity style={styles.saveButton} onPress={() => updateStudent(student.$id)}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text>📚 Content Quality: {student.Content_Quality}</Text>
                  <Text>🎤 Presentation Skills: {student.Presentation_Skills}</Text>
                  <Text>🖥️ Slide Design: {student.Slide_Design}</Text>
                  <Text>🤝 Engagement: {student.Engagement_And_Interaction}</Text>
                  <Text>⏳ Time Management: {student.Time_Management}</Text>
                  <Text style={styles.overallScore}>⭐ Overall Score: {
                    student.Content_Quality +
                    student.Presentation_Skills +
                    student.Slide_Design +
                    student.Engagement_And_Interaction +
                    student.Time_Management
                  }</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.editButton} onPress={() => startEdit(student)}>
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteStudent(student.$id)}>
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#007bff', textAlign: 'center', marginBottom: 10 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  input: { borderBottomWidth: 1, width: 60, textAlign: 'right' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  editButton: { backgroundColor: '#ffc107', padding: 10, borderRadius: 5 },
  deleteButton: { backgroundColor: '#dc3545', padding: 10, borderRadius: 5 },
  saveButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 5, marginTop: 10 },
  pdfButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, marginBottom: 15 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  overallScore: { marginTop: 10, fontWeight: 'bold', color: '#28a745' },
});

export default StudentMarksList;
