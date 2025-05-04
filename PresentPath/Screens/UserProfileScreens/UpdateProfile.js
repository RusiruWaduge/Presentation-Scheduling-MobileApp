import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { account, databases } from "../../Libraries/appwriteConfig";
import { Query, ID } from "appwrite";

const DATABASE_ID = "67dd8a42000b2f5184aa";
const COLLECTION_ID = "67f22df100281c3981da";

const UpdateProfile = ({ navigation }) => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    semester: "",
    email: "",
    groupID: "",
    indexNumber: "",
    contactNumber: "",

  });
  const [documentId, setDocumentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await account.get();
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal("email", user.email)]
        );

        if (response.documents.length > 0) {
          const doc = response.documents[0];
          setProfile({
            firstName: doc.firstName,
            lastName: doc.lastName,
            semester: doc.semester,
            email: doc.email,
            groupID: doc.groupID,
            indexNumber: doc.indexNumber,
            contactNumber: doc.contactNumber,

          });
          setDocumentId(doc.$id);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        Alert.alert("Error", "Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    if (!documentId) {
      Alert.alert("Error", "No profile found to update.");
      return;
    }

    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, documentId, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        semester: profile.semester,
        email: profile.email,
        groupID: profile.groupID,
        indexNumber: profile.indexNumber,
        contactNumber: profile.contactNumber,
        
      });

      Alert.alert("Success", "Profile updated successfully.");
      navigation.goBack();
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Update Profile</Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={profile.firstName}
            onChangeText={(text) =>
              setProfile((prev) => ({ ...prev, firstName: text }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={profile.lastName}
            onChangeText={(text) =>
              setProfile((prev) => ({ ...prev, lastName: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={profile.email}
            onChangeText={(text) =>
              setProfile((prev) => ({ ...prev, email: text }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Semester"
            value={profile.semester}
            onChangeText={(text) =>
              setProfile((prev) => ({ ...prev, semester: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Group ID"
            value={profile.groupID}
            onChangeText={(text) =>
              setProfile((prev) => ({ ...prev, groupID: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Index Number"
            value={profile.indexNumber}
            onChangeText={(text) =>
              setProfile((prev) => ({ ...prev, indexNumber: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Contact Number"
            value={profile.contactNumber}
            onChangeText={(text) =>
              setProfile((prev) => ({ ...prev, contactNumber: text }))
            }
          />

          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#0275d8",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: "#d9534f",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UpdateProfile;
