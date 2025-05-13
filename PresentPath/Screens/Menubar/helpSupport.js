import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HelpSupport = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../../assets/Logo.png')} // ✅ Place your logo here
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Help & Support</Text>
      <Text style={styles.subtitle}>
        Need assistance? We're here to help you!
      </Text>

      <View style={styles.card}>
        <Icon name="frequently-asked-questions" size={28} color="#003366" />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Frequently Asked Questions</Text>
          <Text style={styles.cardText}>
            Explore common questions and answers about PresentPath.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Icon name="account-question" size={28} color="#003366" />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Account Issues</Text>
          <Text style={styles.cardText}>
            Trouble logging in or accessing your profile? Reach out to us.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Icon name="email-check" size={28} color="#003366" />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Contact Support</Text>
          <Text style={styles.cardText}>
            Email us at support@presentpath.com or call +123 456 7890.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Visit Support Website</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>PresentPath © 2025</Text>
      </View>
    </ScrollView>
  );
};

export default HelpSupport;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F0F6FF',
    flexGrow: 1,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003366',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#E6F0FA',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 15,
    marginBottom: 20,
    width: '100%',
    alignItems: 'flex-start',
    shadowColor: '#003366',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    marginLeft: 15,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: '#444',
  },
  button: {
    backgroundColor: '#003366',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
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
