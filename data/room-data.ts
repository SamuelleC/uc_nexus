import { Room } from '../types/room-types';

// Mock data for university rooms
export const MOCK_ROOMS: Room[] = [
  {
    id: 'room-001',
    name: 'Engineering Building - Room 101',
    capacity: 30,
    location: 'Engineering Building, Ground Floor',
    equipment: ['projector', 'whiteboard', 'audio-system'],
    department: ['engineering', 'computer-science'],
    type: 'classroom',
    availability: [
      { day: 'monday', startTime: '08:00', endTime: '10:00', isAvailable: true },
      { day: 'monday', startTime: '10:00', endTime: '12:00', isAvailable: false },
      { day: 'monday', startTime: '13:00', endTime: '15:00', isAvailable: true },
      { day: 'tuesday', startTime: '08:00', endTime: '10:00', isAvailable: true },
      { day: 'wednesday', startTime: '08:00', endTime: '12:00', isAvailable: true },
      { day: 'thursday', startTime: '13:00', endTime: '17:00', isAvailable: true },
      { day: 'friday', startTime: '08:00', endTime: '12:00', isAvailable: true },
    ]
  },
  {
    id: 'room-002',
    name: 'Science Building - Lab 201',
    capacity: 25,
    location: 'Science Building, 2nd Floor',
    equipment: ['projector', 'lab-equipment', 'fume-hood', 'safety-shower'],
    department: ['chemistry', 'biology', 'physics'],
    type: 'laboratory',
    availability: [
      { day: 'monday', startTime: '08:00', endTime: '12:00', isAvailable: true },
      { day: 'tuesday', startTime: '13:00', endTime: '17:00', isAvailable: true },
      { day: 'wednesday', startTime: '08:00', endTime: '12:00', isAvailable: false },
      { day: 'thursday', startTime: '08:00', endTime: '17:00', isAvailable: true },
      { day: 'friday', startTime: '13:00', endTime: '17:00', isAvailable: true },
    ]
  },
  {
    id: 'room-003',
    name: 'Main Building - Lecture Hall A',
    capacity: 150,
    location: 'Main Building, Ground Floor',
    equipment: ['projector', 'microphone', 'audio-system', 'stage-lighting'],
    department: ['general', 'business', 'liberal-arts'],
    type: 'lecture-hall',
    availability: [
      { day: 'monday', startTime: '09:00', endTime: '11:00', isAvailable: true },
      { day: 'tuesday', startTime: '09:00', endTime: '11:00', isAvailable: false },
      { day: 'wednesday', startTime: '14:00', endTime: '16:00', isAvailable: true },
      { day: 'thursday', startTime: '09:00', endTime: '11:00', isAvailable: true },
      { day: 'friday', startTime: '14:00', endTime: '17:00', isAvailable: true },
    ]
  },
  {
    id: 'room-004',
    name: 'Computer Science Building - Lab 301',
    capacity: 40,
    location: 'Computer Science Building, 3rd Floor',
    equipment: ['computers', 'projector', 'whiteboard', 'network-access'],
    department: ['computer-science', 'information-technology'],
    type: 'computer-lab',
    availability: [
      { day: 'monday', startTime: '08:00', endTime: '12:00', isAvailable: true },
      { day: 'monday', startTime: '13:00', endTime: '17:00', isAvailable: false },
      { day: 'tuesday', startTime: '08:00', endTime: '17:00', isAvailable: true },
      { day: 'wednesday', startTime: '08:00', endTime: '12:00', isAvailable: true },
      { day: 'thursday', startTime: '13:00', endTime: '17:00', isAvailable: true },
      { day: 'friday', startTime: '08:00', endTime: '15:00', isAvailable: true },
    ]
  },
  {
    id: 'room-005',
    name: 'Business Building - Seminar Room 202',
    capacity: 20,
    location: 'Business Building, 2nd Floor',
    equipment: ['projector', 'conference-table', 'video-conferencing'],
    department: ['business', 'management', 'economics'],
    type: 'seminar-room',
    availability: [
      { day: 'monday', startTime: '10:00', endTime: '12:00', isAvailable: true },
      { day: 'tuesday', startTime: '14:00', endTime: '16:00', isAvailable: true },
      { day: 'wednesday', startTime: '09:00', endTime: '11:00', isAvailable: false },
      { day: 'thursday', startTime: '10:00', endTime: '12:00', isAvailable: true },
      { day: 'friday', startTime: '13:00', endTime: '15:00', isAvailable: true },
    ]
  },
  {
    id: 'room-006',
    name: 'Engineering Building - Room 305',
    capacity: 35,
    location: 'Engineering Building, 3rd Floor',
    equipment: ['projector', 'whiteboard', 'audio-system', 'drafting-tables'],
    department: ['engineering', 'architecture'],
    type: 'classroom',
    availability: [
      { day: 'monday', startTime: '14:00', endTime: '16:00', isAvailable: true },
      { day: 'tuesday', startTime: '10:00', endTime: '12:00', isAvailable: true },
      { day: 'wednesday', startTime: '08:00', endTime: '10:00', isAvailable: true },
      { day: 'thursday', startTime: '14:00', endTime: '16:00', isAvailable: false },
      { day: 'friday', startTime: '09:00', endTime: '11:00', isAvailable: true },
    ]
  }
];

export const DEPARTMENTS = [
  'computer-science',
  'engineering',
  'business',
  'chemistry',
  'biology',
  'physics',
  'mathematics',
  'liberal-arts',
  'management',
  'economics',
  'architecture',
  'information-technology'
];

export const EQUIPMENT_OPTIONS = [
  'projector',
  'whiteboard',
  'audio-system',
  'computers',
  'lab-equipment',
  'microphone',
  'video-conferencing',
  'network-access',
  'stage-lighting',
  'drafting-tables',
  'fume-hood',
  'safety-shower'
];