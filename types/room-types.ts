export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  equipment: string[];
  department: string[];
  availability: TimeSlot[];
  type: 'classroom' | 'laboratory' | 'lecture-hall' | 'seminar-room' | 'computer-lab';
}

export interface TimeSlot {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  isAvailable: boolean;
}

export interface ClassRequest {
  classSize: number;
  department: string;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  requiredEquipment?: string[];
  preferredRoomType?: Room['type'];
}

export interface RoomSuggestion {
  room: Room;
  score: number;
  reasons: string[];
  concerns?: string[];
}

export interface AIResponse {
  suggestions: RoomSuggestion[];
  explanation: string;
  confidence: number;
}