import React from "react";
import { View, Text, StyleSheet } from "react-native";

const StudentProfile = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Profile</Text>
      {/* Add more detailed performance info here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 5,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default StudentProfile;
