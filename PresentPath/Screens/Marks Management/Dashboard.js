import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { account } from '../../Libraries/appwriteConfig'; // adjust the path based on your project

const Dashboard = () => {
  const navigation = useNavigation();

  const dashboardItems = [
    {
      title: 'Student Management',
      icon: 'people',
      screen: 'Students',
      color: '#4CAF50',
    },
    {
      title: 'Marks Overview',
      icon: 'assessment',
      screen: 'Marks',
      color: '#2196F3',
    },
    {
      title: 'Add Presentation Marks',
      icon: 'add-circle',
      screen: 'PresentationMarks',
      color: '#FF9800',
    },
    {
      title: 'View All Marks',
      icon: 'list-alt',
      screen: 'Marks',
      color: '#9C27B0',
    },
  ];

  const handleLogout = async () => {
    try {
      await account.deleteSession('current'); 
      navigation.replace('UserLogin');
    } catch (error) {
      console.error('Logout Error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.topBar}>
        {/* BACK BUTTON */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>

        {/* TITLE */}
        <Text style={styles.header}>Marks Management Dashboard</Text>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.gridContainer}>
        {dashboardItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: item.color }]}
            onPress={() => {
              if (item.screen === 'PresentationMarks') {
                navigation.navigate('PresentationMarks', {
                  student: {
                    index_number: '',
                    firstName: '',
                    lastName: '',
                    semester: '',
                    groupID: ''
                  }
                });
              } else {
                navigation.navigate(item.screen);
              }
            }}
          >
            <MaterialIcons name={item.icon} size={40} color="white" />
            <Text style={styles.cardText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  header: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center', // center the title
  },
  logoutButton: {
    padding: 5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    height: 150,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default Dashboard;
