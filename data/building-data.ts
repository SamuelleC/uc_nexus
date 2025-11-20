export interface Room {
  id: number;
  name: string;
  occupied: boolean;
  capacity?: number;
  equipment?: string[];
  type?: 'classroom' | 'laboratory' | 'conference' | 'lecture-hall' | 'office' | 'gym';
}

export interface Floor {
  id: number;
  name: string;
  rooms: Room[];
}

export interface BuildingInfo {
  id: string;
  name: string;
  fullName: string;
  description: string;
  totalRooms: number;
  floors: number;
  roomsPerFloor: number;
  specialFeatures?: string[];
  color: string;
}

export const BUILDINGS: Record<string, BuildingInfo> = {
  'U': {
    id: 'U',
    name: 'U Building',
    fullName: 'University Main Building',
    description: 'The main academic building housing classrooms and administrative offices',
    totalRooms: 100,
    floors: 10,
    roomsPerFloor: 10,
    specialFeatures: ['Library on 3rd floor', 'Computer labs on 5th floor', 'Administrative offices on 10th floor'],
    color: '#3B82F6' // Blue
  },
  'M': {
    id: 'M',
    name: 'M Building',
    fullName: 'Mathematics & Engineering Building',
    description: 'Dedicated to mathematics, engineering, and technical courses',
    totalRooms: 80,
    floors: 8,
    roomsPerFloor: 10,
    specialFeatures: ['Engineering labs', 'CAD workstations', 'Research facilities'],
    color: '#10B981' // Green
  },
  'S': {
    id: 'S',
    name: 'S Building',
    fullName: 'Science Laboratory Building',
    description: 'Science laboratories and research facilities',
    totalRooms: 60,
    floors: 6,
    roomsPerFloor: 10,
    specialFeatures: ['Chemistry labs', 'Physics labs', 'Biology labs', 'Research centers'],
    color: '#8B5CF6' // Purple
  },
  'N': {
    id: 'N',
    name: 'N Building',
    fullName: 'Nursing & Health Sciences Building',
    description: 'Health sciences programs and medical simulation labs',
    totalRooms: 50,
    floors: 5,
    roomsPerFloor: 10,
    specialFeatures: ['Medical simulation labs', 'Nursing practice rooms', 'Health clinics'],
    color: '#F59E0B' // Amber
  },
  'F': {
    id: 'F',
    name: 'F Building',
    fullName: 'Fine Arts & Humanities Building',
    description: 'Arts, music, literature, and cultural studies',
    totalRooms: 40,
    floors: 4,
    roomsPerFloor: 10,
    specialFeatures: ['Music studios', 'Art galleries', 'Performance halls', 'Media labs'],
    color: '#EC4899' // Pink
  }
};

export function generateFloorsForBuilding(buildingId: string): Floor[] {
  const buildingInfo = BUILDINGS[buildingId];
  if (!buildingInfo) return [];

  const floors: Floor[] = [];
  let nextRoomId = 1;

  for (let f = 1; f <= buildingInfo.floors; f++) {
    const rooms: Room[] = [];
    for (let r = 1; r <= buildingInfo.roomsPerFloor; r++) {
      const roomNumber = `${f}${String(r).padStart(2, '0')}`; // e.g. 101, 102 ...
      
      // Generate different room types based on building
      let roomType: Room['type'] = 'classroom';
      let equipment: string[] = ['projector', 'whiteboard'];
      let capacity = 30;

      if (buildingId === 'S') {
        roomType = Math.random() > 0.5 ? 'laboratory' : 'classroom';
        equipment = roomType === 'laboratory' 
          ? ['lab-equipment', 'fume-hood', 'safety-equipment'] 
          : ['projector', 'whiteboard'];
        capacity = roomType === 'laboratory' ? 20 : 35;
      } else if (buildingId === 'M') {
        roomType = Math.random() > 0.7 ? 'laboratory' : 'classroom';
        equipment = roomType === 'laboratory' 
          ? ['computers', 'CAD-software', 'engineering-tools'] 
          : ['projector', 'whiteboard', 'smart-board'];
        capacity = roomType === 'laboratory' ? 25 : 40;
      } else if (buildingId === 'F') {
        const rand = Math.random();
        if (rand > 0.8) roomType = 'lecture-hall';
        else if (rand > 0.6) roomType = 'office';
        equipment = roomType === 'lecture-hall' 
          ? ['audio-system', 'stage-lighting', 'microphone'] 
          : ['projector', 'piano', 'art-supplies'];
        capacity = roomType === 'lecture-hall' ? 100 : roomType === 'office' ? 5 : 25;
      }

      rooms.push({ 
        id: nextRoomId++, 
        name: `${buildingId}${roomNumber}`, 
        occupied: (nextRoomId % 3) === 0,
        capacity,
        equipment,
        type: roomType
      });
    }
    floors.push({ id: f, name: `Floor ${f}`, rooms });
  }

  return floors;
}