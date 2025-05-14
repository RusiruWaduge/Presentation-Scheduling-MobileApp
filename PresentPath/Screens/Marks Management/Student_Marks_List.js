import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Client, Databases } from 'appwrite';

let Print, Sharing;

// Conditional import for non-web platforms
if (Platform.OS !== 'web') {
  Print = require('expo-print');
  Sharing = require('expo-sharing');
}

// Appwrite Configuration
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
      Alert.alert('Error', 'Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this student?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await databases.deleteDocument(databaseId, collectionId, id);
            setStudents((prev) => prev.filter((student) => student.$id !== id));
            Alert.alert('Success', 'Student deleted successfully');
          } catch (error) {
            console.error('❌ Delete Error:', error);
            Alert.alert('Error', 'Failed to delete student');
          } finally {
            setLoading(false);
          }
        },
      },
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
      const marks = {
        Content_Quality: parseInt(updatedMarks.Content_Quality) || 0,
        Presentation_Skills: parseInt(updatedMarks.Presentation_Skills) || 0,
        Slide_Design: parseInt(updatedMarks.Slide_Design) || 0,
        Engagement_And_Interaction: parseInt(updatedMarks.Engagement_And_Interaction) || 0,
        Time_Management: parseInt(updatedMarks.Time_Management) || 0,
      };
      const updated = await databases.updateDocument(databaseId, collectionId, id, marks);
      setStudents((prev) => prev.map((s) => (s.$id === id ? updated : s)));
      setEditStudent(null);
      Alert.alert('Success', 'Student marks updated successfully');
    } catch (error) {
      console.error('❌ Update Error:', error);
      Alert.alert('Error', 'Failed to update student marks');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Error', 'PDF export is not supported on web');
      return;
    }

    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #005566;
              font-size: 28px;
              margin: 0;
            }
            .header p {
              color: #666;
              font-size: 14px;
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #005566;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .total {
              font-weight: bold;
              background-color: #e6f3f7;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Student Marks Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>Academic Institution</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Student No</th>
                <th>Year</th>
                <th>Semester</th>
                <th>Presentation</th>
                <th>Content Quality</th>
                <th>Presentation Skills</th>
                <th>Slide Design</th>
                <th>Engagement</th>
                <th>Time Management</th>
                <th>Total Score</th>
              </tr>
            </thead>
            <tbody>
              ${students
                .map(
                  (student) => `
                <tr>
                  <td>${student.Student_no}</td>
                  <td>Y${student.Year}</td>
                  <td>S${student.Semester}</td>
                  <td>${student.Presentation}</td>
                  <td>${student.Content_Quality}</td>
                  <td>${student.Presentation_Skills}</td>
                  <td>${student.Slide_Design}</td>
                  <td>${student.Engagement_And_Interaction}</td>
                  <td>${student.Time_Management}</td>
                  <td class="total">${
                    student.Content_Quality +
                    student.Presentation_Skills +
                    student.Slide_Design +
                    student.Engagement_And_Interaction +
                    student.Time_Management
                  }</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Generated by Student Marks Management System</p>
            <p>©️ ${new Date().getFullYear()} Academic Institution</p>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
      Alert.alert('Success', 'PDF generated and shared successfully');
    } catch (error) {
      console.error('❌ PDF Generation Error:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  useEffect(() => {
    fetchStudentMarks();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Marks Management</Text>

      {Platform.OS !== 'web' && (
        <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
          <Text style={styles.buttonText}>📄 Generate Report</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#005566" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {students.map((student) => (
            <View key={student.$id} style={styles.card}>
              <Text style={styles.cardTitle}>Student No: {student.Student_no}</Text>
              <Text>📅 Year: Y{student.Year}</Text>
              <Text>📆 Semester: S{student.Semester}</Text>
              <Text>🖼️ Presentation: {student.Presentation}</Text>

              {editStudent === student.$id ? (
                <>
                  {Object.keys(updatedMarks).map((key) => (
                    <View key={key} style={styles.row}>
                      <Text style={styles.label}>{key.replace(/_/g, ' ')}:</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={updatedMarks[key]}
                        onChangeText={(text) => setUpdatedMarks({ ...updatedMarks, [key]: text })}
                      />
                    </View>
                  ))}
                  <TouchableOpacity style={styles.saveButton} onPress={() => updateStudent(student.$id)}>
                    <Text style={styles.buttonText}>Save Changes</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text>📚 Content Quality: {student.Content_Quality}</Text>
                  <Text>🎤 Presentation Skills: {student.Presentation_Skills}</Text>
                  <Text>🖥️ Slide Design: {student.Slide_Design}</Text>
                  <Text>🤝 Engagement: {student.Engagement_And_Interaction}</Text>
                  <Text>⏳ Time Management: {student.Time_Management}</Text>
                  <Text style={styles.overallScore}>
                    ⭐ Total Score:{' '}
                    {student.Content_Quality +
                      student.Presentation_Skills +
                      student.Slide_Design +
                      student.Engagement_And_Interaction +
                      student.Time_Management}
                  </Text>
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e6f3f7',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#005566',
    textAlign: 'center',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  label: {
    fontSize: 14,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    width: 80,
    padding: 5,
    textAlign: 'right',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  editButton: {
    backgroundColor: '#ff9500',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  saveButton: {
    backgroundColor: '#00796b',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  pdfButton: {
    backgroundColor: '#005566',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  overallScore: {
    marginTop: 10,
    fontWeight: '600',
    color: '#00796b',
    fontSize: 16,
  },
});

export default StudentMarksList;