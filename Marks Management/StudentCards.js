// StudentCards.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, TextInput } from 'react-native';
import { Client, Databases, Query } from 'appwrite';
import { Card, Title, Paragraph, Button, Provider as PaperProvider, Searchbar, Text, ActivityIndicator } from 'react-native-paper';

const client = new Client();
client.setEndpoint('https://cloud.appwrite.io/v1').setProject('67dd8453002a601838ad');

const databases = new Databases(client);
const databaseId = '67dd8a42000b2f5184aa';
const collectionId = 'Students';

const StudentCards = ({ navigation }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => 
        student.index_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(databaseId, collectionId, [
        Query.orderAsc('last_name')
      ]);
      const formatted = response.documents.map((doc) => ({
        id: doc.$id,
        first_name: doc.first_name,
        last_name: doc.last_name,
        index_number: doc.index_number
      }));
      setStudents(formatted);
      setFilteredStudents(formatted);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      Alert.alert('Error', 'Could not load student data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const handleAddMarks = (student) => {
    navigation.navigate('PresentationMarks', { student });
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>{item.first_name} {item.last_name}</Title>
        <Paragraph style={styles.subtitle}>Index No: {item.index_number}</Paragraph>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button 
          mode="contained" 
          onPress={() => handleAddMarks(item)}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Add Marks
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator animating={true} color="#6200ee" size="large" />
      ) : (
        <>
          <Text style={styles.emptyText}>No students found</Text>
          {searchQuery !== '' && (
            <Button 
              mode="text" 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              Clear search
            </Button>
          )}
        </>
      )}
    </View>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Searchbar
          placeholder="Search by name or index number"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor="#6200ee"
          placeholderTextColor="#888"
        />
        
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  searchBar: {
    margin: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  cardActions: {
    justifyContent: 'flex-end',
    padding: 8,
  },
  button: {
    borderRadius: 8,
    backgroundColor: '#6200ee',
    paddingVertical: 4,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  clearButton: {
    marginTop: 8,
  },
});

export default StudentCards;