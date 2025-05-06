import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  Animated,
  Modal 
} from 'react-native';
import { TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, FontAwesome } from 'react-native-vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator } from 'react-native';
import { Dimensions, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CreateSchedule from './CreateSchedule';
import Notifications from './Notifications';
import Profile from './Profile';
import EditSchedule from './EditSchedule';
import Report from './Report';
import { useRef } from 'react';


// Appwrite service method for fetching schedules
import { SaveCompletedPresentation } from '../../Libraries/databaseService';
import { GetSchedules,  GetCompletedPresentations } from '../../Libraries/databaseService';
import { deleteDocument } from '../../Libraries/databaseService';
// ----- Helper functions for formatting date and time -----
const formatDate = (dateString) => {
    // Create a Date object from the database string (e.g., "2023-10-05")
    const date = new Date(dateString);
    // Format the date as "Oct 5, 2023"
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  //time
  const pad = (num) => num.toString().padStart(2, '0');

  const formatTime = (timeString) => {
      // Parse the time string to Date object
      const date = new Date(timeString);
  
      // If the string is not a valid date, return the original string
      if (isNaN(date)) return timeString;
  
      // Get hours and minutes
      const hours = date.getUTCHours();  // Use getUTCHours for UTC-based times
      const minutes = date.getUTCMinutes();  // Use getUTCMinutes
  
      // Handle edge cases like "00:00" (midnight) and "12:00" (noon)
      if (hours === 0 && minutes === 0) return `12:00 AM`;  // Midnight
      if (hours === 12 && minutes === 0) return `12:00 PM`;  // Noon
      
      // Determine whether it's AM or PM
      const period = hours < 12 ? 'AM' : 'PM';
      
      // Convert to 12-hour format; note that 0 or 12 should be shown as 12
      const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  
      return `${hour12}:${pad(minutes)} ${period}`;
  };
  
   // ---------- Main Screen (Tab Navigator) ----------
   
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


const Screen1 = () => {
 

  const [scheduledPresentations, setScheduledPresentations] = useState([]);
  const [completedPresentations, setCompletedPresentations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
 


  // State and handlers for our custom confirmation modal
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(''); // 'delete', 'complete', 'deleteCompleted'
  const [selectedPresentation, setSelectedPresentation] = useState(null);

  // Fetch schedules and completed presentations from Appwrite when the component mounts
  const fetchSchedules = async () => {
    try {
      const data = await GetSchedules();
      setScheduledPresentations(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setFetchError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompletedPresentations = async () => {
    try {
      const data = await GetCompletedPresentations();
      setCompletedPresentations(data);
    } catch (error) {
      console.error('Error fetching completed presentations:', error);
      setFetchError(error);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchCompletedPresentations(); // Call this function to fetch completed presentations as well
  }, []);

  const confirmDeleteScheduled = (item) => {
    setConfirmAction('delete');
    setSelectedPresentation(item);
    setConfirmModalVisible(true);
  };

  const confirmCompleteScheduled = (item) => {
    setConfirmAction('complete');
    setSelectedPresentation(item);
    setConfirmModalVisible(true);
  };

  const confirmDeleteCompleted = (item) => {
    setConfirmAction('deleteCompleted');
    setSelectedPresentation(item);
    setConfirmModalVisible(true);
  };

  const handleConfirm = async () => {
    if (confirmAction === 'delete') {
      try {
        await deleteDocument({
          databaseId: '67dd8a42000b2f5184aa',
          collectionId: 'PresentationSchedules',
          documentId: selectedPresentation.$id
        });
        setScheduledPresentations((prev) =>
          prev.filter((presentation) => presentation.$id !== selectedPresentation.$id)
        );
      } catch (error) {
        console.error('Error deleting scheduled presentation:', error);
      }
    } else if (confirmAction === 'complete') {
      setScheduledPresentations((prev) =>
        prev.filter((presentation) => presentation.$id !== selectedPresentation.$id)
      );

      setCompletedPresentations((prev) => [...prev, selectedPresentation]);

      try {
        await SaveCompletedPresentation({
          title: selectedPresentation.title || "Untitled",
          group_id: selectedPresentation.group_id || "Unknown",
          semester: selectedPresentation.semester || "N/A",
          date: selectedPresentation.date || new Date().toISOString(),
          time: selectedPresentation.time || "00:00",
          venue: selectedPresentation.venue || "Not Assigned",
          status: "Completed" 
        });

        await deleteDocument({
          databaseId: '67dd8a42000b2f5184aa',
          collectionId: 'PresentationSchedules',
          documentId: selectedPresentation.$id
        });
      } catch (error) {
        console.error('Error saving completed presentation:', error);
      }
    } else if (confirmAction === 'deleteCompleted') {
      try {
        // Delete the completed presentation from the database
        await deleteDocument({
          databaseId: '67dd8a42000b2f5184aa',
          collectionId: 'completed_presentations',
          documentId: selectedPresentation.$id
        });
    
        // Update the UI by removing the presentation from the list
        setCompletedPresentations((prev) =>
          prev.filter((presentation) => presentation.$id !== selectedPresentation.$id)
        );
      } catch (error) {
        console.error('Error deleting completed presentation:', error);
      }
    }

    setConfirmModalVisible(false);
    setConfirmAction('');
    setSelectedPresentation(null);
  };

  const handleCancel = () => {
    setConfirmModalVisible(false);
    setConfirmAction('');
    setSelectedPresentation(null);
  };


 // ---------- Dashboard Component (Scheduled Presentations) ----------
 const Dashboard = ({ scheduledPresentations, onDelete, onComplete, fetchSchedules }) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');  // State for search query
  const fadeAnim = new Animated.Value(0);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedules().finally(() => setRefreshing(false));
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  // Search Bar Component
  const renderSearchBar = () => (
    <View style={styles.searchBarContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by title..."
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />
      <Ionicons 
        name="search" 
        size={20} 
        color="#999" 
        style={styles.searchIcon}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
          <Ionicons name="close-circle" size={20} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );

  const filteredPresentations = scheduledPresentations.filter(item =>
    item.title.toLowerCase().startsWith(searchQuery.toLowerCase())
  );
  
  // animated presentation item
  const animationMap = useRef({}).current;

  const animateItem = (id) => {
    if (!animationMap[id]) {
      animationMap[id] = {
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(20),
      };
    }
  
    Animated.parallel([
      Animated.timing(animationMap[id].opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(animationMap[id].translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };
  

  
  const renderPresentation = ({ item }) => {
    animateItem(item.$id);
  
    const anim = animationMap[item.$id];
  
    return (
      <Animated.View
        style={[
          styles.presentationItem,
          {
            opacity: anim?.opacity || 1,
            transform: [{ translateY: anim?.translateY || 0 }],
          },
        ]}
      >
        <View style={styles.presentationInfo}>
          <Text style={styles.presentationTitle}>{item.title}</Text>
          <Text style={styles.presentationDetails}>Group ID: {item.group_id}</Text>
          <Text style={styles.presentationDetails}>Semester: {item.semester}</Text>
          <Text style={styles.presentationDetails}>
            {formatDate(item.date)} at {formatTime(item.time)}
          </Text>
          <Text style={styles.presentationDetails}>Venue: {item.venue}</Text>
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('EditSchedule', { scheduleId: item.$id })}>
            <Ionicons name="create-outline" size={24} color="#007bff" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item)}>
            <Ionicons name="trash-outline" size={24} color="#ff4242" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onComplete(item)}>
            <Ionicons name="checkmark-done-outline" size={24} color="#28a745" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };
  


  return (
    <View style={styles.container}>
      {renderSearchBar()}  {/* Render the search bar at the top */}
      
      <Text style={styles.header}>Scheduled Presentations</Text>
      {filteredPresentations.length === 0 ? (
        <Text style={styles.noDataText}>No scheduled presentations.</Text>
      ) : (
        <FlatList
        data={filteredPresentations}
        keyExtractor={(item) => item.$id}
        renderItem={renderPresentation}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onLayout={fadeIn}
        extraData={[searchQuery, scheduledPresentations]}  // <-- ensure re-render on data or query change
      />
      
      )}

      {/* Report Generation Button at the bottom */}
      <TouchableOpacity
        style={styles.reportButton}
        onPress={() => navigation.navigate('Report', { scheduledPresentations })}
      >
        <Text style={styles.reportButtonText}>Analyze Schedule</Text>
      </TouchableOpacity>     

    </View>
  )
  
};


  // ---------- CompletedPresentations Component – Displays Completed Presentations ----------
  const CompletedPresentations = ({ completedPresentations, onDeleteCompleted }) => {
    const [searchQuery, setSearchQuery] = useState('');  // State for search query
  
    const renderSearchBar = () => (
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <Ionicons 
          name="search" 
          size={20} 
          color="#999" 
          style={styles.searchIcon}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
    );
  
    const filteredCompletedPresentations = completedPresentations.filter(item =>
      item.title.toLowerCase().startsWith(searchQuery.toLowerCase())
    );
  
    const renderCompleted = ({ item }) => (
      <View style={styles.presentationItem}>
        <View style={styles.presentationInfo}>
          <Text style={styles.presentationTitle}>{item.title}</Text>
          <Text style={styles.presentationDetails}>Group ID: {item.group_id}</Text>
          <Text style={styles.presentationDetails}>Semester: {item.semester}</Text>
          <Text style={styles.presentationDetails}>
            {formatDate(item.date)} at {formatTime(item.time)}
          </Text>
          <Text style={styles.presentationDetails}>Venue: {item.venue}</Text>
          <Text style={[styles.presentationDetails, { color: 'green' }]}>
            {item.status || "Completed"}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onDeleteCompleted(item)}>
          <Ionicons name="trash-outline" size={24} color="#ff4242" style={styles.icon} />
        </TouchableOpacity>
      </View>
    );
  
    return (
      <View style={styles.container}>
        {renderSearchBar()}  {/* Render the search bar at the top */}
        <Text style={styles.header}>Completed Presentations</Text>
        {filteredCompletedPresentations.length === 0 ? (
          <Text style={styles.noDataText}>No completed presentations.</Text>
        ) : (
          <FlatList
            data={filteredCompletedPresentations}
            keyExtractor={(item) => item.$id}
            renderItem={renderCompleted}
            style={styles.list}
          />
        )}
      </View>
    );
  };
  

  return (
<GestureHandlerRootView style={{ flex: 1 }}>
  <Stack.Navigator initialRouteName="Dashboard">
    {/* Main Screen Stack Navigator */}
    <Stack.Screen
  name="Dashboard"
  options={({ navigation }) => ({
    headerShown: true,
    headerTitle: "PresentPath",
    headerStyle: {
      backgroundColor: '#3b5998',
      shadowColor: 'rgba(21, 81, 128, 0.4)',
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 4,
    },
    headerTitleStyle: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
      letterSpacing: 1.2,
    },
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => navigation.navigate('MainDashboard')}  // << Navigate to MainDashboard
        style={{ marginLeft: 10 }}  // Add some left margin
      >
        <MaterialIcons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
    ),
  })}
    >
      {() => {
        if (isLoading) {
          return (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          );
        }
        if (fetchError) {
          return (
            <View style={styles.centered}>
              <Text style={styles.errorText}>Error: {fetchError.message}</Text>
            </View>
          );
        }
        return (
          <Tab.Navigator>
            <Tab.Screen
              name="DashboardTab"
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialIcons name="dashboard" color={color} size={size} />
                ),
              }}
            >
              {() => (
                <Dashboard
                  scheduledPresentations={scheduledPresentations}
                  fetchSchedules={fetchSchedules}
                  onDelete={confirmDeleteScheduled}
                  onComplete={confirmCompleteScheduled}
                />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="CreateSchedule"
              component={CreateSchedule}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <FontAwesome name="calendar-plus-o" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Completed"
              options={{
                tabBarIcon: ({ color, size }) => (
                  <FontAwesome name="check-square" color={color} size={size} />
                ),
              }}
            >
              {() => (
                <CompletedPresentations
                  completedPresentations={completedPresentations}
                  onDeleteCompleted={confirmDeleteCompleted}
                />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="Notifications"
              component={Notifications}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialIcons name="notifications" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Profile"
              component={Profile}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <FontAwesome name="user-circle" color={color} size={size} />
                ),
              }}
            />
          </Tab.Navigator>
        );
      }}
    </Stack.Screen>

        {/* Add the EditSchedule screen to the stack */}
        <Stack.Screen 
          name="EditSchedule" 
          component={EditSchedule} 
        
        />
        <Stack.Screen 
          name="Report" 
          component={Report} 
        />
        
    </Stack.Navigator>

      

      {/* Custom Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Action</Text>
            <Text style={styles.modalMessage}>
              {confirmAction === 'delete'
                ? `Are you sure you want to delete "${selectedPresentation?.title}"?`
                : confirmAction === 'complete'
                ? `Are you sure you want to mark "${selectedPresentation?.title}" as complete?`
                : confirmAction === 'deleteCompleted'
                ? `Are you sure you want to delete the completed presentation "${selectedPresentation?.title}"?`
                : ''}
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={handleCancel}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleConfirm}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
};

export default Screen1;

const { width, height } = Dimensions.get('window');

// Design tokens for consistency across the app
const COLORS = {
  primary: '#007bff',
  secondary: '#6c757d',
  light: '#ffffff',
  dark: '#343a40',
  error: '#ff4242',
  background: '#f0f4f7',
};

const SIZES = {
  base: 16,
  font: 14,
  radius: 8,
  padding: 12,
};

const FONT = {
  regular: 'System',
  bold: 'System-Bold',
};

const styles = StyleSheet.create({
  // Base containers
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Typography
  header: {
    fontSize: width * 0.07, // Responsive header font size
    fontFamily: FONT.bold,
    color: COLORS.dark,
    marginBottom: SIZES.padding,
  },
  noDataText: {
    fontSize: SIZES.font,
    color: COLORS.secondary,
    textAlign: 'center',
    marginVertical: SIZES.padding,
  },
  errorText: {
    fontSize: SIZES.font,
    color: COLORS.error,
    fontStyle: 'italic',
  },

  // Cards and list items (modern elevation and shadow styling)
  card: {
    backgroundColor: COLORS.light,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  list: {
    flex: 1,
  },
  presentationItem: {
    flexDirection: 'row',
    padding: SIZES.padding,
    backgroundColor: COLORS.light,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  presentationInfo: {
    flex: 1,
  },
  presentationTitle: {
    fontSize: SIZES.font * 1.3,
    fontFamily: FONT.bold,
    color: COLORS.dark,
    marginBottom: 4,
  },
  presentationDetails: {
    fontSize: SIZES.font,
    color: COLORS.secondary,
  },

  // Icon and button containers
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginVertical: 4,
  },

  // Modern gradient button stub (integrate with react-native-linear-gradient)
  gradientButton: {
    marginTop: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 2,
    overflow: 'hidden',
    // Additional shadow for a raised look
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: COLORS.light,
    fontSize: SIZES.font * 1.2,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: SIZES.padding,
  },

  // Modal styling with advanced elevation and platform specificity
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: COLORS.light,
    borderRadius: SIZES.radius * 1.2,
    padding: SIZES.padding * 1.5,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalTitle: {
    fontSize: SIZES.font * 1.5,
    fontFamily: FONT.bold,
    color: COLORS.dark,
    marginBottom: SIZES.padding,
  },
  modalMessage: {
    fontSize: SIZES.font,
    color: COLORS.secondary,
    marginBottom: SIZES.padding * 1.2,
    lineHeight: 22,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButtonCancel: {
    marginRight: SIZES.padding,
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 1.5,
  },
  modalButtonText: {
    color: COLORS.light,
    fontSize: SIZES.font,
    fontWeight: '600',
  },

  // Advanced animated element (integrated with Animated API)
  animatedBox: {
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: COLORS.primary,
    borderRadius: width * 0.2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  // Navigation bar with a modern feel
  navBar: {
    height: 60,
    backgroundColor: COLORS.light,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.secondary,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  // Modern text styling (gradients can be applied via linear gradient wrappers)
  gradientText: {
    fontSize: SIZES.font * 1.8,
    fontWeight: 'bold',
    color: COLORS.primary,
    // To apply an actual gradient, wrap this text in a masked view with react-native-linear-gradient.
  },

  // An interactive dot indicator (subtle modern UI design)
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    margin: 4,
  },

searchBarContainer: {
  flexDirection: 'row',  // Align the input and icon horizontally
  alignItems: 'center',  // Vertically center the content
  marginBottom: 15,  // Optional: Adjust the space above/below search bar
  paddingHorizontal: 15,  // Padding for inner content
  backgroundColor: '#f0f4f7',  // Light background color for the search bar
  borderRadius: 8,  // Rounded corners for the container
  elevation: 5,  // Optional: Shadow for a clean effect
  shadowColor: '#000',  // Optional: Shadow color for iOS
  shadowOpacity: 0.1,  // Optional: Shadow opacity for iOS
  shadowRadius: 8,  // Optional: Shadow blur for iOS
  shadowOffset: { width: 0, height: 2 },  // Optional: Shadow offset for iOS
},

searchInput: {
  flex: 1,  // Take up available space for input field
  height: 40,  // Height of the input field
  borderColor: '#ccc',  // Light border color
  borderWidth: 1,  // Thin border
  borderRadius: 8,  // Rounded corners for the input
  paddingLeft: 15,  // Padding for the left side of the input
  paddingRight: 35,  // Space for the search icon on the right
  backgroundColor: '#fff',  // White background for input
  fontSize: 16,  // Font size for the text inside the input
  color: '#333',  // Text color
  letterSpacing: 0.5,  // Slight letter spacing for cleaner look
},

searchIcon: {
  marginLeft: 10,  // Space between the input and the search icon
  marginRight: 15,  // Optional: Space between the icon and the right edge
  color: '#999',  // Color of the search icon
},

clearIcon: {
  position: 'absolute',  // Position the clear icon inside the input
  right: 10,  // Position the icon at the right
  top: '50%',  // Vertically center the icon
  transform: [{ translateY: -12 }],  // Adjust vertical position for perfect centering
},

//report button styling
reportButton: {
  position: 'absolute',
  bottom: 20,       // 20 pixels from the bottom edge
  right: 20,        // 20 pixels from the right edge
  backgroundColor: '#28a745', // Modern green color for the button
  paddingVertical: 8,         // Compact padding for a smaller button
  paddingHorizontal: 12,
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,  // For Android shadow
},
reportButtonText: {
  color: '#fff',
  fontSize: 14,   // Smaller font size for a compact look
  fontWeight: '600',
  textAlign: 'center',
},
  
});

