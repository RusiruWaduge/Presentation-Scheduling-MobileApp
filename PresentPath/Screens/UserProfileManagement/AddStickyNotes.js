import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { databases, account } from '../../Libraries/appwriteConfig';
import { ID, Permission, Role } from 'appwrite';

const AddStickyNote = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const addNote = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Validation', 'Both title and content are required');
      return;
    }

    try {
      const user = await account.get();

      await databases.createDocument(
        '67dd8a42000b2f5184aa', // DB ID
        'StickyNotes', // Collection ID
        ID.unique(),
        {
          title,
          content,
          user_id: user.$id,
        },
        [
          Permission.read(Role.user(user.$id)),
          Permission.write(Role.user(user.$id)),
        ]
      );

      setTitle('');
      setContent('');
      navigation.goBack();
    } catch (error) {
      console.error('Add note error:', error);
      Alert.alert('Error', 'Failed to add note');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#003366" />
        </TouchableOpacity>
        <View style={styles.card}>
          <Text style={styles.heading}>📝 Add Sticky Note</Text>

          <TextInput
            placeholder="Note Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholderTextColor="#b0c4de"
          />

          <TextInput
            placeholder="Write your note here..."
            value={content}
            onChangeText={setContent}
            style={[styles.input, styles.textarea]}
            multiline
            placeholderTextColor="#b0c4de"
          />

          <TouchableOpacity style={styles.button} onPress={addNote}>
            <Text style={styles.buttonText}>Save Note</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddStickyNote;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f6fc', // soft background
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
   backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#003366',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#eaf3fb',
    borderColor: '#2196F3',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#003366',
    marginBottom: 16,
  },
  textarea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
