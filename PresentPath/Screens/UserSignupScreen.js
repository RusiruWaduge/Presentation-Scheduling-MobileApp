import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { account, databases } from "../Libraries/appwriteConfig";

const DATABASE_ID = "67dd8a42000b2f5184aa";
const COLLECTION_ID = "67f22df100281c3981da";

const UserSignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [semester, setSemester] = useState("");
  const [groupID, setGroupID] = useState("");
  const [indexNumber, setIndexNumber] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const handleSignup = async () => {
    try {
      const user = await account.create("unique()", email, password, name);
      console.log("Signup successful:", user);

      const data = {
        firstName,
        lastName,
        email,
        semester,
        groupID,
        indexNumber,
        contactNumber,
        role: "Student",
      };

      await databases.createDocument(DATABASE_ID, COLLECTION_ID, "unique()", data);

      Alert.alert("Signup Successful", "You have been successfully registered!");
      navigation.replace("UserLogin");
    } catch (error) {
      console.error("Signup failed:", error);
      Alert.alert("Signup Failed", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Student Signup</Text>
          <Text style={styles.subtitle}>Create your account</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.sectionTitle}>Personal Details</Text>

          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />

          <Text style={styles.label}>Select Semester</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={semester}
              onValueChange={(itemValue) => setSemester(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Semester" value="" />
              <Picker.Item label="Year 1 Semester 1" value="Year 1 Semester 1" />
              <Picker.Item label="Year 1 Semester 2" value="Year 1 Semester 2" />
              <Picker.Item label="Year 2 Semester 1" value="Year 2 Semester 1" />
              <Picker.Item label="Year 2 Semester 2" value="Year 2 Semester 2" />
              <Picker.Item label="Year 3 Semester 1" value="Year 3 Semester 1" />
              <Picker.Item label="Year 3 Semester 2" value="Year 3 Semester 2" />
              <Picker.Item label="Year 4 Semester 1" value="Year 4 Semester 1" />
              <Picker.Item label="Year 4 Semester 2" value="Year 4 Semester 2" />
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Group ID"
            value={groupID}
            onChangeText={setGroupID}
          />
          <TextInput
            style={styles.input}
            placeholder="Index Number"
            value={indexNumber}
            onChangeText={setIndexNumber}
          />
          <TextInput
            style={styles.input}
            placeholder="Contact Number"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
          />

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Signup</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("UserLogin")}>
            <Text style={styles.loginLink}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UserSignupScreen;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#f0f2f5",
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e1e1e",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    height: 45,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#333",
  },
  pickerWrapper: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loginLink: {
    color: "#4f46e5",
    fontSize: 14,
    marginTop: 18,
    textAlign: "center",
  },
});
