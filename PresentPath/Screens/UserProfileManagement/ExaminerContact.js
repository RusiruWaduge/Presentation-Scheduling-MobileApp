import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const examiners = [
  {
    id: 1,
    name: "Dr. Jane Smith",
    email: "jane.smith@example.com",
    phone: "+94 77 123 4567",
    department: "Computer Science",
  },
  {
    id: 2,
    name: "Prof. Michael Fernando",
    email: "michael.fernando@example.com",
    phone: "+94 71 987 6543",
    department: "Information Technology",
  },
  {
    id: 3,
    name: "Ms. Ayesha Perera",
    email: "ayesha.perera@example.com",
    phone: "+94 70 456 7890",
    department: "Software Engineering",
  },
];

const ExaminerContacts = ({ navigation }) => {
  const handleEmailPress = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhonePress = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#003366" />
        </TouchableOpacity>

        <Text style={styles.header}>Examiner Contact Details</Text>

        {examiners.map((examiner) => (
          <View key={examiner.id} style={styles.card}>
            <Text style={styles.name}>{examiner.name}</Text>
            <Text style={styles.department}>{examiner.department}</Text>

            <TouchableOpacity
              onPress={() => handleEmailPress(examiner.email)}
              style={styles.row}
            >
              <Ionicons name="mail" size={20} color="#2196F3" />
              <Text style={styles.link}>{examiner.email}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlePhonePress(examiner.phone)}
              style={styles.row}
            >
              <Ionicons name="call" size={20} color="#2196F3" />
              <Text style={styles.link}>{examiner.phone}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExaminerContacts;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f6fc", // light background
  },
  container: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: "#f0f6fc",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#003366",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 4,
  },
  department: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  link: {
    marginLeft: 10,
    fontSize: 15,
    color: "#2196F3",
    textDecorationLine: "underline",
  },
});
