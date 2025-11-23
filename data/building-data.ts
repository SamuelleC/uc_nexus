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
  totalRooms: number;
  floors: number;
  color: string;
}

export const BUILDINGS: Record<string, BuildingInfo> = {
  'U': {
    id: 'U',
    name: 'BRS Building (U Building)',
    fullName: 'BRS Building',
    totalRooms: 42,
    floors: 9,
    color: '#3B82F6' // Blue
  },
  'M': {
    id: 'M',
    name: 'Main Building (M Building)',
    fullName: 'Main Building',
    totalRooms: 13,
    floors: 2,
    color: '#10B981' // Green
  },
  'S': {
    id: 'S',
    name: 'Science Building (S Building)',
    fullName: 'Science Building',
    totalRooms: 69,
    floors: 7,
    color: '#8B5CF6' // Purple
  },
  'N': {
    id: 'N',
    name: 'EDS Building (N Building)',
    fullName: 'EDS Building',
    totalRooms: 35,
    floors: 5,
    color: '#F59E0B' // Amber
  },
  'F': {
    id: 'F',
    name: 'CHTM Building (F Building)',
    fullName: 'CHTM Building',
    totalRooms: 27,
    floors: 7,
    color: '#EC4899' // Pink
  },
  'G': {
    id: 'G',
    name: 'PE Building (G Building)',
    fullName: 'PE Building',
    totalRooms: 10,
    floors: 4,
    color: '#EC4899' // Pink
  }
};

export function generateFloorsForBuilding(buildingId: string): Floor[] {
  const buildingInfo = BUILDINGS[buildingId];
  if (!buildingInfo) return [];

  const floors: Floor[] = [];
  let nextRoomId = 1;
  const roomsPerFloor = Math.ceil(buildingInfo.totalRooms / buildingInfo.floors);

  for (let f = 1; f <= buildingInfo.floors; f++) {
    const rooms: Room[] = [];
    for (let r = 1; r <= roomsPerFloor; r++) {
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