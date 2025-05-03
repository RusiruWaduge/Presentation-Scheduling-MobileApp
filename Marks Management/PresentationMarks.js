import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Client, Databases, ID } from 'appwrite';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';

const client = new Client();
client.setEndpoint('https://cloud.appwrite.io/v1').setProject('67dd8453002a601838ad');

const databases = new Databases(client);
const databaseId = '67dd8a42000b2f5184aa';
const collectionId = '67e012b2000fd11e41fb';
const presentationSchedulesCollection = 'PresentationSchedules';

const PresentationMarks = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { student } = route.params;

  const [marks, setMarks] = useState({
    Student_no: student.index_number, // Now matches the passed prop
    Content_Quality: 5,
    Presentation_Skills: 5,
    Slide_Design: 5,
    Engagement_And_Interaction: 5,
    Time_Management: 5,
    Year: '',
    Semester: '',
    Presentation: '',
  });

  const [presentations, setPresentations] = useState([]);

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        const response = await databases.listDocuments(databaseId, presentationSchedulesCollection);
        const titles = response.documents.map(doc => doc.title);
        setPresentations(titles);
      } catch (error) {
        console.error('Error fetching presentations:', error);
        Alert.alert('Error', 'Failed to fetch presentations');
      }
    };
    fetchPresentations();
  }, []);

  const handleSliderChange = (name, value) => {
    setMarks(prevMarks => ({ ...prevMarks, [name]: value }));
  };

  const submitMarks = async () => {
    if (!marks.Student_no) {
      Alert.alert('Error', 'Student No is required');
      return;
    }

    if (!marks.Presentation) {
      Alert.alert('Error', 'Please select a presentation');
      return;
    }

    if (!marks.Year || isNaN(parseInt(marks.Year))) {
      Alert.alert('Error', 'Year must be a valid number');
      return;
    }

    if (!marks.Semester || isNaN(parseInt(marks.Semester))) {
      Alert.alert('Error', 'Semester must be a valid number');
      return;
    }

    try {
      const response = await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        {
          ...marks,
          Year: parseInt(marks.Year),
          Semester: parseInt(marks.Semester),
        }
      );

      console.log('✅ Success:', response);
      Alert.alert('Success', 'Marks submitted successfully');

      setMarks({
        Student_no: student.index_number,
        Content_Quality: 5,
        Presentation_Skills: 5,
        Slide_Design: 5,
        Engagement_And_Interaction: 5,
        Time_Management: 5,
        Year: '',
        Semester: '',
        Presentation: '',
      });
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', 'Failed to submit marks');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Presentation Marks</Text>

      <TextInput style={styles.input} placeholder="Student No" value={marks.Student_no.toString()} editable={false} />

      <TextInput
  style={styles.input}
  placeholder="Year"
  value={marks.Year?.toString() || ""}
  keyboardType="numeric"
  onChangeText={value => {
    if (/^[1-4]?$/.test(value)) {  // Only allow numbers 1-4
      setMarks(prevMarks => ({ ...prevMarks, Year: value }));
    }
  }}
  onBlur={() => {
    const numericValue = parseInt(marks.Year, 10);
    if (isNaN(numericValue) || numericValue < 1 || numericValue > 4) {
      setMarks(prevMarks => ({ ...prevMarks, Year: "" })); // Reset if invalid
    } else {
      setMarks(prevMarks => ({ ...prevMarks, Year: numericValue })); // Save valid input
    }
  }}
/>

<TextInput
  style={styles.input}
  placeholder="Semester"
  value={marks.Semester?.toString() || ""}
  keyboardType="numeric"
  onChangeText={value => {
    if (/^[1-2]?$/.test(value)) { // Only allow numbers 1-2
      setMarks(prevMarks => ({ ...prevMarks, Semester: value }));
    }
  }}
  onBlur={() => {
    const numericValue = parseInt(marks.Semester, 10);
    if (isNaN(numericValue) || (numericValue !== 1 && numericValue !== 2)) {
      setMarks(prevMarks => ({ ...prevMarks, Semester: "" })); // Reset if invalid
    } else {
      setMarks(prevMarks => ({ ...prevMarks, Semester: numericValue })); // Save valid input
    }
  }}
/>

      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Select Presentation</Text>
        <Picker
          selectedValue={marks.Presentation}
          onValueChange={itemValue => setMarks(prevMarks => ({ ...prevMarks, Presentation: itemValue }))}
        >
          <Picker.Item label="Select a presentation" value="" />
          {presentations.map((title, index) => (
            <Picker.Item key={index} label={title} value={title} />
          ))}
        </Picker>
      </View>

      {[{ label: 'Content Quality', key: 'Content_Quality' },
        { label: 'Presentation Skills', key: 'Presentation_Skills' },
        { label: 'Slide Design', key: 'Slide_Design' },
        { label: 'Engagement & Interaction', key: 'Engagement_And_Interaction' },
        { label: 'Time Management', key: 'Time_Management' }].map(item => (
        <View key={item.key} style={styles.sliderContainer}>
          <Text style={styles.label}>{item.label}: {marks[item.key]}</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={marks[item.key]}
            onValueChange={value => handleSliderChange(item.key, value)}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.submitButton} onPress={submitMarks}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate('StudentMarksList')}>
        <Text style={styles.viewButtonText}>View All Student Marks</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f1f4f8',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#007bff',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 2 },
  },
  dropdownContainer: {
    width: '90%',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 2 },
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  sliderContainer: {
    width: '90%',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 2 },
  },
  slider: {
    width: '100%',
    height: 40,
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 12,
    width: '90%',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 2 },
  },
  submitText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  viewButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 12,
    width: '90%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 2 },
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default PresentationMarks;
