import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { account, databases } from "../Libraries/appwriteConfig";

const UserSignupScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [semester, setSemester] = useState("");
  const [groupId, setGroupId] = useState("");
  const [indexNumber, setIndexNumber] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      const user = await account.create(
        "unique()",
        email,
        password,
        firstName + " " + lastName
      );

      await databases.createDocument("Students", "unique()", {
        userId: user.$id,
        first_name: firstName,
        last_name: lastName,
        semester: semester,
        group_id: groupId,
        index_number: indexNumber,
        email: email,
        contact_number: contactNumber,
        password: password, // Consider hashing before storing
      });

      console.log("User Signup successful:", user);
      navigation.navigate("UserLogin"); // Ensure this screen is defined
    } catch (error) {
      console.error("User Signup error:", error);
      Alert.alert("User Signup Failed", error.message);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        placeholder="Semester"
        value={semester}
        onChangeText={setSemester}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Group ID"
        value={groupId}
        onChangeText={setGroupId}
      />
      <TextInput
        placeholder="Index Number"
        value={indexNumber}
        onChangeText={setIndexNumber}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Contact Number"
        value={contactNumber}
        onChangeText={setContactNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignup} />
    </View>
  );
};

export default UserSignupScreen;
