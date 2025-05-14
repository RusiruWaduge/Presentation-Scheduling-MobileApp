import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import Swiper from 'react-native-swiper';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current; // Animation for text
  const buttonAnim = useRef(new Animated.Value(0)).current; // Animation for button

  // Start animations when component mounts
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, buttonAnim]);

  return (
    <Swiper
      loop={false}
      showsPagination={true}
      dotColor="rgba(255,255,255,0.3)"
      activeDotColor="#FFFFFF"
      paginationStyle={styles.pagination}
    >
      {/* Slide 1 */}
      <View style={styles.slide}>
        <Image
          source={require('../assets/logo.png')} // Replace with unique illustration
          style={styles.image}
        />
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }, ]}>
        <View style={{ width: '100%', paddingHorizontal: 20 }}>
              <Text 
                numberOfLines={1}
                style={{ 
                  fontSize: 25, 
                  fontWeight: '600', 
                  fontStyle: 'bold', 
                  fontFamily: 'sans-serif', 
                  color: 'white', 
                  textAlign: 'center', 
                  marginBottom: 20 
                }}
              >
                "Present better with PresentPath"
              </Text>
            </View>


          <Text style={styles.text}>
            Streamline scheduling and assessments with a platform built for students and examiners.
          </Text>
        </Animated.View>
      </View>

      {/* Slide 2 */}
      <View style={[styles.slide, { backgroundColor: '#003366' }]}>
        <Image
          source={require('../assets/logo.png')} // Replace with unique illustration
          style={styles.image}
        />
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Smart Scheduling</Text>
          <Text style={styles.text}>
            Effortlessly plan and manage presentation slots with real-time updates.
          </Text>
        </Animated.View>
      </View>

      {/* Slide 3 */}
      <View style={[styles.slide, { backgroundColor: '#003366' }]}>
        <Image
          source={require('../assets/logo.png')} // Replace with unique illustration
          style={styles.image}
        />
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>For All Users</Text>
          <Text style={styles.text}>
            Students upload materials and view schedules; examiners assign marks with ease. 
            Users can get AI generated feedbacks.
          </Text>
        </Animated.View>
      </View>

      {/* Slide 4 */}
      <View style={[styles.slide, { backgroundColor: '#003366' }]}>
        <Image
          source={require('../assets/logo.png')} // Replace with unique illustration
          style={styles.image}
        />
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Get Started</Text>
          <Text style={styles.text}>Join PresentPath and simplify your workflow today!</Text>
        </Animated.View>
        <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonAnim }] }]}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('UserLogin')}
          >
            <Text style={styles.buttonText}>Start Now</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Swiper>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    backgroundColor: '#003366', // Default blue gradient base
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  image: {
    width: width * 0.6,
    height: width * 0.6,
    resizeMode: 'contain',
    borderRadius: 30, // Increase this for more rounded corners
    borderWidth: 5,
    borderColor: '#f3f5bc', // Optional: add a visible border color
    marginBottom: 40,
  },
  
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  text: {
    fontSize: 16,
    color: '#F1F5F9',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FBBF24', // Bright yellow for CTA
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  pagination: {
    bottom: 40,
  },
});

export default OnboardingScreen;