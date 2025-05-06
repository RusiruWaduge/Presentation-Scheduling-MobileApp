import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Utility: pad numbers
const pad = (num) => num.toString().padStart(2, '0');

// Format date nicely
const formatFriendlyDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Format time using UTC
const formatFriendlyTime = (timeString) => {
  const date = new Date(timeString);
  if (isNaN(date)) return timeString;
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  if (hours === 0 && minutes === 0) return '12:00 AM';
  if (hours === 12 && minutes === 0) return '12:00 PM';
  const period = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${pad(minutes)} ${period}`;
};

// HTML generator
const convertRecordsToHTML = (records) => {
  const style = `<style>
    body { font-family: Arial; padding: 20px; background: #f7f7f7; }
    h2 { text-align: center; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
  </style>`;
  const header = `<h2>Presentation Report</h2>`;
  const tableRows = records.map(item => `
    <tr>
      <td>${item.title}</td>
      <td>${item.group_id}</td>
      <td>${item.semester}</td>
      <td>${formatFriendlyDate(item.date)}</td>
      <td>${formatFriendlyTime(item.time)}</td>
      <td>${item.venue}</td>
    </tr>`).join('');
  return `
    <html><head><meta charset="UTF-8">${style}</head>
    <body>
      ${header}
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Group ID</th>
            <th>Semester</th>
            <th>Date</th>
            <th>Time</th>
            <th>Venue</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </body></html>`;
};

const Report = ({ route }) => {
  const { scheduledPresentations } = route.params || { scheduledPresentations: [] };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [reportResult, setReportResult] = useState('');

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const generateReport = () => {
    const selectedStr = selectedDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const filtered = scheduledPresentations.filter((item) =>
      item.date.startsWith(selectedStr)
    );
    setFilteredRecords(filtered);
    setReportResult(`Total scheduled presentations on ${selectedStr}: ${filtered.length}`);
  };

  const downloadReport = async () => {
    if (filteredRecords.length === 0) {
      Alert.alert('No data', 'Please generate a report first.');
      return;
    }
    const dateStr = selectedDate.toISOString().split('T')[0];
    const htmlData = convertRecordsToHTML(filteredRecords);
    const filePath = `${FileSystem.documentDirectory}report_${dateStr}.html`;

    try {
      await FileSystem.writeAsStringAsync(filePath, htmlData, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath);
      } else {
        Alert.alert('Download Successful', `File saved at: ${filePath}`);
      }
    } catch (error) {
      Alert.alert('Download Failed', `Error saving report: ${error.message}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Schedule Analyzer</Text>
      <Text style={styles.label}>Select a date:</Text>

      <CalendarPicker
        onDateChange={handleDateChange}
        selectedStartDate={selectedDate}
        allowRangeSelection={false}
        todayBackgroundColor="#e6ffe6"
        selectedDayColor="#66bb6a"
        selectedDayTextColor="#fff"
        width={340}
      />

      <TouchableOpacity style={styles.generateButton} onPress={generateReport}>
        <Text style={styles.generateButtonText}>Generate Report</Text>
      </TouchableOpacity>

      {reportResult ? <Text style={styles.resultText}>{reportResult}</Text> : null}

      {filteredRecords.map((item) => (
        <View style={styles.recordItem} key={item.$id}>
          <Text style={styles.recordText}>Title: {item.title}</Text>
          <Text style={styles.recordText}>Group ID: {item.group_id}</Text>
          <Text style={styles.recordText}>Semester: {item.semester}</Text>
          <Text style={styles.recordText}>Date: {formatFriendlyDate(item.date)}</Text>
          <Text style={styles.recordText}>Time: {formatFriendlyTime(item.time)}</Text>
          <Text style={styles.recordText}>Venue: {item.venue}</Text>
        </View>
      ))}

      {filteredRecords.length > 0 && (
        <TouchableOpacity style={styles.downloadButton} onPress={downloadReport}>
          <Text style={styles.downloadButtonText}>Download Report</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
  },
  generateButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '80%',
    marginTop: 20,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 18,
    color: '#333',
    marginVertical: 15,
  },
  recordItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    width: '100%',
  },
  recordText: {
    fontSize: 16,
    color: '#444',
  },
  downloadButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '80%',
    marginTop: 20,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default Report;
