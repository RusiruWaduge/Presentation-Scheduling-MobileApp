import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator, Modal } from 'react-native';
import TopBar from './topBar';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { Client, Databases, Account, Query } from 'appwrite';
import { generateGuidelines} from './gemini'; // Import the API-based feedback function



// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67dd8453002a601838ad');

const databases = new Databases(client);
const account = new Account(client);

const Profile = () => {
  const [selectedYear, setSelectedYear] = useState('overall');
  const [feedbackData, setFeedbackData] = useState({});
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userIndexNumber, setUserIndexNumber] = useState(null);
  const [guidelines, setGuidelines] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const databaseId = '67dd8a42000b2f5184aa';
  const marksCollectionId = '67e012b2000fd11e41fb';
  const userCollectionId = '67f22df100281c3981da';

  // Fetch logged-in user and their index number by name
  const fetchUserIndexNumber = async () => {
    try {
      const user = await account.get();
      const nameParts = user.name.trim().split(' ');
      if (nameParts.length < 2) {
        throw new Error('User name must include first and last names.');
      }
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1]; // Use last part as lastName to handle middle names

      const userResponse = await databases.listDocuments(databaseId, userCollectionId, [
        Query.equal('firstName', firstName),
        Query.equal('lastName', lastName)
      ]);

      if (userResponse.documents.length > 0) {
        const indexNumber = userResponse.documents[0].indexNumber;
        setUserIndexNumber(indexNumber);
      } else {
        throw new Error('User document not found for the given name.');
      }
    } catch (error) {
      console.error('Error fetching user index number:', error.message, error);
      Alert.alert('Error', 'Failed to fetch user details. Please ensure your name is correctly registered.');
    }
  };

  // Fetch marks from Appwrite for the logged-in user
  const fetchMarks = async () => {
    if (!userIndexNumber) return; // Wait until userIndexNumber is fetched
    setLoading(true);
    try {
      const response = await databases.listDocuments(databaseId, marksCollectionId, [
        Query.equal('Student_no', userIndexNumber)
      ]);
      setMarks(response.documents);
    } catch (error) {
      console.error('Error fetching marks:', error.message, error);
      Alert.alert('Error', 'Failed to fetch marks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserIndexNumber();
  }, []);

  useEffect(() => {
    if (userIndexNumber) {
      fetchMarks();
    }
  }, [userIndexNumber]);

  // Generate feedback (Flask-based, for feedback section)
  const generateLocalFeedback = useCallback(async (filteredMarks, isOverall) => {
    if (filteredMarks.length === 0) return 'No marks available.';

    const total = filteredMarks.reduce((acc, curr) => ({
      content_quality: acc.content_quality + (curr.Content_Quality || 0),
      presentation_skills: acc.presentation_skills + (curr.Presentation_Skills || 0),
      slide_design: acc.slide_design + (curr.Slide_Design || 0),
      engagement: acc.engagement + (curr.Engagement_And_Interaction || 0),
      time_management: acc.time_management + (curr.Time_Management || 0),
    }), {
      content_quality: 0,
      presentation_skills: 0,
      slide_design: 0,
      engagement: 0,
      time_management: 0,
    });

    const count = filteredMarks.length;
    const payload = {
      content_quality: total.content_quality / count,
      presentation_skills: total.presentation_skills / count,
      slide_design: total.slide_design / count,
      engagement: total.engagement / count,
      time_management: total.time_management / count,
      year: isOverall ? 0 : parseInt(selectedYear.replace('year', ''), 10),
    };

    try {
      const response = await fetch('http://192.168.8.117:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to fetch feedback.');

      const data = await response.json();
      return data.yearly_feedback || data.overall_feedback || 'Feedback not available.';
    } catch (error) {
      console.error('Error generating feedback:', error);
      return 'Error generating feedback.';
    }
  }, [selectedYear]);

  // Fetch feedback (Flask-based)
  const fetchFeedback = useCallback(async (year) => {
    try {
      const filtered = marks.filter(mark =>
        year === 'overall' ? true : mark.Year?.toString() === year.replace('year', '')
      );
      const feedback = await generateLocalFeedback(filtered, year === 'overall');
      setFeedbackData(prev => ({
        ...prev,
        [year]: {
          feedback,
          examiner: 'Prof. Smith',
          status: 'Reviewed',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
        },
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to generate feedback.');
    }
  }, [marks, generateLocalFeedback]);

  // Fetch guidelines (API-based, for overall performance)
  const fetchGuidelines = async () => {
    try {
      const filtered = marks.filter(mark => true); // All marks for overall
      const feedbackMarks = filtered.map(mark => ({
        subject: mark.Presentation || 'Presentation',
        score: (
          (mark.Content_Quality || 0) +
          (mark.Presentation_Skills || 0) + // Fixed typo
          (mark.Slide_Design || 0) +
          (mark.Engagement_And_Interaction || 0) +
          (mark.Time_Management || 0)
        ) / 5, // Average of the five metrics
        status: 'Pass' // Simplified; adjust based on your logic
      }));
      if (typeof generateGuidelines !== 'function') {
        throw new Error('generateGuidelines is not a function. Check the import from feedback.js.');
      }
      console.log('Calling generateGuidelines with marks:', feedbackMarks);
      const guidelinesText = await generateGuidelines(feedbackMarks);
      setGuidelines(guidelinesText);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching guidelines:', error);
      Alert.alert('Error', `Failed to fetch guidelines: ${error.message}`);
    }
  };

  useEffect(() => {
    if (marks.length > 0) {
      fetchFeedback(selectedYear);
    }
  }, [selectedYear, marks, fetchFeedback]);

  const currentData = feedbackData[selectedYear] || {};

  const filteredMarks = marks.filter(mark =>
    selectedYear === 'overall' ? true : mark.Year?.toString() === selectedYear.replace('year', '')
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Student Number: {item.Student_no || 'N/A'}</Text>
      <Text style={styles.text}>Content Quality: {item.Content_Quality ?? 'N/A'}</Text>
      <Text style={styles.text}>Presentation Skills: {item.Presentation_Skills ?? 'N/A'}</Text>
      <Text style={styles.text}>Slide Design: {item.Slide_Design ?? 'N/A'}</Text>
      <Text style={styles.text}>Engagement: {item.Engagement_And_Interaction ?? 'N/A'}</Text>
      <Text style={styles.text}>Time Management: {item.Time_Management ?? 'N/A'}</Text>
      <Text style={styles.text}>Year: {item.Year ?? 'N/A'}</Text>
      <Text style={styles.text}>Semester: {item.Semester ?? 'N/A'}</Text>
      <Text style={styles.text}>Presentation Type: {item.Presentation ?? 'N/A'}</Text>
    </View>
  );

  const generatePDF = async () => {
    // Calculate performance summary (average marks)
    const calculateAverages = () => {
      if (filteredMarks.length === 0) return { content: 0, presentation: 0, slide: 0, engagement: 0, time: 0 };
      const totals = filteredMarks.reduce(
        (acc, item) => ({
          content: acc.content + (item.Content_Quality || 0),
          presentation: acc.presentation + (item.Presentation_Skills || 0),
          slide: acc.slide + (item.Slide_Design || 0),
          engagement: acc.engagement + (item.Engagement_And_Interaction || 0),
          time: acc.time + (item.Time_Management || 0),
        }),
        { content: 0, presentation: 0, slide: 0, engagement: 0, time: 0 }
      );
      return {
        content: (totals.content / filteredMarks.length).toFixed(1),
        presentation: (totals.presentation / filteredMarks.length).toFixed(1),
        slide: (totals.slide / filteredMarks.length).toFixed(1),
        engagement: (totals.engagement / filteredMarks.length).toFixed(1),
        time: (totals.time / filteredMarks.length).toFixed(1),
      };
    };
    const averages = calculateAverages();
  
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Student Performance Report</title>
   
        </head>
        <body style="font-family: Arial, Helvetica, sans-serif; margin: 30px; background-color: #ECEFF1; font-color: #000000;">
          <div style="max-width: 750px; margin: 0 auto; background-color: #FFFFFF; padding: 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); color: #000000; box-sizing: border-box;">
            <!-- Header -->
            <div style="background: linear-gradient(to right, #FF5722, #0288D1); color: #FFFFFF; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <div style="font-size: 32px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); margin-bottom: 8px;">
                Sri Lanka Institute of Information Technology
              </div>
              <h1 style="margin: 8px 0; font-size: 24px;">Student Performance Report</h1>
              <p style="margin: 4px 0; font-size: 14px;">Student Number: ${userIndexNumber || 'N/A'}</p>
              <p style="margin: 4px 0; font-size: 14px;">Year: ${selectedYear === 'overall' ? 'Overall' : selectedYear.replace('year', 'Year ')}</p>
              <p style="margin: 4px 0; font-size: 12px;">Report Generated: ${new Date().toLocaleString()}</p>
            </div>
  
            <!-- Performance Summary -->
            <div style="margin: 20px 0;">
              <h2 style="color: #FF5722; font-size: 20px; border-bottom: 3px solid #0288D1; padding-bottom: 6px; margin-bottom: 12px;">Performance Summary</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 12px; background-color: #F5F5F5; padding: 12px; border-radius: 8px;">
                <div style="flex: 1; min-width: 120px; text-align: center; padding: 8px; background-color: #4CAF50; color: #FFFFFF; border-radius: 6px; font-size: 12px;">
                  <strong>Content Quality</strong><br>${averages.content || 'N/A'}
                </div>
                <div style="flex: 1; min-width: 120px; text-align: center; padding: 8px; background-color: #4CAF50; color: #FFFFFF; border-radius: 6px; font-size: 12px;">
                  <strong>Presentation Skills</strong><br>${averages.presentation || 'N/A'}
                </div>
                <div style="flex: 1; min-width: 120px; text-align: center; padding: 8px; background-color: #4CAF50; color: #FFFFFF; border-radius: 6px; font-size: 12px;">
                  <strong>Slide Design</strong><br>${averages.slide || 'N/A'}
                </div>
                <div style="flex: 1; min-width: 120px; text-align: center; padding: 8px; background-color: #4CAF50; color: #FFFFFF; border-radius: 6px; font-size: 12px;">
                  <strong>Engagement</strong><br>${averages.engagement || 'N/A'}
                </div>
                <div style="flex: 1; min-width: 120px; text-align: center; padding: 8px; background-color: #4CAF50; color: #FFFFFF; border-radius: 6px; font-size: 12px;">
                  <strong>Time Management</strong><br>${averages.time || 'N/A'}
                </div>
              </div>
            </div>
  
            <!-- Feedback Section -->
            <div style="margin: 20px 0;">
              <h2 style="color: #FF5722; font-size: 20px; border-bottom: 3px solid #0288D1; padding-bottom: 6px; margin-bottom: 12px;">Feedback</h2>
              <div style="background-color: #E8F5E9; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <p style="margin: 8px 0; font-size: 14px; line-height: 1.6; color: #000000;">${currentData.feedback || 'No feedback available.'}</p>
                <p style="margin: 6px 0; font-size: 12px; color: #000000;"><strong>Examiner:</strong> ${currentData.examiner || 'N/A'}</p>
                <p style="margin: 6px 0; font-size: 12px; color: #000000;"><strong>Status:</strong> ${currentData.status || 'N/A'}</p>
                <p style="margin: 6px 0; font-size: 12px; color: #000000;"><strong>Created At:</strong> ${new Date(currentData.$createdAt).toLocaleString() || 'N/A'}</p>
                <p style="margin: 6px 0; font-size: 12px; color: #000000;"><strong>Updated At:</strong> ${new Date(currentData.$updatedAt).toLocaleString() || 'N/A'}</p>
              </div>
            </div>
  
            <!-- Marks Section -->
            <div style="margin: 20px 0;">
              <h2 style="color: #FF5722; font-size: 20px; border-bottom: 3px solid #0288D1; padding-bottom: 6px; margin-bottom: 12px;">Detailed Marks</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px;">
                <tr style="background-color: #0288D1; color: #FFFFFF; font-weight: bold;">
                  <th style="border: 1px solid #162e53; padding: 8px; text-align: left; font-size: 12px; width: 12%;">Student No</th>
                  <th style="border: 1px solid #162e53; padding: 8px; text-align: left; font-size: 12px; width: 12%;">Content Quality</th>
                  <th style="border: 1px solid #162e53; padding: 8px; text-align: left; font-size: 12px; width: 12%;">Presentation Skills</th>
                  <th style="border: 1px solid #162e53; padding: 8px; text-align: left; font-size: 12px; width: 10%;">Slide Design</th>
                  <th style="border: 1px solid #162e53; padding: 8px; text-align: left; font-size: 12px; width: 10%;">Engagement</th>
                  <th style="border: 1px solid #162e53; padding: 8px; text-align: left; font-size: 12px; width: 12%;">Time Management</th>
                  <th style="border: 1px solid #162e53; padding: 8px; text-align: left; font-size: 12px; width: 8%;">Year</th>
                  <th style="border: 1px solid #162e53; padding: 8px; text-align: left; font-size: 12px; width: 8%;">Semester</th>
                  <th style="border: 1px solid #162e53; padding: 8px; text-align: left; font-size: 12px; width: 16%;">Presentation Type</th>
                </tr>
                ${filteredMarks.map((item, index) => `
                  <tr style="background-color: ${index % 2 === 0 ? '#F5F5F5' : '#FFFFFF'};">
                    <td style="border: 1px solid #162e53; padding: 8px; font-size: 12px; color: #000000;">${item.Student_no || 'N/A'}</td>
                    <td style="border: 1px solid #162e53; padding: 8px; font-size: 12px; color: #000000;">${item.Content_Quality ?? 'N/A'}</td>
                    <td style="border: 1px solid #162e53; padding: 8px; font-size: 12px; color: #000000;">${item.Presentation_Skills ?? 'N/A'}</td>
                    <td style="border: 1px solid #162e53; padding: 8px; font-size: 12px; color: #000000;">${item.Slide_Design ?? 'N/A'}</td>
                    <td style="border: 1px solid #162e53; padding: 8px; font-size: 12px; color: #000000;">${item.Engagement_And_Interaction ?? 'N/A'}</td>
                    <td style="border: 1px solid #162e53; padding: 8px; font-size: 12px; color: #000000;">${item.Time_Management ?? 'N/A'}</td>
                    <td style="border: 1px solid #162e53; padding: 8px; font-size: 12px; color: #000000;">${item.Year ?? 'N/A'}</td>
                    <td style="border: 1px solid #162e53; padding: 8px; font-size: 12px; color: #000000;">${item.Semester ?? 'N/A'}</td>
                    <td style="border: 1px solid #162e53; padding: 8px; font-size: 12px; color: #000000;">${item.Presentation ?? 'N/A'}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
  
            <!-- Footer -->
            <div style="text-align: center; margin-top: 20px; color: #78909C; font-size: 10px; border-top: 1px solid #B0BEC5; padding-top: 8px;">
              <p>Generated on ${new Date().toLocaleString()} | Sri Lanka Institute of Information Technology</p>
              <p style="margin-top: 4px;">Page <span style="font-weight: bold;">1</span> of <span style="font-weight: bold;">1</span></p>
            </div>
          </div>
        </body>
      </html>
    `;
  
    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await shareAsync(uri);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF.');
    }
  };
  return (
    <ScrollView style={styles.container}>
      <TopBar title="Student Performance" />
      <Text style={styles.performanceHeader}>Hello Student!</Text>

      {/* Year Selection */}
      <View style={styles.buttonContainer}>
        {['year1', 'year2', 'year3', 'year4', 'overall'].map((year, idx) => (
          <TouchableOpacity
            key={year}
            onPress={() => setSelectedYear(year)}
            style={[styles.yearButton, selectedYear === year && styles.activeButton]}
          >
            <Text style={[styles.buttonText, selectedYear === year && styles.activeButtonText]}>
              {year === 'overall' ? 'Overall' : `Year ${idx + 1}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feedback Section */}
      <View style={styles.feedbackContainer}>
        <Text style={styles.sectionTitle}>Here's your Feedback</Text>
        <Text style={styles.feedbackText}>{currentData.feedback || 'No feedback available.'}</Text>
        <Text style={styles.examiner}>Examiner: {currentData.examiner || 'N/A'}</Text>
        <Text style={styles.status}>Status: {currentData.status || 'N/A'}</Text>
        <Text style={styles.date}>Created: {currentData.$createdAt ? new Date(currentData.$createdAt).toLocaleString() : 'N/A'}</Text>
        <Text style={styles.date}>Updated: {currentData.$updatedAt ? new Date(currentData.$updatedAt).toLocaleString() : 'N/A'}</Text>
        {selectedYear === 'overall' && (
          <TouchableOpacity style={styles.guidelinesButton} onPress={fetchGuidelines}>
            <Text style={styles.guidelinesButtonText}>View Guidelines</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Guidelines Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Performance Guidelines</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>{guidelines}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Marks Section */}
      <View style={styles.marksContainer}>
        <Text style={styles.marksHeader}>Student Marks</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#FF5722" />
        ) : (
          <FlatList
            data={filteredMarks}
            keyExtractor={(item, index) => item.$id || index.toString()}
            renderItem={renderItem}
          />
        )}
      </View>

      {/* Generate PDF Button */}
      <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
        <Text style={styles.pdfButtonText}>Generate PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Profile;

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  performanceHeader: { fontSize: 24, fontWeight: 'bold', marginVertical: 16, textAlign: 'center' },
  buttonContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 },
  yearButton: { backgroundColor: '#ccc', padding: 10, margin: 5, borderRadius: 8 },
  activeButton: { backgroundColor: '#FF5722' },
  buttonText: { color: '#000' },
  activeButtonText: { color: '#fff' },
  feedbackContainer: { backgroundColor: '#f3f5bc', padding: 16, borderRadius: 10, marginBottom: 16 },
  sectionTitle: { fontSize: 25, fontWeight: 'bold', marginBottom: 8},
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
    lineHeight: 26,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 12,
    textShadowColor: 'rgb(209, 203, 203)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  examiner: { fontSize: 14, color: '#555' },
  status: { fontSize: 14, color: '#555' },
  date: { fontSize: 12, color: '#777' },
  guidelinesButton: { backgroundColor: '#2196F3', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' },
  guidelinesButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  modalContent: {
    backgroundColor: '#f3f5bc',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 25, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalScroll: { maxHeight: 400 },
  modalText: { fontSize: 16, lineHeight: 24,  },
  closeButton: { backgroundColor: '#FF5722', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' },
  closeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  marksContainer: { backgroundColor: '#f3f5bc', padding: 16, borderRadius: 10, marginBottom: 16 },
  marksHeader: { fontSize: 25, fontWeight: 'bold', marginBottom: 8 },
  card: { padding: 16, backgroundColor: '#e9e9e9', borderRadius: 10, marginBottom: 10 },
  title: { fontWeight: 'bold', fontSize: 18 },
  text: { fontSize: 15, marginTop: 2 },
  pdfButton: { backgroundColor: '#FF5722', padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 20 },
  pdfButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});