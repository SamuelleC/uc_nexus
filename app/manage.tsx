import Header from '@/components/header';
import { Picker } from '@react-native-picker/picker';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { DEPARTMENTS } from '../data/room-data';
import { roomPredictionService } from '../services/room-prediction-service';
import { AIResponse, ClassRequest, RoomSuggestion } from '../types/room-types';

export default function ManageScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const resultsRef = useRef<View>(null);
  
  const [formData, setFormData] = useState<ClassRequest>({
    classSize: 0,
    department: '',
    schedule: {
      day: '',
      startTime: '',
      endTime: ''
    },
    requiredEquipment: [],
    preferredRoomType: undefined
  });

  const [suggestions, setSuggestions] = useState<RoomSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string>('');

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const roomTypes = ['classroom', 'laboratory', 'lecture-hall', 'seminar-room', 'computer-lab'];

  const scrollToResults = () => {
    if (resultsRef.current && scrollViewRef.current) {
      resultsRef.current.measureLayout(
        scrollViewRef.current as any,
        (x: number, y: number) => {
          scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
        },
        () => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      );
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.classSize || formData.classSize <= 0) {
      Alert.alert('Error', 'Please enter a valid class size');
      return;
    }
    if (!formData.department) {
      Alert.alert('Error', 'Please select a department');
      return;
    }
    if (!formData.schedule.day || !formData.schedule.startTime || !formData.schedule.endTime) {
      Alert.alert('Error', 'Please complete the schedule information');
      return;
    }

    setIsLoading(true);
    setSuggestions([]);
    setExplanation('');

    try {
      const response: AIResponse = await roomPredictionService.suggestRooms(formData);
      setSuggestions(response.suggestions);
      setExplanation(response.explanation);
      
      // Scroll to results after a short delay to ensure content is rendered
      setTimeout(() => {
        if (resultsRef.current && scrollViewRef.current) {
          resultsRef.current.measureLayout(
            scrollViewRef.current as any,
            (x: number, y: number) => {
              scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
            },
            () => {
              // Fallback: scroll to end if measure fails
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }
          );
        }
      }, 500);
    } catch (error) {
      Alert.alert('Error', 'Failed to get room suggestions. Please try again.');
      console.error('Room suggestion error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Management" 
        subtitle="Use our built-in AI to find a suitable room"
      />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Class Information</Text>
          
          {/* Class Size */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Class Size (Number of Students) *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter number of students"
              value={formData.classSize.toString()}
              onChangeText={(text) => setFormData(prev => ({
                ...prev, 
                classSize: parseInt(text) || 0
              }))}
              keyboardType="numeric"
            />
          </View>

          {/* Department */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Department *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.department}
                onValueChange={(value: string) => setFormData(prev => ({
                  ...prev, 
                  department: value
                }))}
                style={styles.picker}
              >
                <Picker.Item label="Select Department" value="" />
                {DEPARTMENTS.map(dept => (
                  <Picker.Item 
                    key={dept} 
                    label={dept.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                    value={dept} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Schedule */}
          <Text style={styles.sectionTitle}>Schedule</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Day *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.schedule.day}
                onValueChange={(value: string) => setFormData(prev => ({
                  ...prev, 
                  schedule: { ...prev.schedule, day: value }
                }))}
                style={styles.picker}
              >
                <Picker.Item label="Select Day" value="" />
                {days.map(day => (
                  <Picker.Item 
                    key={day} 
                    label={day.charAt(0).toUpperCase() + day.slice(1)} 
                    value={day} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.timeRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Start Time *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="HH:MM"
                value={formData.schedule.startTime}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev, 
                  schedule: { ...prev.schedule, startTime: text }
                }))}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>End Time *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="HH:MM"
                value={formData.schedule.endTime}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev, 
                  schedule: { ...prev.schedule, endTime: text }
                }))}
              />
            </View>
          </View>

          {/* Optional: Preferred Room Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Room Type (Optional)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.preferredRoomType || ''}
                onValueChange={(value: string) => setFormData(prev => ({
                  ...prev, 
                  preferredRoomType: (value as any) || undefined
                }))}
                style={styles.picker}
              >
                <Picker.Item label="Any Room Type" value="" />
                {roomTypes.map(type => (
                  <Picker.Item 
                    key={type} 
                    label={type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                    value={type} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Get AI Suggestions</Text>
            )}
          </TouchableOpacity>

          {/* Results */}
          <View ref={resultsRef}>
            {explanation && (
              <View style={styles.explanationContainer}>
                <View style={styles.analysisHeader}>
                  <Text style={styles.explanationTitle}>🤖 AI Analysis</Text>
                  <TouchableOpacity 
                    style={styles.scrollToTopButton}
                    onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
                  >
                    <Text style={styles.scrollToTopText}>↑ Top</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.explanationText}>{explanation}</Text>
              </View>
            )}

            {suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <View style={styles.suggestionHeaderRow}>
                  <Text style={styles.sectionTitle}>📍 Recommended Rooms</Text>
                  <TouchableOpacity 
                    style={styles.scrollToTopButton}
                    onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
                  >
                    <Text style={styles.scrollToTopText}>↑ Back to Form</Text>
                  </TouchableOpacity>
                </View>
                {suggestions.map((suggestion, index) => (
                <View key={suggestion.room.id} style={styles.suggestionCard}>
                  <View style={styles.suggestionHeader}>
                    <Text style={styles.roomName}>{suggestion.room.name}</Text>
                    <View style={[styles.scoreContainer, { backgroundColor: getScoreColor(suggestion.score) }]}>
                      <Text style={styles.scoreText}>{suggestion.score}%</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.roomDetails}>
                    📍 {suggestion.room.location} • 👥 Capacity: {suggestion.room.capacity}
                  </Text>
                  
                  <View style={styles.reasonsContainer}>
                    <Text style={styles.reasonsTitle}>✅ Why this room:</Text>
                    {suggestion.reasons.map((reason, idx) => (
                      <Text key={idx} style={styles.reasonText}>• {reason}</Text>
                    ))}
                  </View>

                  {suggestion.concerns && suggestion.concerns.length > 0 && (
                    <View style={styles.concernsContainer}>
                      <Text style={styles.concernsTitle}>⚠️ Considerations:</Text>
                      {suggestion.concerns.map((concern, idx) => (
                        <Text key={idx} style={styles.concernText}>• {concern}</Text>
                      ))}
                    </View>
                  )}
                  
                  <Text style={styles.equipmentText}>
                    🔧 Equipment: {suggestion.room.equipment.join(', ')}
                  </Text>
                </View>
              ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  picker: {
    height: 50,
  },
  timeRow: {
    flexDirection: 'row',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  explanationContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 5,
  },
  explanationText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  suggestionsContainer: {
    marginTop: 20,
  },
  suggestionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  scoreContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  roomDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  reasonsContainer: {
    marginBottom: 10,
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 5,
  },
  reasonText: {
    fontSize: 13,
    color: '#374151',
    marginLeft: 5,
    marginBottom: 2,
  },
  concernsContainer: {
    marginBottom: 10,
  },
  concernsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
    marginBottom: 5,
  },
  concernText: {
    fontSize: 13,
    color: '#374151',
    marginLeft: 5,
    marginBottom: 2,
  },
  equipmentText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  suggestionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scrollToTopButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scrollToTopText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});