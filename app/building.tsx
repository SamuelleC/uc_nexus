import Header from '@/components/header';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BuildingInfo, BUILDINGS } from '../data/building-data';
import { ROOMS } from '../data/room-data';
import { Room } from '../types/room-types';

interface Floor {
  id: number;
  name: string;
  rooms: Room[];
}

export default function Building() {
  const { building } = useLocalSearchParams<{ building: string }>();
  const router = useRouter();
  const [floors, setFloors] = useState<Floor[]>([]);
  const [buildingInfo, setBuildingInfo] = useState<BuildingInfo | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);

  // Function to get real rooms for a specific building
  const getRoomsForBuilding = (buildingId: string): Room[] => {
    let filteredRooms: Room[] = [];
    
    if (buildingId.toUpperCase() === 'N') {
      // EDS Building (N) has rooms with numeric-only IDs (e.g., room-2001, room-3001)
      filteredRooms = ROOMS.filter(room => /^room-\d+$/.test(room.id));
    } else {
      // Other buildings have letter prefixes (e.g., room-M303, room-S010)
      const buildingPrefix = `room-${buildingId.toUpperCase()}`;
      filteredRooms = ROOMS.filter(room => room.id.startsWith(buildingPrefix));
    }
    
    // Remove any potential duplicates by room ID
    const uniqueRooms = filteredRooms.reduce((acc, room) => {
      const existing = acc.find(r => r.id === room.id);
      if (!existing) {
        acc.push(room);
      }
      return acc;
    }, [] as Room[]);
    
    return uniqueRooms;
  };

  // Function to organize rooms by floors
  const organizeRoomsByFloors = (rooms: Room[]): Floor[] => {
    const floorMap = new Map<number, Room[]>();
    
    rooms.forEach(room => {
      // Extract floor number from room id 
      // Examples: room-M303 -> floor 3, room-S010 -> floor 0, room-U1001 -> floor 10, room-S02 -> floor 0
      const match = room.id.match(/room-[A-Z]+(\d+)/);
      if (match) {
        const roomNumber = match[1];
        let floor: number;
        
        if (roomNumber.length === 4) {
          // 4-digit room numbers: first 2 digits are floor (e.g., 1001 -> floor 10)
          floor = parseInt(roomNumber.substring(0, 2));
        } else if (roomNumber.length === 3) {
          // 3-digit room numbers: first digit is floor (e.g., 303 -> floor 3, 010 -> floor 0)
          floor = parseInt(roomNumber.substring(0, 1));
        } else if (roomNumber.length === 2) {
          // 2-digit room numbers: first digit is floor, but if starts with 0, treat as basement (e.g., 02 -> floor 0)
          if (roomNumber.startsWith('0')) {
            floor = 0; // basement
          } else {
            floor = parseInt(roomNumber.substring(0, 1));
          }
        } else {
          // Fallback for other formats
          floor = parseInt(roomNumber.substring(0, 1));
        }
        
        if (!floorMap.has(floor)) {
          floorMap.set(floor, []);
        }
        floorMap.get(floor)!.push(room);
      }
    });
    
    // Convert map to sorted array of floors
    return Array.from(floorMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([floorNumber, rooms]) => ({
        id: floorNumber,
        name: floorNumber === 0 ? 'Basement' : `Floor ${floorNumber}`,
        rooms: rooms.sort((a, b) => a.id.localeCompare(b.id))
      }));
  };

  useEffect(() => {
    if (building && BUILDINGS[building]) {
      const info = BUILDINGS[building];
      setBuildingInfo(info);
      const realRooms = getRoomsForBuilding(building);
      setFloors(organizeRoomsByFloors(realRooms));
    }
  }, [building]);

  if (!building || !buildingInfo) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <Header title="Building Not Found" subtitle="Please select a valid building" />
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-lg text-gray-600">Building not found or invalid building ID.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getAvailableSlots = (room: Room) => {
    const today = new Date();
    const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Get available slots for today
    const todaySlots = room.availability.filter(slot => 
      slot.day === currentDay && slot.isAvailable
    );
    
    return todaySlots;
  };

  const getAllAvailableSlots = (room: Room) => {
    // Get all available slots for all days
    return room.availability.filter(slot => slot.isAvailable);
  };

  const getAvailableSlotsCount = (room: Room) => {
    return getAllAvailableSlots(room).length;
  };

  const getRoomStatusColor = (room: Room) => {
    const availableSlots = getAvailableSlotsCount(room);
    if (availableSlots === 0) return 'bg-red-500';
    if (availableSlots <= 15) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRoomStatusText = (room: Room) => {
    const availableSlots = getAvailableSlotsCount(room);
    return `${availableSlots} Slots`;
  };

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case 'computer-lab': return '💻';
      case 'hydro/fluid-mech-lab': return '🌊';
      case 'matti/soil-test-lab': return '🏔️';
      case 'physics-lab': return '⚛️';
      case 'chemistry-lab': return '🧪';
      case 'biology-lab': return '🧬';
      case 'gs/jhs-lab': return '🔬';
      case 'he-lab': return '🍳';
      case 'con-med-lab': return '💊';
      case 'electronic/digital-lab': return '⚡';
      case 'demo-room': return '🎭';
      case 'nursing-lab': return '🏥';
      case 'culinary-lab': return '👨‍🍳';
      case 'Cafeteria': return '🍽️';
      case 'cisco-lab': return '🌐';
      case 'thesis-room': return '📚';
      case 'engineering-computer-lab': return '⚙️';
      case 'nutrition-lab': return '🥗';
      case 'psychology-lab': return '🧠';
      case 'masscom-lab': return '📺';
      case 'firing-range': return '🎯';
      case 'dancing-hall': return '💃';
      case 'mascom-lab': return '📹';
      case 'animation-lab': return '🎬';
      case 'classroom': return '📚';
      case 'lecture-hall': return '🎭';
      case 'seminar-room': return '💼';
      case 'drafting-room': return '📐';
      default: return '🏫';
    }
  };

  const floorsToShow = selectedFloor ? floors.filter(f => f.id === selectedFloor) : floors;

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Header 
        title={buildingInfo.name} 
        subtitle={`${buildingInfo.totalRooms} rooms across ${buildingInfo.floors} floors`}
      />
      <ScrollView className="flex-1">
        {/* Back Button */}
        <View className="mx-4 mt-4 mb-2">
          <TouchableOpacity
            onPress={() => router.push('/schedules')}
            className="flex-row items-center px-3 py-2 rounded-lg bg-white shadow-sm self-start"
          >
            <Text className="text-gray-700 font-medium">Back</Text>
          </TouchableOpacity>
        </View>
        
        {/* Building Info Card */}
        <View className="m-4 mt-2">
          <View 
            className="p-6 rounded-xl shadow-lg bg-green-950"
          >
            <Text className="text-white text-2xl font-bold mb-4">{buildingInfo.fullName}</Text>
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-white/80 text-sm">Total Rooms</Text>
                <Text className="text-white text-lg font-semibold">{buildingInfo.totalRooms}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white/80 text-sm">Floors</Text>
                <Text className="text-white text-lg font-semibold">{buildingInfo.floors}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white/80 text-sm">Available Now</Text>
                <Text className="text-white text-lg font-semibold">
                  {floors.reduce((total, floor) => 
                    total + floor.rooms.reduce((floorTotal, room) => 
                      floorTotal + getAvailableSlotsCount(room), 0
                    ), 0
                  )} slots
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="mb-4">
          <Text className="text-lg text-gray-500 text-center">
            Real-time availability • Last updated: {new Date().toLocaleTimeString()}
          </Text>
        </View>
        {/* Floor Filter */}
        <View className="mx-4 mb-4">
          <Text className="text-xl font-semibold mb-2 text-gray-800">Select Floor</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              <TouchableOpacity
                className={`px-4 py-2 rounded-lg ${selectedFloor === null ? 'bg-green-950' : 'bg-gray-200'}`}
                onPress={() => setSelectedFloor(null)}
              >
                <Text className={`font-medium ${selectedFloor === null ? 'text-white' : 'text-gray-700'}`}>
                  All Floors
                </Text>
              </TouchableOpacity>
              {floors.map((floor) => (
                <TouchableOpacity
                  key={floor.id}
                  className={`px-4 py-2 rounded-lg ${selectedFloor === floor.id ? 'bg-green-950' : 'bg-gray-200'}`}
                  onPress={() => setSelectedFloor(floor.id)}
                >
                  <Text className={`font-medium ${selectedFloor === floor.id ? 'text-white' : 'text-gray-700'}`}>
                    Floor {floor.id}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        {/* Floors and Rooms */}
        <View className="mx-4 mb-20">
          {floorsToShow.map((floor) => (
            <View key={floor.id} className="mb-6">
              <Text className="text-xl font-semibold mb-3 text-gray-800">{floor.name}</Text>
              <View className="bg-white rounded-lg overflow-hidden shadow">
                {/* Header row */}
                <View className="flex-row bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <Text className="flex-1 font-semibold text-gray-700">Room</Text>
                  <Text className="w-20 text-center font-semibold text-gray-700">Type</Text>
                  <Text className="w-16 text-center font-semibold text-gray-700">Cap.</Text>
                  <Text className="w-24 text-center font-semibold text-gray-700">Slots</Text>
                  <Text className="w-6 text-center font-semibold text-gray-700"></Text>
                </View>

                {floor.rooms.map((room) => {
                  const roomNumber = room.id.replace('room-', '');
                  const availableSlots = getAvailableSlots(room);
                  const isExpanded = expandedRoom === room.id;
                  
                  return (
                  <View key={room.id}>
                    <TouchableOpacity 
                      className="flex-row items-center px-4 py-3 border-b border-gray-100"
                      onPress={() => setExpandedRoom(isExpanded ? null : room.id)}
                    >
                      <View className="flex-1">
                        <Text className="text-gray-800 font-medium">{roomNumber}</Text>
                        <Text className="text-xs text-gray-500 mt-1">{room.name}</Text>
                      </View>

                      <View className="w-20 items-center">
                        <Text className="text-lg">{getRoomTypeIcon(room.type)}</Text>
                        <Text className="text-xs text-gray-500 mt-1">{room.type}</Text>
                      </View>

                      <View className="w-16 items-center">
                        <Text className="text-gray-700 font-medium">{room.capacity}</Text>
                      </View>

                      <View className="w-24 items-center">
                        <View className={`px-2 py-1 rounded-full ${getRoomStatusColor(room)}`}>
                          <Text className="text-white text-xs font-medium text-center">
                            {getRoomStatusText(room)}
                          </Text>
                        </View>
                      </View>
                      
                      <View className="w-6 items-center">
                        <Text className="text-gray-400 text-lg">
                          {isExpanded ? '▲' : '▼'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    
                    {isExpanded && (
                      <View className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <Text className="font-medium text-gray-700 mb-2">
                          Available Schedules:
                        </Text>
                        {(() => {
                          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                          const todaySlots = getAvailableSlots(room);
                          const allSlots = getAllAvailableSlots(room);
                          
                          // Group slots by day
                          const slotsByDay = allSlots.reduce((acc, slot) => {
                            if (!acc[slot.day]) acc[slot.day] = [];
                            acc[slot.day].push(slot);
                            return acc;
                          }, {} as Record<string, typeof allSlots>);
                          
                          return (
                            <View>
                              {/* Today's slots first */}
                              {todaySlots.length > 0 && (
                                <View className="mb-3">
                                  <Text className="font-medium text-green-700 mb-2 capitalize">
                                    Today ({today}) - {todaySlots.length} slots
                                  </Text>
                                  <View className="space-y-1">
                                    {todaySlots.slice(0, 3).map((slot, index) => (
                                      <View key={index} className="flex-row justify-between items-center bg-green-50 p-2 rounded">
                                        <Text className="text-gray-800">
                                          {slot.startTime} - {slot.endTime}
                                        </Text>
                                        <View className="bg-green-100 px-2 py-1 rounded">
                                          <Text className="text-green-700 text-xs font-medium">Available</Text>
                                        </View>
                                      </View>
                                    ))}
                                    {todaySlots.length > 3 && (
                                      <Text className="text-gray-500 text-sm italic">
                                        ... and {todaySlots.length - 3} more slots today
                                      </Text>
                                    )}
                                  </View>
                                </View>
                              )}
                              
                              {/* Summary for all days */}
                              <View className="mb-2">
                                <Text className="font-medium text-gray-600 mb-2">
                                  Weekly Summary: {allSlots.length} total slots available
                                </Text>
                                <View className="flex-row flex-wrap">
                                  {Object.entries(slotsByDay).map(([day, daySlots]) => (
                                    <View key={day} className="mr-3 mb-1">
                                      <Text className="text-xs text-gray-600 capitalize">
                                        {day.substring(0, 3)}: {daySlots.length} slots
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                              
                              {allSlots.length === 0 && (
                                <Text className="text-red-600 italic">No available time slots</Text>
                              )}
                            </View>
                          );
                        })()}
                      </View>
                    )}
                  </View>
                )})}
              </View>
              {/* Floor Summary */}
              <View className="mt-2 mx-2">
                <Text className="text-lg text-gray-500">
                  {floor.name}: {floor.rooms.reduce((total, room) => total + getAvailableSlotsCount(room), 0)} total slots available today
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}