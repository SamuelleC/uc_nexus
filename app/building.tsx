import Header from '@/components/header';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BuildingInfo, BUILDINGS, Floor, generateFloorsForBuilding, Room } from '../data/building-data';

export default function Building() {
  const { building } = useLocalSearchParams<{ building: string }>();
  const [floors, setFloors] = useState<Floor[]>([]);
  const [buildingInfo, setBuildingInfo] = useState<BuildingInfo | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  useEffect(() => {
    if (building && BUILDINGS[building]) {
      const info = BUILDINGS[building];
      setBuildingInfo(info);
      setFloors(generateFloorsForBuilding(building));
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

  const getRoomStatusColor = (room: Room) => {
    if (room.occupied) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getRoomStatusText = (room: Room) => {
    return room.occupied ? 'Occupied' : 'Available';
  };

  const getRoomTypeIcon = (type?: Room['type']) => {
    switch (type) {
      case 'laboratory': return '🧪';
      case 'lecture-hall': return '🎭';
      case 'office': return '🏢';
      case 'gym': return '🏃‍♂️';
      case 'conference': return '💼';
      default: return '📚';
    }
  };

  const floorsToShow = selectedFloor ? floors.filter(f => f.id === selectedFloor) : floors;

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Header 
        title={buildingInfo.name} 
        subtitle={buildingInfo.description}
      />
      <ScrollView className="flex-1">
        {/* Building Info Card */}
        <View className="m-4">
          <View 
            className="p-6 rounded-xl shadow-lg bg-green-950"
          >
            <Text className="text-white text-2xl font-bold mb-2">{buildingInfo.fullName}</Text>
            <Text className="text-white/90 text-base mb-3">{buildingInfo.description}</Text>
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
                    total + floor.rooms.filter(room => !room.occupied).length, 0
                  )}
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
                  <Text className="w-24 text-center font-semibold text-gray-700">Status</Text>
                </View>

                {floor.rooms.map((room) => (
                  <View key={room.id} className="flex-row items-center px-4 py-3 border-b border-gray-100">
                    <View className="flex-1">
                      <Text className="text-gray-800 font-medium">{room.name}</Text>
                      {room.equipment && room.equipment.length > 0 && (
                        <Text className="text-xs text-gray-500 mt-1">
                          {room.equipment.slice(0, 2).join(', ')}
                          {room.equipment.length > 2 && '...'}
                        </Text>
                      )}
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
                  </View>
                ))}
              </View>
              {/* Floor Summary */}
              <View className="mt-2 mx-2">
                <Text className="text-lg text-gray-500">
                  Floor {floor.id}: {floor.rooms.filter(r => !r.occupied).length} available, {' '}
                  {floor.rooms.filter(r => r.occupied).length} occupied
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}