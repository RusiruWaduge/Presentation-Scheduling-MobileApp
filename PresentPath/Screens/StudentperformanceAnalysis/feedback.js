import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import { generateGuidelines } from './feedbackApi';

// Debug the import
console.log('Imported generateGuidelines:', generateGuidelines);

const Feedback = () => {
  const [feedbackData, setFeedbackData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guidelines, setGuidelines] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/predict');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          const groupedData = {};
          data.forEach(entry => {
            const year = entry.year;
            if (!groupedData[year]) {
              groupedData[year] = {
                total: {
                  content_quality: 0,
                  presentation_skills: 0,
                  slide_design: 0,
                  engagement: 0,
                  time_management: 0
                },
                count: 0,
                feedbacks: []
              };
            }
            groupedData[year].total.content_quality += entry.content_quality || 0;
            groupedData[year].total.presentation_skills += entry.presentation_skills || 0;
            groupedData[year].total.slide_design += entry.slide_design || 0;
            groupedData[year].total.engagement += entry.engagement || 0;
            groupedData[year].total.time_management += entry.time_management || 0;
            groupedData[year].count += 1;
            if (entry.feedback) {
              groupedData[year].feedbacks.push(entry.feedback);
            }
          });
          setFeedbackData(groupedData);
        } else {
          setError('Invalid data format');
        }
      } catch (error) {
        setError('Failed to load feedback');
        console.error('Failed to load feedback:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchGuidelines = async () => {
    try {
      const marks = Object.entries(feedbackData).flatMap(([year, data]) =>
        Array(data.count).fill().map((_, idx) => ({
          subject: `Presentation ${year}-${idx + 1}`,
          score: (
            (data.total.content_quality / data.count) +
            (data.total.presentation_skills / data.count) +
            (data.total.slide_design / data.count) +
            (data.total.engagement / data.count) +
            (data.total.time_management / data.count)
          ) / 5,
          status: 'Pass'
        }))
      );
      if (marks.length === 0) {
        throw new Error('No marks available to generate guidelines.');
      }
      if (typeof generateGuidelines !== 'function') {
        throw new Error('generateGuidelines is not a function. Check the import from feedbackApi.js.');
      }
      console.log('Calling generateGuidelines with marks:', marks);
      const guidelinesText = await generateGuidelines(marks);
      console.log('Received guidelines:', guidelinesText);
      setGuidelines(guidelinesText);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching guidelines:', error);
      setError(`Failed to fetch guidelines: ${error.message}`);
    }
  };

  const calculateAverage = (total, count) => {
    const averages = {};
    for (const key in total) {
      averages[key] = (total[key] / count).toFixed(2);
    }
    return averages;
  };

  // Emoji mapping for guidelines
  const getEmoji = (index) => {
    const emojis = ['📊', '⏰', '💬', '🎨', '🚀', '📚', '🌟'];
    return emojis[index % emojis.length];
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#26A69A" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Performance Feedback 🌟</Text>

      <TouchableOpacity style={styles.guidelinesButton} onPress={fetchGuidelines}>
        <LinearGradient
          colors={['#26A69A', '#FF6F61']}
          style={styles.gradientButton}
        >
          <Text style={styles.guidelinesButtonText}>View Overall Guidelines</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Animatable.View
            animation="fadeInUp"
            duration={300}
            style={styles.modalContent}
          >
            <LinearGradient
              colors={['#E6F0FA', '#FFF8E1']}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>Overall Performance Guidelines 🎉</Text>
              <ScrollView style={styles.modalScroll}>
                {guidelines.split('\n').map((line, index) => (
                  <Animatable.View
                    key={index}
                    animation="bounceIn"
                    duration={500}
                    delay={index * 100}
                    style={styles.guidelineCard}
                  >
                    <LinearGradient
                      colors={['#26A69A', '#FF6F61']}
                      style={styles.cardGradient}
                    >
                      <Text style={styles.guidelineItem}>
                        {line.startsWith('-') ? `${getEmoji(index)} ${line.slice(2)}` : line}
                      </Text>
                    </LinearGradient>
                  </Animatable.View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Animatable.View animation="pulse" iterationCount="infinite" duration={1500}>
                  <LinearGradient
                    colors={['#26A69A', '#FF6F61']}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </LinearGradient>
                </Animatable.View>
              </TouchableOpacity>
            </LinearGradient>
          </Animatable.View>
        </View>
      </Modal>

      {Object.keys(feedbackData).length === 0 ? (
        <Text style={styles.noFeedbackText}>No feedback available 😔</Text>
      ) : (
        Object.entries(feedbackData).map(([year, data]) => {
          const averages = calculateAverage(data.total, data.count);
          return (
            <View key={year} style={styles.feedbackContainer}>
              <Text style={styles.yearText}>📅 Year: {year}</Text>
              <Text style={styles.subHeading}>Average Scores:</Text>
              {Object.entries(averages).map(([key, avg]) => (
                <Text key={key} style={styles.averageText}>
                  {key.replace(/_/g, ' ')}: {avg}
                </Text>
              ))}
              <Text style={styles.subHeading}>Feedback:</Text>
              {data.feedbacks.length > 0 ? (
                data.feedbacks.map((fb, idx) => (
                  <Text key={idx} style={styles.feedbackText}>
                    ✅ {fb}
                  </Text>
                ))
              ) : (
                <Text style={styles.noFeedbackText}>No feedback available for this year 😔</Text>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  feedbackContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  yearText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  subHeading: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  averageText: {
    fontSize: 16,
    color: '#444',
    marginLeft: 8,
    marginTop: 4,
  },
  feedbackText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 8,
    marginTop: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
  },
  noFeedbackText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
  guidelinesButton: {
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 14,
    alignItems: 'center',
    borderRadius: 10,
  },
  guidelinesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
  },
  modalGradient: {
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#FF6F61',
  },
  modalScroll: {
    maxHeight: 400,
  },
  guidelineCard: {
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardGradient: {
    padding: 14,
    borderRadius: 10,
  },
  guidelineItem: {
    fontSize: 17,
    lineHeight: 26,
    color: '#fff',
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Feedback;