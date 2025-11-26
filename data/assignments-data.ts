import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RoomAssignment {
  id: string;
  roomId: string;
  roomName: string;
  department: string;
  className: string;
  classSize: number;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  assignedAt: string; // ISO date string
}

const ASSIGNMENTS_STORAGE_KEY = '@room_assignments';

// In-memory storage for assignments with persistent storage backup
let assignments: RoomAssignment[] = [];

// Load assignments from storage
const loadAssignments = async (): Promise<RoomAssignment[]> => {
  try {
    const stored = await AsyncStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
    if (stored && stored.trim() !== '') {
      const parsed = JSON.parse(stored);
      // Validate parsed data
      if (Array.isArray(parsed)) {
        assignments = parsed.filter(item => 
          item && 
          typeof item === 'object' && 
          item.id && 
          item.roomId && 
          item.schedule
        );
        return assignments;
      }
    }
  } catch (error) {
    console.error('Error loading assignments:', error);
    // Reset assignments on parse error
    assignments = [];
    try {
      await AsyncStorage.removeItem(ASSIGNMENTS_STORAGE_KEY);
    } catch (clearError) {
      console.error('Error clearing corrupted storage:', clearError);
    }
  }
  return [];
};

// Save assignments to storage
const saveAssignments = async (assignmentsToSave: RoomAssignment[]): Promise<void> => {
  try {
    if (!Array.isArray(assignmentsToSave)) {
      console.error('Invalid assignments data, skipping save');
      return;
    }
    await AsyncStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignmentsToSave));
  } catch (error) {
    console.error('Error saving assignments:', error);
    // Don't throw error to prevent app crash
  }
};

// Initialize assignments on first load
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

const initializeAssignments = async (): Promise<void> => {
  if (isInitialized) return;
  
  // Prevent multiple initialization calls
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = (async () => {
    try {
      await loadAssignments();
      isInitialized = true;
    } catch (error) {
      console.error('Error initializing assignments:', error);
      assignments = [];
      isInitialized = true;
    }
  })();
  
  return initializationPromise;
};

export const AssignmentService = {
  // Initialize and get all assignments
  async getAllAssignments(): Promise<RoomAssignment[]> {
    try {
      await initializeAssignments();
      return [...assignments];
    } catch (error) {
      console.error('Error getting all assignments:', error);
      return [];
    }
  },

  // Get assignments for a specific room
  async getAssignmentsForRoom(roomId: string): Promise<RoomAssignment[]> {
    try {
      await initializeAssignments();
      if (!roomId) return [];
      return assignments.filter(assignment => assignment && assignment.roomId === roomId);
    } catch (error) {
      console.error('Error getting assignments for room:', error);
      return [];
    }
  },

  // Get assignments for a specific time slot
  async getAssignmentsForTimeSlot(day: string, startTime: string, endTime: string): Promise<RoomAssignment[]> {
    try {
      await initializeAssignments();
      if (!day || !startTime || !endTime) return [];
      
      return assignments.filter(assignment => {
        try {
          return assignment && 
                 assignment.schedule && 
                 Array.isArray(assignment.schedule.days) &&
                 assignment.schedule.days.includes(day.toLowerCase()) &&
                 this.timeOverlaps(assignment.schedule.startTime, assignment.schedule.endTime, startTime, endTime);
        } catch (error) {
          console.error('Error checking assignment overlap:', error);
          return false;
        }
      });
    } catch (error) {
      console.error('Error getting assignments for time slot:', error);
      return [];
    }
  },

  // Add a new assignment
  async addAssignment(assignment: Omit<RoomAssignment, 'id' | 'assignedAt'>): Promise<RoomAssignment | null> {
    try {
      await initializeAssignments();
      
      if (!assignment || !assignment.roomId || !assignment.schedule) {
        console.error('Invalid assignment data');
        return null;
      }
      
      const newAssignment: RoomAssignment = {
        ...assignment,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        assignedAt: new Date().toISOString()
      };
      
      assignments.push(newAssignment);
      await saveAssignments(assignments);
      return newAssignment;
    } catch (error) {
      console.error('Error adding assignment:', error);
      return null;
    }
  },

  // Remove an assignment
  async removeAssignment(assignmentId: string): Promise<boolean> {
    await initializeAssignments();
    
    const index = assignments.findIndex(assignment => assignment.id === assignmentId);
    if (index !== -1) {
      assignments.splice(index, 1);
      await saveAssignments(assignments);
      return true;
    }
    return false;
  },

  // Check if a room is available for a specific time slot
  async isRoomAvailable(roomId: string, days: string[], startTime: string, endTime: string): Promise<boolean> {
    await initializeAssignments();
    
    const roomAssignments = assignments.filter(assignment => assignment.roomId === roomId);
    
    for (const assignment of roomAssignments) {
      // Check if any of the requested days overlap with existing assignments
      const hasOverlappingDays = assignment.schedule.days.some(assignedDay => 
        days.some(requestDay => assignedDay.toLowerCase() === requestDay.toLowerCase())
      );
      
      if (hasOverlappingDays && this.timeOverlaps(
        assignment.schedule.startTime, 
        assignment.schedule.endTime, 
        startTime, 
        endTime
      )) {
        return false; // Room is not available
      }
    }
    
    return true; // Room is available
  },

  // Helper method to check if two time ranges overlap
  timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
    const startTime1 = this.timeToMinutes(start1);
    const endTime1 = this.timeToMinutes(end1);
    const startTime2 = this.timeToMinutes(start2);
    const endTime2 = this.timeToMinutes(end2);

    return startTime1 < endTime2 && endTime1 > startTime2;
  },

  // Convert time string to minutes for comparison
  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  },

  // Get assignments by department
  async getAssignmentsByDepartment(department: string): Promise<RoomAssignment[]> {
    await initializeAssignments();
    return assignments.filter(assignment => assignment.department === department);
  },

  // Clear all assignments (useful for testing)
  async clearAllAssignments(): Promise<void> {
    assignments = [];
    await saveAssignments(assignments);
  },

  // Debug: Log all current assignments
  async logAllAssignments(): Promise<void> {
    await initializeAssignments();
    console.log('=== CURRENT ASSIGNMENTS ===');
    console.log(`Total assignments: ${assignments.length}`);
    assignments.forEach((assignment, index) => {
      console.log(`${index + 1}. Room ${assignment.roomId} (${assignment.roomName})`);
      console.log(`   Department: ${assignment.department}`);
      console.log(`   Class: ${assignment.className}`);
      console.log(`   Schedule: ${assignment.schedule.days.join(', ')} ${assignment.schedule.startTime}-${assignment.schedule.endTime}`);
      console.log(`   Assigned at: ${assignment.assignedAt}`);
      console.log('');
    });
    console.log('=== END ASSIGNMENTS ===');
  }
};