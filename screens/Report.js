import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import DatePicker from 'react-native-modern-datepicker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Utility function to pad numbers (used in time formatting)
const pad = (num) => num.toString().padStart(2, '0');

// Format a date (assumed to be in "YYYY-MM-DD") as "13 April 2025"
const formatFriendlyDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Updated time formatting function that uses UTC hours/minutes
const formatFriendlyTime = (timeString) => {
  const date = new Date(timeString);
  // If the conversion fails, return the original string.
  if (isNaN(date)) return timeString;
  const hours = date.getUTCHours();      // Use UTC values like in your dashboard
  const minutes = date.getUTCMinutes();
  if (hours === 0 && minutes === 0) return '12:00 AM';
  if (hours === 12 && minutes === 0) return '12:00 PM';
  const period = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${pad(minutes)} ${period}`;
};

// Convert records to an HTML string with advanced (inline) CSS styling.
const convertRecordsToHTML = (records) => {
  const style = `<style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f7f7f7; }
    h2 { text-align: center; color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    table, th, td { border: 1px solid #ddd; }
    th, td { padding: 12px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
  </style>`;

  const header = `<h2>Presentation Report</h2>`;

  const tableHeader = `<table>
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
        <tbody>`;

  const tableRows = records
    .map((item) => {
      const friendlyDate = formatFriendlyDate(item.date);
      const friendlyTime = formatFriendlyTime(item.time);
      return `<tr>
              <td>${item.title}</td>
              <td>${item.group_id}</td>
              <td>${item.semester}</td>
              <td>${friendlyDate}</td>
              <td>${friendlyTime}</td>
              <td>${item.venue}</td>
            </tr>`;
    })
    .join('');

  const tableFooter = `</tbody></table>`;

  const htmlString = `
    <html>
      <head>
        <meta charset="UTF-8">
        ${style}
      </head>
      <body>
        ${header}
        ${tableHeader}
        ${tableRows}
        ${tableFooter}
      </body>
    </html>
  `;
  return htmlString;
};

const Report = ({ route }) => {
  // Retrieve scheduledPresentations passed via navigation.
  const { scheduledPresentations } =
    route.params || { scheduledPresentations: [] };

  const [selectedDate, setSelectedDate] = useState('2025/04/13');
  const [reportResult, setReportResult] = useState(null);
  const [filteredRecords, setFilteredRecords] = useState([]);

  // When a date is selected using the DatePicker
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Generate a report for the selected date.
  const generateReport = () => {
    // Convert "YYYY/MM/DD" to "YYYY-MM-DD"
    const selectedDateFormatted = selectedDate.replace(/\//g, '-');

    // Filter presentations based on the selected date.
    const filtered = scheduledPresentations.filter((item) =>
      item.date.startsWith(selectedDateFormatted)
    );

    setFilteredRecords(filtered);
    setReportResult(
      `Total scheduled presentations on ${selectedDateFormatted}: ${filtered.length}`
    );
  };

  // Download the report as an HTML file.
  const downloadReport = async () => {
    if (filteredRecords.length === 0) {
      Alert.alert('No data', 'Please generate a report first.');
      return;
    }
    const selectedDateFormatted = selectedDate.replace(/\//g, '-');
    const htmlData = convertRecordsToHTML(filteredRecords);
    const filePath = `${FileSystem.documentDirectory}report_${selectedDateFormatted}.html`;

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
      <DatePicker
        mode="calendar"
        onSelectedChange={handleDateChange}
        options={{
          backgroundColor: '#ffffff',
          textHeaderColor: '#000',
          textDefaultColor: '#000',
          selectedTextColor: '#fff',
          mainColor: '#0066CC',
          textSecondaryColor: '#000',
          borderColor: 'rgba(0,0,0,0.1)',
        }}
        style={styles.datePicker}
      />
      <TouchableOpacity style={styles.generateButton} onPress={generateReport}>
        <Text style={styles.generateButtonText}>Generate Report</Text>
      </TouchableOpacity>
      {reportResult && <Text style={styles.resultText}>{reportResult}</Text>}
      {filteredRecords.length > 0 && (
        <View style={styles.recordsContainer}>
          {filteredRecords.map((item) => (
            <View style={styles.recordItem} key={item.$id}>
              <Text style={styles.recordText}>Title: {item.title}</Text>
              <Text style={styles.recordText}>
                Group ID: {item.group_id}
              </Text>
              <Text style={styles.recordText}>
                Semester: {item.semester}
              </Text>
              <Text style={styles.recordText}>
                Date: {formatFriendlyDate(item.date)}
              </Text>
              <Text style={styles.recordText}>
                Time: {formatFriendlyTime(item.time)}
              </Text>
              <Text style={styles.recordText}>Venue: {item.venue}</Text>
            </View>
          ))}
        </View>
      )}
      {filteredRecords.length > 0 && (
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={downloadReport}
        >
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
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  datePicker: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  generateButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '80%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  recordsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  recordItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recordText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
  },
  downloadButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '80%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default Report;
