import React, { useState, useRef, useEffect } from 'react';
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import RNPickerSelect from 'react-native-picker-select';
import CalendarPicker from 'react-native-calendar-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { parse, isValid, format } from 'date-fns';

// Import the UpdateSchedule function from your service file
import { UpdateSchedule } from '../../Libraries/databaseService';
// For fetching the schedule details you can continue to use Appwrite’s client
import { Databases } from 'appwrite';
import client from '../../Libraries/appwrite2';
const databases = new Databases(client);

/*
  ShakeableView:
  Wraps children and applies a shake animation when an error exists.
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

const EditSchedule = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { scheduleId } = route.params;

  // Form state to hold schedule details.
  const [form, setForm] = useState({
    title: '',
    group_id: '',
    semester: '',
    date: '', // Stored as an ISO string
    time: '',
    venue: '',
  });

  const [errors, setErrors] = useState({});

  // Controls for showing the date and time modals.
  const [openDateModal, setOpenDateModal] = useState(false);
  const [openTimeModal, setOpenTimeModal] = useState(false);

  // Temporary state for time (the date picker from react-native-modern-datepicker returns a date string).
  // For the custom time modal we use separate states.
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  // Options for the time picker dropdowns.
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

  // Fetch the existing schedule by its ID.
  const fetchSchedule = async () => {
    try {
      const databaseId = '67dd8a42000b2f5184aa';
      const collectionId = 'PresentationSchedules';
      const response = await databases.getDocument(databaseId, collectionId, scheduleId);
      setForm({
        title: response.title || '',
        group_id: response.group_id || '',
        semester: response.semester || '',
        date: response.date || '',
        time: response.time || '',
        venue: response.venue || '',
      });
      // If a time exists (e.g. "3:05 PM"), try to parse it and set time picker defaults.
      if (response.time) {
        const parts = response.time.split(' ');
        if (parts.length === 2) {
          const [timePart, period] = parts;
          const [hour, minute] = timePart.split(':');
          setSelectedHour(hour);
          setSelectedMinute(minute);
          setSelectedPeriod(period);
        }
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      Alert.alert('Error', 'Unable to load schedule details.');
    }
  };

  useEffect(() => {
    if (scheduleId) {
      fetchSchedule();
    }
  }, [scheduleId]);

  // Updated date selection handler.
  // The DatePicker (react-native-modern-datepicker) returns a date string like "2025/03/31" (or sometimes with time, but we only need the date part).
  const handleDateSelect = (dateString) => {
    console.log("Raw date string from picker:", dateString);
    try {
      // Take only the date part (in case time is appended) and replace "/" with "-" to match the format
      let cleaned = dateString.split(" ")[0].replace(/\//g, "-");
      // Parse the cleaned string as "yyyy-MM-dd"
      const parsedDate = parse(cleaned, "yyyy-MM-dd", new Date());
      if (!isValid(parsedDate)) {
        throw new Error("Invalid date");
      }
      const formattedDate = parsedDate.toISOString();
      console.log("Formatted ISO date:", formattedDate);
      setForm({ ...form, date: formattedDate });
      setOpenDateModal(false);
    } catch (error) {
      console.error("Error parsing date:", error);
      Alert.alert("Error", "The selected date is invalid. Please try again.");
    }
  };

  // For this file, we use our previous time handler.
  const handleTimeChange = (selectedTime) => {
    const hours = selectedTime.getHours();
    const minutes = selectedTime.getMinutes();
    const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes} ${
      hours < 12 ? 'AM' : 'PM'
    }`;
    setForm({ ...form, time: formattedTime });
    setOpenTimeModal(false);
  };

  // Alternatively, you can build a custom time modal (see below).
  // Here, we'll update time from custom dropdowns when "Confirm" is pressed.
  const handleTimeConfirmCustom = () => {
    const formattedTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
    setForm({ ...form, time: formattedTime });
    setOpenTimeModal(false);
  };

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

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const response = await UpdateSchedule(scheduleId, form);
        console.log('Schedule updated:', response);
        Alert.alert('Success', 'Schedule updated successfully!');
        navigation.goBack();
      } catch (error) {
        console.error('Error updating schedule:', error);
        Alert.alert('Error', 'Failed to update schedule. Please try again.');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animatable.View animation="fadeInUp" duration={800} style={styles.card}>
        <Animatable.Text animation="zoomIn" duration={600} style={styles.header}>
          Edit Presentation Schedule
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
              value={form.semester || ''}
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
    const today = new Date(); // Get today's date
    const selectedDay = new Date(selectedDate); // Get the selected date

    // Compare selected date with today and restrict past dates, but allow today
    if (selectedDay < today.setHours(0, 0, 0, 0)) {
      Alert.alert("Invalid date", "You cannot select a past date.");
    } else {
      const formattedDate = format(new Date(selectedDate), 'yyyy-MM-dd'); // Store as ISO format
      setForm({ ...form, date: formattedDate });
      setOpenDateModal(false); // Close modal after selection
    }
  }}
  selectedStartDate={form.date ? new Date(form.date) : undefined}
  textStyle={{ color: '#007bff' }}
  todayBackgroundColor="#e6ffe6"
  selectedDayColor="#007bff"
  selectedDayTextColor="#ffffff"
  minDate={new Date()} // Disable past dates, but allow today
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

        {/* Time Picker Field */}
        <View style={styles.field}>
          <Ionicons name="time-outline" size={20} color="#007bff" style={styles.icon} />
          <ShakeableView error={errors.time} style={styles.inputContainer}>
            <TouchableOpacity
              onPress={() => setOpenTimeModal(true)}
              style={styles.datePicker}
            >
              <Text style={styles.input}>
                {form.time || 'Select Time (HH:MM AM/PM)'}
              </Text>
            </TouchableOpacity>
          </ShakeableView>
          {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
        </View>

        <Modal visible={openTimeModal} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Select Time</Text>
              <RNPickerSelect
                onValueChange={(value) => setSelectedHour(value)}
                value={selectedHour}
                items={hourOptions}
                style={pickerStyles}
                placeholder={{}}
              />
              <RNPickerSelect
                onValueChange={(value) => setSelectedMinute(value)}
                value={selectedMinute}
                items={minuteOptions}
                style={pickerStyles}
                placeholder={{}}
              />
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

        {/* Venue Field */}
        <View style={styles.field}>
          <Ionicons name="location-outline" size={20} color="#007bff" style={styles.icon} />
          <ShakeableView error={errors.venue} style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Venue"
              value={form.venue}
              onChangeText={(value) => setForm({ ...form, venue: value })}
              placeholderTextColor="#999"
            />
          </ShakeableView>
          {errors.venue && <Text style={styles.errorText}>{errors.venue}</Text>}
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveText}>Update Schedule</Text>
        </TouchableOpacity>
      </Animatable.View>
    </ScrollView>
  );
};

export default EditSchedule;

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
    fontSize: 22,
    fontWeight: 'bold',
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
  saveButton: {
    backgroundColor: '#3b5998',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 18,
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