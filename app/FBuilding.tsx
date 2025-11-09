import Header from '@/components/header';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

type Room = { id: number; name: string; occupied: boolean };
type Floor = { id: number; name: string; rooms: Room[] };

function generateFloors(prefix: string, totalFloors = 10, roomsPerFloor = 10): Floor[] {
  const floors: Floor[] = [];
  let nextRoomId = 1;

  for (let f = 1; f <= totalFloors; f++) {
    const rooms: Room[] = [];
    for (let r = 1; r <= roomsPerFloor; r++) {
      const roomNumber = `${f}${String(r).padStart(2, '0')}`;
      rooms.push({ id: nextRoomId++, name: `${prefix}${roomNumber}`, occupied: nextRoomId % 3 === 0 });
    }
    floors.push({ id: f, name: `Floor ${f}`, rooms });
  }

  return floors;
}

export default function FBuilding() {
  const [floors] = useState<Floor[]>(() => generateFloors('F', 10, 10));

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Header title="F Building" subtitle="Rooms and availability" />
      <ScrollView className="p-6">
        <Text className="text-2xl font-bold mb-4 sr-only">F Building Rooms</Text>

        {floors.map((floor) => (
          <View key={floor.id} className="mb-6">
            <Text className="text-xl font-semibold mb-2">{floor.name}</Text>

            <View className="bg-white rounded-lg overflow-hidden shadow">
              <View className="flex-row bg-gray-50 px-4 py-2">
                <Text className="flex-1 font-medium">Room</Text>
                <Text className="w-32 text-right font-medium">Availability</Text>
              </View>

              {floor.rooms.map((room) => (
                <View key={room.id} className="flex-row items-center px-4 py-3 border-t border-gray-100">
                  <Text className="flex-1 text-gray-700">{room.name}</Text>

                  <View className="w-32 flex-row justify-end">
                    <View className={'px-3 py-1 rounded-full ' + (room.occupied ? 'bg-red-600' : 'bg-green-600')}>
                      <Text className="text-white text-sm">{room.occupied ? 'Occupied' : 'Available'}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text className="text-sm text-gray-500 mt-2">Availability is read-only on this screen.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
