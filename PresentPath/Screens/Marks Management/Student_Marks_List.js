import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Client, Databases } from 'appwrite';
import { useNavigation } from '@react-navigation/native';

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
  const navigation = useNavigation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStudent, setEditStudent] = useState(null);
  const [updatedMarks, setUpdatedMarks] = useState({});
  const [errors, setErrors] = useState({});

  const fetchStudentMarks = async () => {
    try {
      const response = await databases.listDocuments(databaseId, collectionId);
      setStudents(response.documents);
    } catch (error) {
      console.error('❌ Fetch Error:', error);
      showAlert('Error', 'Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const confirmDelete = (id) => {
    const message = 'Are you sure you want to delete this student?';
    if (Platform.OS === 'web') {
      const isConfirmed = window.confirm(message);
      if (isConfirmed) {
        deleteStudent(id);
      }
    } else {
      Alert.alert('Confirm Delete', message, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteStudent(id),
        },
      ]);
    }
  };

  const deleteStudent = async (id) => {
    try {
      setLoading(true);
      await databases.deleteDocument(databaseId, collectionId, id);
      setStudents((prev) => prev.filter((student) => student.$id !== id));
      showAlert('Success', 'Student deleted successfully');
    } catch (error) {
      console.error('❌ Delete Error:', error);
      showAlert('Error', 'Failed to delete student');
    } finally {
      setLoading(false);
    }
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
    setErrors({});
  };

  const validateMarks = () => {
    const newErrors = {};
    const markFields = [
      'Content_Quality',
      'Presentation_Skills',
      'Slide_Design',
      'Engagement_And_Interaction',
      'Time_Management'
    ];

    markFields.forEach(field => {
      const value = updatedMarks[field];
      if (value === '' || isNaN(value)) {
        newErrors[field] = 'Please enter a number';
      } else if (parseInt(value) < 0 || parseInt(value) > 10) {
        newErrors[field] = 'Marks must be between 0-10';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateStudent = async (id) => {
    if (!validateMarks()) {
      return;
    }

    try {
      setLoading(true);
      const marks = {
        Content_Quality: parseInt(updatedMarks.Content_Quality),
        Presentation_Skills: parseInt(updatedMarks.Presentation_Skills),
        Slide_Design: parseInt(updatedMarks.Slide_Design),
        Engagement_And_Interaction: parseInt(updatedMarks.Engagement_And_Interaction),
        Time_Management: parseInt(updatedMarks.Time_Management),
      };
      const updated = await databases.updateDocument(databaseId, collectionId, id, marks);
      setStudents((prev) => prev.map((s) => (s.$id === id ? updated : s)));
      setEditStudent(null);
      showAlert('Success', 'Student marks updated successfully');
    } catch (error) {
      console.error('❌ Update Error:', error);
      showAlert('Error', 'Failed to update student marks');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (Platform.OS === 'web') {
      showAlert('Info', 'For PDF export, please use the mobile app');
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
      showAlert('Success', 'PDF generated and shared successfully');
    } catch (error) {
      console.error('❌ PDF Generation Error:', error);
      showAlert('Error', 'Failed to generate PDF');
    }
  };

  useEffect(() => {
    fetchStudentMarks();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('Students')}
        >
          <Text style={styles.buttonText}>⬅️ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Student Marks Management</Text>
      </View>

      {Platform.OS !== 'web' ? (
        <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
          <Text style={styles.buttonText}>📄 Generate Report</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.webInfo}>For full features including PDF export, please use the mobile app</Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#005566" />
      ) : students.length === 0 ? (
        <Text style={styles.noStudents}>No student records found</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {students.map((student) => (
            <View key={student.$id} style={styles.card}>
              <Text style={styles.cardTitle}>Student No: {student.Student_no}</Text>
              <View style={styles.infoRow}>
                <Text>📅 Year: Y{student.Year}</Text>
                <Text>📆 Semester: S{student.Semester}</Text>
              </View>
              <Text>🖼️ Presentation: {student.Presentation}</Text>

              {editStudent === student.$id ? (
                <>
                  {Object.keys(updatedMarks).map((key) => (
                    <View key={key} style={styles.markRow}>
                      <Text style={styles.label}>{key.replace(/_/g, ' ')}:</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={[styles.input, errors[key] && styles.inputError]}
                          keyboardType="numeric"
                          value={updatedMarks[key]}
                          onChangeText={(text) => setUpdatedMarks({ ...updatedMarks, [key]: text })}
                          maxLength={2}
                        />
                        {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
                      </View>
                    </View>
                  ))}
                  <View style={styles.editButtons}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.cancelButton]} 
                      onPress={() => setEditStudent(null)}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.saveButton]} 
                      onPress={() => updateStudent(student.$id)}
                    >
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.marksContainer}>
                    <Text>📚 Content Quality: {student.Content_Quality}/10</Text>
                    <Text>🎤 Presentation Skills: {student.Presentation_Skills}/10</Text>
                    <Text>🖥️ Slide Design: {student.Slide_Design}/10</Text>
                    <Text>🤝 Engagement: {student.Engagement_And_Interaction}/10</Text>
                    <Text>⏳ Time Management: {student.Time_Management}/10</Text>
                  </View>
                  <Text style={styles.overallScore}>
                    ⭐ Total Score: {
                      student.Content_Quality +
                      student.Presentation_Skills +
                      student.Slide_Design +
                      student.Engagement_And_Interaction +
                      student.Time_Management
                    }/50
                  </Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.editButton]} 
                      onPress={() => startEdit(student)}
                    >
                      <Text style={styles.buttonText}>✏️ Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]} 
                      onPress={() => confirmDelete(student.$id)}
                    >
                      <Text style={styles.buttonText}>🗑️ Delete</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: '#757575',
    padding: 10,
    borderRadius: 8, // Fixed from 'border personally'
    marginRight: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#005566',
    textAlign: 'center',
    flex: 1,
  },
  webInfo: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  noStudents: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  marksContainer: {
    marginVertical: 10,
  },
  markRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  inputContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    width: 60,
    padding: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  editButton: {
    backgroundColor: '#ff9500',
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
  },
  saveButton: {
    backgroundColor: '#00796b',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  pdfButton: {
    backgroundColor: '#005566',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  overallScore: {
    marginTop: 10,
    fontWeight: '600',
    color: '#00796b',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default StudentMarksList;