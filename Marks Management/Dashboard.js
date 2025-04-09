import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

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
      screen: 'StudentMarksList',
      color: '#9C27B0',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Marks Management Dashboard</Text>
      
      <View style={styles.gridContainer}>
        {dashboardItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: item.color }]}
            onPress={() => navigation.navigate(item.screen)}
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
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