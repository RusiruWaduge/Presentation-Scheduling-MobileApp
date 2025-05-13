import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { databases, account } from '../../Libraries/appwriteConfig';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Query } from 'appwrite';

const StickyNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchNotes = async () => {
    try {
      const user = await account.get();
      const response = await databases.listDocuments(
        '67dd8a42000b2f5184aa', // DB ID
        'StickyNotes',          // Collection ID
        [Query.equal('user_id', user.$id)]
      );
      setNotes(response.documents);
    } catch (error) {
      console.error('Fetch notes error:', error.message);
      Alert.alert('Error', 'Failed to fetch notes.');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId) => {
    Alert.alert('Confirm', 'Delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await databases.deleteDocument('67dd8a42000b2f5184aa', 'StickyNotes', noteId);
            setNotes(prev => prev.filter(note => note.$id !== noteId));
          } catch (error) {
            console.error('Delete error:', error.message);
            Alert.alert('Error', 'Failed to delete note.');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchNotes);
    return unsubscribe;
  }, [navigation]);

  const renderNote = ({ item }) => (
    <View style={styles.note}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{item.content}</Text>
      <TouchableOpacity onPress={() => deleteNote(item.$id)}>
        <Text style={styles.delete}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#e6f2ff' }}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="#003366" />
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 40 }} />
      ) : notes.length === 0 ? (
        <Text style={styles.emptyText}>No sticky notes found</Text>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.$id}
          renderItem={renderNote}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddStickyNote')}
      >
        <AntDesign name="pluscircle" size={56} color="#2196F3" />
      </TouchableOpacity>
    </View>
  );
};

export default StickyNotes;

const styles = StyleSheet.create({
  note: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#003366',
  },
  content: {
    color: '#003366',
    fontSize: 14,
  },
  delete: {
    color: '#cc0000',
    marginTop: 10,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    elevation: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    elevation: 5,
  },
});
