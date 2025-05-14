import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ContactUs = () => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:support@presentpath.com');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+1234567890');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../../assets/logo.png')} // 👈 Place your logo in assets folder
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Contact Us</Text>
      <Text style={styles.subtitle}>We'd love to hear from you!</Text>

      <TouchableOpacity style={styles.card} onPress={handleEmailPress}>
        <Icon name="email" size={28} color="#003366" />
        <View style={styles.cardText}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.info}>support@presentpath.com</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={handlePhonePress}>
        <Icon name="phone" size={28} color="#003366" />
        <View style={styles.cardText}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.info}>+123 456 7890</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>PresentPath © 2025</Text>
      </View>
    </ScrollView>
  );
};

export default ContactUs;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    flexGrow: 1,
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#E6F0FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#003366',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardText: {
    marginLeft: 15,
  },
  label: {
    fontSize: 16,
    color: '#003366',
    fontWeight: '600',
  },
  info: {
    fontSize: 15,
    color: '#444',
    marginTop: 2,
  },
  footer: {
    marginTop: 30,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#888',
  },
});
