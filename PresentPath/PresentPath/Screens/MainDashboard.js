import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';

const MainDashboard = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradient}
      >
        <Animatable.View 
          animation="fadeInDown" 
          duration={1500}
          style={styles.header}
        >
          <Icon name="dashboard" size={40} color="#fff" />
          <Text style={styles.title}>Examiner Dashboard</Text>
          <Text style={styles.subtitle}>Manage your academic activities</Text>
        </Animatable.View>

        <View style={styles.buttonContainer}>
          <Animatable.View 
            animation="fadeInUp" 
            duration={1000}
            delay={300}
          >
            <TouchableOpacity
              style={[styles.button, styles.marksButton]}
              onPress={() => navigation.navigate('MarksDashboard')}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Icon name="assessment" size={28} color="#fff" />
                <Text style={styles.buttonText}>Marks Management</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#fff" />
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View 
            animation="fadeInUp" 
            duration={1000}
            delay={500}
          >
            <TouchableOpacity
              style={[styles.button, styles.presentationButton]}
              onPress={() => navigation.navigate('PresentationDashboard')}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Icon name="date-range" size={28} color="#fff" />
                <Text style={styles.buttonText}>Presentation Scheduler</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#fff" />
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View 
            animation="fadeInUp" 
            duration={1000}
            delay={700}
            style={styles.footer}
          >
            <Text style={styles.footerText}>Academic Year 2023/2024</Text>
          </Animatable.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 15,
  },
  marksButton: {
    backgroundColor: '#4CAF50',
  },
  presentationButton: {
    backgroundColor: '#FF5722',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
});

export default MainDashboard;