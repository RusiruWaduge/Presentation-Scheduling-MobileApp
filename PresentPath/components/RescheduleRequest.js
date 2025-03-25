import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Client, Databases, ID } from 'appwrite';
import * as AddCalendarEvent from 'react-native-add-calendar-event';

const RescheduleForm = () => {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67dd8453002a601838ad');

  const databases = new Databases(client);

  const submitRequest = async () => {
    try {
      await databases.createDocument(
        '67dd8453002a601838ad',
        'RescheduleRequest',
        ID.unique(),
        { reason, date, time, additionalNotes }
      );
      addToCalendar();
      Alert.alert('Success', 'Reschedule request submitted and added to calendar!');
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const addToCalendar = () => {
    const eventConfig = {
      title: 'Rescheduled Presentation',
      startDate: date.toISOString(),
      endDate: new Date(date.getTime() + 60 * 60 * 1000).toISOString(),
      notes: additionalNotes,
    };
    AddCalendarEvent.presentEventCreatingDialog(eventConfig)
      .then(eventInfo => console.log('Calendar Event Created:', eventInfo))
      .catch(error => console.warn('Error adding event:', error));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Reason for Rescheduling</Text>
      <TextInput value={reason} onChangeText={setReason} style={styles.input} placeholder="Enter reason" />

      <Text style={styles.label}>Preferred New Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
        <Text style={styles.dateText}>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={(event, selectedDate) => {
          setShowDatePicker(false);
          if (selectedDate) setDate(selectedDate);
        }} />
      )}

      <Text style={styles.label}>Preferred Time</Text>
      <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.datePickerButton}>
        <Text style={styles.dateText}>{time.toLocaleTimeString()}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker value={time} mode="time" display="default" onChange={(event, selectedTime) => {
          setShowTimePicker(false);
          if (selectedTime) setTime(selectedTime);
        }} />
      )}

      <Text style={styles.label}>Additional Notes</Text>
      <TextInput value={additionalNotes} onChangeText={setAdditionalNotes} style={styles.input} placeholder="Enter additional notes" multiline />
      
      <TouchableOpacity onPress={submitRequest} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Submit Request</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    margin: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  datePickerButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RescheduleForm;
