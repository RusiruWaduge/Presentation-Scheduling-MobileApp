import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const OnboardingScreen = () => {
  const navigation = useNavigation();

  return (
    <Swiper loop={false} showsPagination={true} dotColor="#ccc" activeDotColor="#2196F3">
      <View style={styles.slide}>
        <Image source={require('../assets/logo.png')} style={styles.image} />
        <Text style={styles.title}>Welcome to PresentPath</Text>
        <Text style={styles.text}>
          A powerful platform designed to streamline scheduling and assessment for both students and examiners.
        </Text>
      </View>

      <View style={styles.slide}>
        <Image source={require('../assets/logo.png')} style={styles.image} />
        <Text style={styles.title}>Smart Presentation Scheduling</Text>
        <Text style={styles.text}>
          Plan, organize, and manage presentation slots efficiently, with real-time updates and notifications.
        </Text>
      </View>

      <View style={styles.slide}>
        <Image source={require('../assets/logo.png')} style={styles.image} />
        <Text style={styles.title}>For Students & Examiners</Text>
        <Text style={styles.text}>
          Students can register, upload materials, and view schedules. Examiners can assign marks and feedback easily.
        </Text>
      </View>

      <View style={styles.slide}>
        <Image source={require('../assets/logo.png')} style={styles.image} />
        <Text style={styles.title}>Get Started</Text>
        <Text style={styles.text}>Let’s begin your journey with PresentPath!</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('UserLogin')}
        >
          <Text style={styles.buttonText}>Start Now</Text>
        </TouchableOpacity>
      </View>
    </Swiper>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    color: '#003366',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: '#2196F3',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#2196F3',
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
