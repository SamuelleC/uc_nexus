import Card from '@/components/card';
import Header from '@/components/header';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { AssignmentService } from '../data/assignments-data';
import { ROOMS } from '../data/room-data';
import { roomPredictionService } from '../services/room-prediction-service';
import { ClassRequest, RoomSuggestion } from '../types/room-types';

export default function ManageScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const resultsRef = useRef<View>(null);
  
  // State to manage which view to show
  const [currentView, setCurrentView] = useState<'main' | 'assignRooms' | 'aiHelper'>('main');
  
  // AI Helper form data
  const [aiHelperData, setAiHelperData] = useState({
    facultyName: '',
    courseCode: '',
    courseName: '',
    prompt: ''
  });
  const [aiHelperResponse, setAiHelperResponse] = useState<string>('');
  const [aiHelperLoading, setAiHelperLoading] = useState(false);
  
  const [formData, setFormData] = useState<ClassRequest>({
    className: '',
    classSize: 0,
    department: '',
    schedule: {
      days: [],
      startTime: '',
      endTime: ''
    },
    requiredEquipment: [],
    preferredRoomType: undefined
  });

  const [suggestions, setSuggestions] = useState<RoomSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string>('');

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const roomTypes = [
    'animation-lab', 'biology-lab', 'Cafeteria', 'cea-computer-lab', 'chemistry-lab',
    'cisco-lab', 'classroom', 'computer-lab', 'con-med-lab', 'culinary-lab',
    'dancing-hall', 'demo-room', 'drafting-room', 'electronic/digital-lab', 'engineering-computer-lab',
    'firing-range', 'gs/jhs-lab', 'he-lab', 'hydro/fluid-mech-lab', 'lecture-hall',
    'mascom-lab', 'masscom-lab', 'matti/soil-test-lab', 'nursing-lab', 'nutrition-lab',
    'physics-lab', 'psychology-lab', 'seminar-room', 'thesis-room'
  ];
  const departments = [
    'citcs',
    'cte',
    'cas'
  ];

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
    if (!formData.className) {
      Alert.alert('Error', 'Please enter a class name');
      return;
    }
    if (!formData.classSize || formData.classSize <= 0) {
      Alert.alert('Error', 'Please enter a valid class size');
      return;
    }
    if (!formData.department) {
      Alert.alert('Error', 'Please select a department');
      return;
    }
    if (!formData.schedule.days || formData.schedule.days.length === 0) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }
    if (!formData.schedule.startTime || !formData.schedule.endTime) {
      Alert.alert('Error', 'Please complete the schedule information');
      return;
    }

    setIsLoading(true);

    try {
      // Find available rooms that match the requirements
      const roomAvailabilityChecks = await Promise.all(
        ROOMS.map(async (room) => {
          // Check capacity
          if (room.capacity < formData.classSize) return null;
          
          // Check if room is available for the requested time slots
          const isAvailable = await AssignmentService.isRoomAvailable(
            room.id,
            formData.schedule.days,
            formData.schedule.startTime,
            formData.schedule.endTime
          );
          
          return isAvailable ? room : null;
        })
      );

      const availableRooms = roomAvailabilityChecks.filter(room => room !== null) as typeof ROOMS;

      if (availableRooms.length === 0) {
        Alert.alert(
          'No Available Rooms', 
          'No rooms are available for the selected time slots and requirements. Please try different time slots or reduce class size.'
        );
        setIsLoading(false);
        return;
      }

      // Sort rooms by suitability (capacity match, department match)
      const sortedRooms = availableRooms.sort((a, b) => {
        // Prefer rooms with capacity closer to class size
        const aCapacityScore = Math.abs(a.capacity - formData.classSize);
        const bCapacityScore = Math.abs(b.capacity - formData.classSize);
        
        // Prefer rooms from the same department
        const aDeptMatch = a.department?.includes(formData.department) ? 0 : 1;
        const bDeptMatch = b.department?.includes(formData.department) ? 0 : 1;
        
        return aDeptMatch - bDeptMatch || aCapacityScore - bCapacityScore;
      });

      // Take the best available room
      const assignedRoom = sortedRooms[0];
      
      // Create the assignment
      const assignment = await AssignmentService.addAssignment({
        roomId: assignedRoom.id,
        roomName: assignedRoom.name,
        department: formData.department,
        className: formData.className,
        classSize: formData.classSize,
        schedule: {
          days: formData.schedule.days,
          startTime: formData.schedule.startTime,
          endTime: formData.schedule.endTime
        }
      });

      if (!assignment) {
        Alert.alert('Error', 'Failed to save assignment. Please try again.');
        setIsLoading(false);
        return;
      }

      // Show success message with assignment details
      const roomNumber = assignedRoom.id.replace('room-', '');
      const building = assignedRoom.location.split(',')[0];
      const scheduleText = `${formData.schedule.days.join(', ')} ${formData.schedule.startTime}-${formData.schedule.endTime}`;
      
      Alert.alert(
        'Room Assigned Successfully!', 
        `${formData.className} has been assigned to:\n\nRoom: ${roomNumber}\nBuilding: ${building}\nSchedule: ${scheduleText}\n\nYou can view this assignment in the Schedules page.`,
        [{ text: 'OK', onPress: () => {
          // Reset form
          setFormData({
            className: '',
            classSize: 0,
            department: '',
            schedule: { days: [], startTime: '', endTime: '' },
            requiredEquipment: [],
            preferredRoomType: undefined
          });
        }}]
      );

    } catch (error) {
      console.error('Room assignment error:', error);
      Alert.alert('Error', 'Failed to assign room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // AI Helper form handlers
  const handleAiHelperSubmit = async () => {
    // Validation checks
    if (!aiHelperData.prompt) {
      Alert.alert('Error', 'Please enter your request/question');
      return;
    }

    setAiHelperLoading(true);
    setAiHelperResponse('');
    
    try {
      const response = await roomPredictionService.getAIHelperResponse(
        '', // facultyName - not needed
        '', // courseCode - not needed  
        '', // courseName - not needed
        aiHelperData.prompt
      );
      setAiHelperResponse(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to get AI response. Please try again.');
    } finally {
      setAiHelperLoading(false);
    }
  };

  const resetAiHelperForm = () => {
    setAiHelperData({
      facultyName: '',
      courseCode: '',
      courseName: '',
      prompt: ''
    });
    setAiHelperResponse('');
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  const hours = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1; // 1..12
    return { value: String(n).padStart(2, '0'), label: String(n) };
  });
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  const setStartTime = (h: string, m: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: { ...prev.schedule, startTime: `${h}:${m}` }
    }));
  };

  const setEndTime = (h: string, m: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: { ...prev.schedule, endTime: `${h}:${m}` }
    }));
  };

  const ITEM_HEIGHT = 40; // px, used for snapping
  const startHourScrollRef = useRef<ScrollView | null>(null);
  const startMinuteScrollRef = useRef<ScrollView | null>(null);
  const endHourScrollRef = useRef<ScrollView | null>(null);
  const endMinuteScrollRef = useRef<ScrollView | null>(null);
  const startAmScrollRef = useRef<ScrollView | null>(null);
  const endAmScrollRef = useRef<ScrollView | null>(null);

  const ampm = ['am', 'pm'];

  const parseTimeToParts = (time?: string) => {
    const [hh = '00', mm = '00'] = (time || '00:00').split(':');
    const hourNum = parseInt(hh, 10) || 0;
    const suffix = hourNum < 12 ? 'am' : 'pm';
    let hour12Num = hourNum % 12;
    if (hour12Num === 0) hour12Num = 12;
    const hour12 = String(hour12Num).padStart(2, '0');
    return { hour24: hh, minute: mm, hour12, suffix };
  };

  const hour12SuffixTo24 = (hour12: string, suffix: string) => {
    const hn = parseInt(hour12, 10) || 0;
    if (suffix === 'am') {
      if (hn === 12) return '00';
      return String(hn).padStart(2, '0');
    } else {
      if (hn === 12) return '12';
      return String(hn + 12).padStart(2, '0');
    }
  };

  const setStartFromParts = (hour12: string, suffix: string, minute: string) => {
    const hour24 = hour12SuffixTo24(hour12, suffix);
    setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, startTime: `${hour24}:${minute}` } }));
  };

  const setEndFromParts = (hour12: string, suffix: string, minute: string) => {
    const hour24 = hour12SuffixTo24(hour12, suffix);
    setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, endTime: `${hour24}:${minute}` } }));
  };

  const onStartHourMomentum = (e: any) => {
    const y = e.nativeEvent.contentOffset.y || 0;
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(hours.length - 1, idx));
    const h = hours[clamped];
    const parts = parseTimeToParts(formData.schedule.startTime);
    setStartFromParts(h.value, parts.suffix, parts.minute);
    startHourScrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
  };

  const onStartMinuteMomentum = (e: any) => {
    const y = e.nativeEvent.contentOffset.y || 0;
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(minutes.length - 1, idx));
    const m = minutes[clamped];
    const parts = parseTimeToParts(formData.schedule.startTime);
    setStartFromParts(parts.hour12, parts.suffix, m);
    startMinuteScrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
  };

  const onStartAmMomentum = (e: any) => {
    const y = e.nativeEvent.contentOffset.y || 0;
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(ampm.length - 1, idx));
    const suffix = ampm[clamped];
    const parts = parseTimeToParts(formData.schedule.startTime);
    setStartFromParts(parts.hour12, suffix, parts.minute);
    startAmScrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
  };

  const onEndHourMomentum = (e: any) => {
    const y = e.nativeEvent.contentOffset.y || 0;
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(hours.length - 1, idx));
    const h = hours[clamped];
    const parts = parseTimeToParts(formData.schedule.endTime);
    setEndFromParts(h.value, parts.suffix, parts.minute);
    endHourScrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
  };

  const onEndMinuteMomentum = (e: any) => {
    const y = e.nativeEvent.contentOffset.y || 0;
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(minutes.length - 1, idx));
    const m = minutes[clamped];
    const parts = parseTimeToParts(formData.schedule.endTime);
    setEndFromParts(parts.hour12, parts.suffix, m);
    endMinuteScrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
  };

  const onEndAmMomentum = (e: any) => {
    const y = e.nativeEvent.contentOffset.y || 0;
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(ampm.length - 1, idx));
    const suffix = ampm[clamped];
    const parts = parseTimeToParts(formData.schedule.endTime);
    setEndFromParts(parts.hour12, suffix, parts.minute);
    endAmScrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
  };

  const startParts = parseTimeToParts(formData.schedule.startTime);
  const endParts = parseTimeToParts(formData.schedule.endTime);

  // Main cards view
  if (currentView === 'main') {
    return (
      <View className="flex-1 bg-gray-100">
        <Header 
          title="Management" 
          subtitle="Choose how you want to manage your rooms"
        />
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className='mb-4 text-xl font-medium text-zinc-500'>Select a task</Text>
          <View style={{ gap: 16 }}>
            <Card
              title="AI Helper"
              description="Get intelligent suggestions based on your requirements"
              icon="bulb"
              onPress={() => setCurrentView('aiHelper')}
            />
            <Card
              title="Assign Rooms"
              description="Assign and manage rooms"
              icon="calendar"
              onPress={() => setCurrentView('assignRooms')}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  // AI Helper form view
  if (currentView === 'aiHelper') {
    return (
      <View className="flex-1 bg-white">
        <Header 
          title="AI Helper" 
          subtitle="Get intelligent assistance for course management"
        />
        {/* Back Button */}
        <View className="px-4 pt-2">
        <TouchableOpacity 
          onPress={() => setCurrentView('main')}
          className="flex-row items-center mb-2"
        >
          <Ionicons name="arrow-back" size={24} color="#0c3112" />
        </TouchableOpacity>
      </View>

        <ScrollView className="flex-1 px-4">
          {/* AI Helper Form */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
            <Text className="text-xl font-semibold text-gray-800 mb-4">How can we help you?</Text>
            <View className="mb-4">
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 h-36"
                placeholder="Use our sample prompts for best results!"
                value={aiHelperData.prompt}
                onChangeText={(text) => setAiHelperData(prev => ({ ...prev, prompt: text }))}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Sample Prompts */}
            <View className="mb-4">
              <Text className="text-lg font-medium text-gray-700 mb-2">Useful Prompts:</Text>
              <View className="space-y-2">
                <TouchableOpacity
                  onPress={() => setAiHelperData(prev => ({ ...prev, prompt: "What are the most suitable rooms for this course?" }))}
                  className="bg-green-50 border border-green-200 rounded-lg p-2"
                >
                  <Text className="text-green-700 text-base">• What are the most suitable rooms for this course?</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAiHelperData(prev => ({ ...prev, prompt: "What is the optimal class size and scheduling for this course?" }))}
                  className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2"
                >
                  <Text className="text-green-700 text-base">• What is the optimal class size and scheduling for this course?</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAiHelperData(prev => ({ ...prev, prompt: "Which buildings have the best rooms for this type of course?" }))}
                  className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2"
                >
                  <Text className="text-green-700 text-base">• Which buildings have the best rooms for this type of course?</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAiHelperData(prev => ({ ...prev, prompt: "How should I plan the weekly schedule for maximum student engagement?" }))}
                  className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2"
                >
                  <Text className="text-green-700 text-base">• How should I plan the weekly schedule for maximum student engagement?</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Buttons */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={resetAiHelperForm}
                className="flex-1 bg-gray-500 rounded-lg py-3 mr-2"
              >
                <Text className="text-lg text-white text-center font-semibold">Clear</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleAiHelperSubmit}
                className="flex-1 bg-green-950 rounded-lg py-3 ml-2"
                disabled={aiHelperLoading}
              >
                {aiHelperLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-lg text-white text-center font-semibold">Ask</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Response */}
          {aiHelperResponse && (
            <View className="bg-green-50 rounded-lg p-4 mb-28 border border-green-950">
              <Text className="text-lg font-semibold text-green-950 mb-3">AI Helper Response</Text>
              <Text className="text-gray-800 text-sm leading-6">{aiHelperResponse}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // Assign rooms form view
  return (
    <View className="flex-1 bg-white mb-14">
      <Header 
        title="Assign Rooms" 
        subtitle="Assign rooms to classes quickly"
      />
      {/* Back Button */}
      <View className="px-4 pt-2">
        <TouchableOpacity 
          onPress={() => setCurrentView('main')}
          className="flex-row items-center mb-2"
        >
          <Ionicons name="arrow-back" size={24} color="#0c3112" />
        </TouchableOpacity>
      </View>
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-800 mb-4">Class Information</Text>
          
          {/* Class Name */}
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-700 mb-1">Class Name</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 h-14 text-base bg-gray-50"
              placeholder="Enter class name (e.g., Computer Science 101)"
              value={formData.className || ''}
              onChangeText={(text) => {
                setFormData(prevData => ({
                  ...prevData, 
                  className: text
                }));
              }}
              autoCorrect={false}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>
          
          <View className="flex-row gap-3 mb-4">
            {/* Class Size */}
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-700 mb-1">Class Size</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-2 h-14 text-base bg-gray-50"
                placeholder="# students"
                value={formData.classSize.toString()}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev, 
                  classSize: parseInt(text) || 0
                }))}
                keyboardType="numeric"
              />
            </View>
            {/* Department */}
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-700 mb-1">Department</Text>
              <View className="border border-gray-300 rounded-lg bg-gray-50">
                <Picker 
                  selectedValue={formData.department}
                  onValueChange={(value: string) => setFormData(prev => ({
                    ...prev, 
                    department: value
                  }))}
                  style={{ height: 56 }}
                >
                  <Picker.Item label="Select Department" value="" />
                  {departments.map((dept: string) => (
                    <Picker.Item 
                      key={dept} 
                      label={dept.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} 
                      value={dept} 
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-700 mb-1">Preferred Room Type</Text>
            <View className="border border-gray-300 rounded-lg bg-gray-50">
              <Picker
                selectedValue={formData.preferredRoomType || ''}
                onValueChange={(value: string) => setFormData(prev => ({
                  ...prev, 
                  preferredRoomType: (value as any) || undefined
                }))}
                style={{ height: 56 }}
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
          <Text className="text-xl font-bold text-gray-800 mb-4">Schedule</Text>
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-700 mb-2">Days of the Week</Text>
            <View className="flex-row flex-wrap gap-2">
              {days.map(day => (
                <TouchableOpacity
                  key={day}
                  onPress={() => setFormData(prev => ({
                    ...prev,
                    schedule: {
                      ...prev.schedule,
                      days: prev.schedule.days.includes(day)
                        ? prev.schedule.days.filter(d => d !== day)
                        : [...prev.schedule.days, day]
                    }
                  }))}
                  className={`px-3 py-3 rounded-lg border ${
                    formData.schedule.days.includes(day)
                      ? 'bg-green-950 border-green-950'
                      : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  <Text className={`text-sm font-semibold ${
                    formData.schedule.days.includes(day)
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-700 mb-1">Start Time</Text>
              <View className="flex-row border border-gray-300 rounded-lg bg-gray-50 p-1 flex-1">
                <ScrollView
                  ref={(ref) => { startHourScrollRef.current = ref; }}
                  style={{ height: ITEM_HEIGHT, flex: 1 }}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  snapToAlignment="center"
                  decelerationRate="fast"
                  onMomentumScrollEnd={onStartHourMomentum}
                  nestedScrollEnabled={true}
                >
                  {hours.map(h => (
                    <TouchableOpacity
                      key={h.value}
                      onPress={() => setStartFromParts(h.value, startParts.suffix, startParts.minute)}
                      style={{ height: ITEM_HEIGHT, justifyContent: 'center' }}
                    >
                      <Text className="text-center text-base">{h.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <ScrollView
                  ref={(ref) => { startMinuteScrollRef.current = ref; }}
                  style={{ height: ITEM_HEIGHT, flex: 1 }}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  snapToAlignment="center"
                  decelerationRate="fast"
                  onMomentumScrollEnd={onStartMinuteMomentum}
                  nestedScrollEnabled={true}
                >
                  {minutes.map(m => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setStartFromParts(startParts.hour12, startParts.suffix, m)}
                      style={{ height: ITEM_HEIGHT, justifyContent: 'center' }}
                    >
                      <Text className="text-center text-base">{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <ScrollView
                  ref={(ref) => { startAmScrollRef.current = ref; }}
                  style={{ height: ITEM_HEIGHT, flex: 1 }}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  snapToAlignment="center"
                  decelerationRate="fast"
                  onMomentumScrollEnd={onStartAmMomentum}
                  nestedScrollEnabled={true}
                >
                  {ampm.map(a => (
                    <TouchableOpacity
                      key={a}
                      onPress={() => setStartFromParts(startParts.hour12, a, startParts.minute)}
                      style={{ height: ITEM_HEIGHT, justifyContent: 'center' }}
                    >
                      <Text className="text-center text-base">{a}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-700 mb-1">End Time</Text>
              <View className="flex-row border border-gray-300 rounded-lg bg-gray-50 p-1 flex-1">
                <ScrollView
                  ref={(ref) => { endHourScrollRef.current = ref; }}
                  style={{ height: ITEM_HEIGHT, flex: 1 }}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  snapToAlignment="center"
                  decelerationRate="fast"
                  onMomentumScrollEnd={onEndHourMomentum}
                  nestedScrollEnabled={true}
                >
                  {hours.map(h => (
                    <TouchableOpacity
                      key={h.value}
                      onPress={() => setEndFromParts(h.value, endParts.suffix, endParts.minute)}
                      style={{ height: ITEM_HEIGHT, justifyContent: 'center' }}
                    >
                      <Text className="text-center text-base">{h.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <ScrollView
                  ref={(ref) => { endMinuteScrollRef.current = ref; }}
                  style={{ height: ITEM_HEIGHT, flex: 1 }}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  snapToAlignment="center"
                  decelerationRate="fast"
                  onMomentumScrollEnd={onEndMinuteMomentum}
                  nestedScrollEnabled={true}
                >
                  {minutes.map(m => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setEndFromParts(endParts.hour12, endParts.suffix, m)}
                      style={{ height: ITEM_HEIGHT, justifyContent: 'center' }}
                    >
                      <Text className="text-center text-base">{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <ScrollView
                  ref={(ref) => { endAmScrollRef.current = ref; }}
                  style={{ height: ITEM_HEIGHT, flex: 1 }}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  snapToAlignment="center"
                  decelerationRate="fast"
                  onMomentumScrollEnd={onEndAmMomentum}
                  nestedScrollEnabled={true}
                >
                  {ampm.map(a => (
                    <TouchableOpacity
                      key={a}
                      onPress={() => setEndFromParts(endParts.hour12, a, endParts.minute)}
                      style={{ height: ITEM_HEIGHT, justifyContent: 'center' }}
                    >
                      <Text className="text-center text-base">{a}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            className={`mt-2 p-4 rounded-lg items-center ${isLoading ? 'bg-gray-400' : 'bg-green-950'}`}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">Assign Room</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}