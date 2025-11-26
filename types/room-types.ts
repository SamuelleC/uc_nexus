export interface Room {
  id: string; 
  name: string;
  description?: string;
  capacity: number; 
  location: string; 
  equipment?: string[];
  department?: string[];
  availability: TimeSlot[]; 
  type: 'classroom' | 'lecture-hall' | 'seminar-room' | 'computer-lab' | 'drafting-room'
        | 'hydro/fluid-mech-lab' | 'matti/soil-test-lab' | 'physics-lab' | 'chemistry-lab' | 'biology-lab'
        | 'gs/jhs-lab' | 'he-lab' | 'con-med-lab' | 'electronic/digital-lab' | 'demo-room' 
        | 'nursing-lab' | 'culinary-lab' | 'Cafeteria' | 'cisco-lab' | 'thesis-room'
        | 'engineering-computer-lab' | 'nutrition-lab' | 'psychology-lab' | 'masscom-lab' | 'firing-range'
        | 'dancing-hall' | 'mascom-lab' | 'animation-lab' | 'cea-computer-lab';
}

export interface TimeSlot {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  isAvailable: boolean;
}

export interface ClassRequest {
  className?: string; // Optional class name for assignments
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