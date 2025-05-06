import React, { useState, useRef, useEffect } from 'react';
import { 
  Animated,
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select'; // Dropdown Picker
import CalendarPicker from 'react-native-calendar-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { parse, isValid, format } from "date-fns";

// Import Appwrite SDK
import { Databases } from 'appwrite';
import client from '../../Libraries/appwrite2'; // Centralized Appwrite config

const databases = new Databases(client);

/*
  ShakeableView:
  - Wraps children and applies a shake animation if an error exists.
*/
const ShakeableView = ({ error, style, children }) => {
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [error, shakeAnimation]);

  return (
    <Animated.View style={[style, { transform: [{ translateX: shakeAnimation }] }]}>
      {children}
    </Animated.View>
  );
};

const CreateSchedule = () => {
  // Form state for the schedule
  const [form, setForm] = useState({
    title: '',
    group_id: '',
    semester: '',
    date: '', // Stored as an ISO string
    time: '', // Formatted time string (e.g. "3:05 PM")
    venue: '',
  });

  // Validation error state
  const [errors, setErrors] = useState({});

  // Modal states for our custom pickers
  const [openDateModal, setOpenDateModal] = useState(false);
  const [openTimeModal, setOpenTimeModal] = useState(false);

  // Temporary state for the date picker (if needed)
  const [tempDate, setTempDate] = useState(new Date());

  // For the custom time picker, we use states for hour, minute, and period:
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  // Options for the time picker RNPickerSelect components:
  const hourOptions = Array.from({ length: 12 }, (_, i) => ({
    label: String(i + 1),
    value: String(i + 1),
  }));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    label: i < 10 ? `0${i}` : String(i),
    value: i < 10 ? `0${i}` : String(i),
  }));
  const periodOptions = [
    { label: 'AM', value: 'AM' },
    { label: 'PM', value: 'PM' },
  ];

  // Handler for selecting a date from the modal date picker
  const handleDateSelect = (dateString) => {
    console.log("Raw date string from picker:", dateString); // Debug
  
    try {
      // Parse using date-fns for consistency
      const parsedDate = parse(dateString, "yyyy/MM/dd HH:mm", new Date());
      console.log("Parsed Date Object:", parsedDate); // Debug
  
      if (!isValid(parsedDate)) {
        throw new Error("Invalid date");
      }
  
      // Convert parsed date to ISO format
      const formattedDate = format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss");
      console.log("Formatted ISO Date:", formattedDate); // Debug
  
      setForm({ ...form, date: formattedDate });
      setOpenDateModal(false);
    } catch (error) {
      console.error("Error parsing date:", error);
      Alert.alert("Error", "The selected date is invalid.");
    }
  };
  

  // Handler for confirming the time selection
  const handleTimeConfirmCustom = () => {
    const formattedTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
    setForm({ ...form, time: formattedTime });
    setOpenTimeModal(false);
  };

  // Basic form validation
  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.group_id.trim()) newErrors.group_id = 'Group ID is required';
    if (!form.semester) newErrors.semester = 'Semester is required';
    if (!form.date) newErrors.date = 'Date is required';
    if (!form.time) newErrors.time = 'Time is required';
    if (!form.venue.trim()) newErrors.venue = 'Venue is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submission handler to create the schedule via Appwrite
  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const response = await databases.createDocument(
          '67dd8a42000b2f5184aa', 
          'PresentationSchedules', 
          'unique()', // Auto-generate document ID
          { ...form }
        );
        console.log('Schedule Created:', response);
        Alert.alert('Success', 'Schedule created successfully!');
        // Reset the form after success
        setForm({
          title: '',
          group_id: '',
          semester: '',
          date: '',
          time: '',
          venue: '',
        });
        setErrors({});
      } catch (error) {
        console.error('Error creating schedule:', error);
        Alert.alert('Error', 'Failed to create schedule. Please try again.');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animatable.View animation="fadeInUp" duration={800} style={styles.card}>
        <Animatable.Text animation="zoomIn" duration={600} style={styles.header}>
          Create a New Presentation Schedule
        </Animatable.Text>
        
        {/* Presentation Title Field */}
        <View style={styles.field}>
          <Ionicons name="document-text-outline" size={20} color="#007bff" style={styles.icon} />
          <ShakeableView error={errors.title} style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter presentation title"
              value={form.title}
              onChangeText={(value) => setForm({ ...form, title: value })}
              placeholderTextColor="#999"
            />
          </ShakeableView>
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Group ID Field */}
        <View style={styles.field}>
          <Ionicons name="people-outline" size={20} color="#007bff" style={styles.icon} />
          <ShakeableView error={errors.group_id} style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Group ID"
              value={form.group_id}
              onChangeText={(value) => setForm({ ...form, group_id: value })}
              placeholderTextColor="#999"
            />
          </ShakeableView>
          {errors.group_id && <Text style={styles.errorText}>{errors.group_id}</Text>}
        </View>

        {/* Semester Dropdown Field */}
        <View style={styles.field}>
          <Ionicons name="calendar-outline" size={20} color="#007bff" style={styles.icon} />
          <ShakeableView error={errors.semester} style={styles.inputContainer}>
            <RNPickerSelect
              onValueChange={(value) => setForm({ ...form, semester: value })}
              items={[
                { label: 'Year 1 Semester 1', value: 'Year 1 Semester 1' },
                { label: 'Year 1 Semester 2', value: 'Year 1 Semester 2' },
                { label: 'Year 2 Semester 1', value: 'Year 2 Semester 1' },
                { label: 'Year 2 Semester 2', value: 'Year 2 Semester 2' },
                { label: 'Year 3 Semester 1', value: 'Year 3 Semester 1' },
                { label: 'Year 3 Semester 2', value: 'Year 3 Semester 2' },
                { label: 'Year 4 Semester 1', value: 'Year 4 Semester 1' },
                { label: 'Year 4 Semester 2', value: 'Year 4 Semester 2' },
              ]}
              placeholder={{ label: 'Select Semester', value: null }}
              style={pickerStyles}
            />
          </ShakeableView>
          {errors.semester && <Text style={styles.errorText}>{errors.semester}</Text>}
        </View>

        {/* Date Picker Field */}
        <View style={styles.field}>
  <Ionicons name="calendar-outline" size={20} color="#007bff" style={styles.icon} />
  <ShakeableView error={errors.date} style={styles.inputContainer}>
    <TouchableOpacity onPress={() => setOpenDateModal(true)} style={styles.datePicker}>
      <Text style={styles.input}>
        {form.date
          ? format(new Date(form.date), 'MM.dd.yyyy') // Display formatted date if selected
          : "Select Date (MM.DD.YYYY)"} 
      </Text>
            </TouchableOpacity>
          </ShakeableView>
          {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
        </View>

        {/* Time Picker Field */}
        <View style={styles.field}>
          <Ionicons name="time-outline" size={20} color="#007bff" style={styles.icon} />
          <ShakeableView error={errors.time} style={styles.inputContainer}>
            <TouchableOpacity onPress={() => setOpenTimeModal(true)} style={styles.datePicker}>
              <Text style={styles.input}>
                {form.time || 'Select Time (HH:MM AM/PM)'}
              </Text>
            </TouchableOpacity>
          </ShakeableView>
          {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
        </View>

        {/* Venue */}
        <View style={styles.field}>
          <Ionicons name="location-outline" size={20} color="#007bff" style={styles.icon} />
          <ShakeableView error={errors.venue} style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter venue"
              value={form.venue}
              onChangeText={(value) => setForm({ ...form, venue: value })}
              placeholderTextColor="#999"
            />
          </ShakeableView>
          {errors.venue && <Text style={styles.errorText}>{errors.venue}</Text>}
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <LinearGradient colors={['#4c669f', '#3b5998']} style={styles.gradient}>
            <Text style={styles.submitButtonText}>Create Schedule</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>

     {/* DATE PICKER MODAL */}
     <Modal
      transparent={true}
      animationType="slide"
      visible={openDateModal}
      onRequestClose={() => setOpenDateModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <CalendarPicker
            onDateChange={(selectedDate) => {
              const formattedDate = format(new Date(selectedDate), 'yyyy-MM-dd'); // Store as ISO format
              setForm({ ...form, date: formattedDate });
              setOpenDateModal(false); // Close modal after selection
            }}
            selectedStartDate={form.date ? new Date(form.date) : undefined}
            textStyle={{ color: '#007bff' }}
            todayBackgroundColor="#e6ffe6"
            selectedDayColor="#007bff"
            selectedDayTextColor="#ffffff"
          />
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setOpenDateModal(false)}
          >
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

      {/* TIME PICKER MODAL */}
      <Modal visible={openTimeModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Time</Text>
            {/* Hour Picker */}
            <RNPickerSelect
              onValueChange={(value) => setSelectedHour(value)}
              value={selectedHour}
              items={hourOptions}
              style={pickerStyles}
              placeholder={{}}
            />
            {/* Minute Picker */}
            <RNPickerSelect
              onValueChange={(value) => setSelectedMinute(value)}
              value={selectedMinute}
              items={minuteOptions}
              style={pickerStyles}
              placeholder={{}}
            />
            {/* AM/PM Picker */}
            <RNPickerSelect
              onValueChange={(value) => setSelectedPeriod(value)}
              value={selectedPeriod}
              items={periodOptions}
              style={pickerStyles}
              placeholder={{}}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleTimeConfirmCustom}>
              <Text style={styles.modalButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { marginTop: 8 }]} onPress={() => setOpenTimeModal(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};



const pickerStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    elevation: 2,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f4068',
    marginBottom: 15,
    textAlign: 'center',
  },
  field: {
    marginBottom: 15,
  },
  icon: {
    position: 'absolute',
    left: 10,
    top: 12,
  },
  inputContainer: {
    marginLeft: 35,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 5,
    fontSize: 16,
  },
  datePicker: {
    paddingVertical: 10,
  },
  errorText: {
    color: 'red',
    marginLeft: 35,
    marginTop: 5,
  },
  submitButton: {
    marginTop: 15,
  },
  gradient: {
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  /* Modal Styles */
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center alignment for a polished look
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Subtle dimming effect
  },
  modalContent: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center', // Ensures content inside is horizontally centered
    justifyContent: 'flex-start', // Allows for proper stacking of child elements
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  calendarPicker: {
    alignSelf: 'stretch', // Ensures the calendar spans the available width
    marginBottom: 16, // Adds spacing below the CalendarPicker
  },
  modalHeader: {
    fontSize: 20, // Increased for better readability
    fontWeight: 'bold',
    color: '#333', // Neutral, modern header color
    marginBottom: 16, // More spacing for separation
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#0069d9', // Brighter blue for better aesthetics
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8, // Slightly larger for a modern feel
    marginTop: 16,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600', // Semi-bold text for emphasis
    textTransform: 'uppercase', // For button text consistency
  },
});

export default CreateSchedule;