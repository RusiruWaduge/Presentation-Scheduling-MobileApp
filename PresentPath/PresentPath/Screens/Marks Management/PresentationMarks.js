import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Client, Databases, ID } from 'appwrite';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
  const [presentations, setPresentations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ Year: false, Semester: false, Presentation: false });

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

  const validateInputs = () => {
    const newErrors = {
      Year: !marks.Year || isNaN(parseInt(marks.Year)) || parseInt(marks.Year) < 1 || parseInt(marks.Year) > 4,
      Semester: !marks.Semester || isNaN(parseInt(marks.Semester)) || (parseInt(marks.Semester) !== 1 && parseInt(marks.Semester) !== 2),
      Presentation: !marks.Presentation,
    };
    setErrors(newErrors);
    return !newErrors.Year && !newErrors.Semester && !newErrors.Presentation;
  };

  const submitMarks = async () => {
    if (!marks.Student_no) {
      Alert.alert('Error', 'Student No is required');
      return;
    }
    if (!validateInputs()) {
      Alert.alert('Error', 'Please correct the highlighted fields');
      return;
    }

    setIsSubmitting(true);
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
      setErrors({ Year: false, Semester: false, Presentation: false });
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', 'Failed to submit marks');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Presentation Marks</Text>

      {/* Student Info Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Student Information</Text>
        <TextInput
          style={[styles.input, errors.Student_no && styles.inputError]}
          placeholder="Student No"
          value={marks.Student_no.toString()}
          editable={false}
        />
        <TextInput
          style={[styles.input, errors.Year && styles.inputError]}
          placeholder="Year (1-4)"
          value={marks.Year?.toString() || ''}
          keyboardType="numeric"
          onChangeText={value => {
            if (/^[1-4]?$/.test(value)) {
              setMarks(prevMarks => ({ ...prevMarks, Year: value }));
              setErrors(prev => ({ ...prev, Year: false }));
            }
          }}
          onBlur={() => {
            const numericValue = parseInt(marks.Year, 10);
            if (isNaN(numericValue) || numericValue < 1 || numericValue > 4) {
              setErrors(prev => ({ ...prev, Year: true }));
            } else {
              setMarks(prevMarks => ({ ...prevMarks, Year: numericValue.toString() }));
              setErrors(prev => ({ ...prev, Year: false }));
            }
          }}
        />
        <TextInput
          style={[styles.input, errors.Semester && styles.inputError]}
          placeholder="Semester (1-2)"
          value={marks.Semester?.toString() || ''}
          keyboardType="numeric"
          onChangeText={value => {
            if (/^[1-2]?$/.test(value)) {
              setMarks(prevMarks => ({ ...prevMarks, Semester: value }));
              setErrors(prev => ({ ...prev, Semester: false }));
            }
          }}
          onBlur={() => {
            const numericValue = parseInt(marks.Semester, 10);
            if (isNaN(numericValue) || (numericValue !== 1 && numericValue !== 2)) {
              setErrors(prev => ({ ...prev, Semester: true }));
            } else {
              setMarks(prevMarks => ({ ...prevMarks, Semester: numericValue.toString() }));
              setErrors(prev => ({ ...prev, Semester: false }));
            }
          }}
        />
        <View style={[styles.dropdownContainer, errors.Presentation && styles.inputError]}>
          <Text style={styles.label}>Select Presentation</Text>
          <Picker
            selectedValue={marks.Presentation}
            onValueChange={itemValue => {
              setMarks(prevMarks => ({ ...prevMarks, Presentation: itemValue }));
              setErrors(prev => ({ ...prev, Presentation: !itemValue }));
            }}
            style={styles.picker}
          >
            <Picker.Item label="Select a presentation" value="" />
            {presentations.map((title, index) => (
              <Picker.Item key={index} label={title} value={title} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Marks Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Evaluation Marks</Text>
        {[
          { label: 'Content Quality', key: 'Content_Quality' },
          { label: 'Presentation Skills', key: 'Presentation_Skills' },
          { label: 'Slide Design', key: 'Slide_Design' },
          { label: 'Engagement & Interaction', key: 'Engagement_And_Interaction' },
          { label: 'Time Management', key: 'Time_Management' },
        ].map(item => (
          <View key={item.key} style={styles.sliderContainer}>
            <Text style={styles.label}>{item.label}: {marks[item.key]}</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={marks[item.key]}
              onValueChange={value => handleSliderChange(item.key, value)}
              minimumTrackTintColor="#007bff"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#007bff"
            />
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.disabledButton]}
        onPress={submitMarks}
        disabled={isSubmitting}
        activeOpacity={0.7}
      >
        <Text style={styles.submitText}>{isSubmitting ? 'Submitting...' : 'Submit'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => navigation.navigate('StudentMarksList')}
        activeOpacity={0.7}
      >
        <Text style={styles.viewButtonText}>View All Student Marks</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f5f7fa',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 8,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007bff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  dropdownContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  picker: {
    width: '100%',
    height: 50,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sliderContainer: {
    width: '100%',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  viewButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default PresentationMarks;