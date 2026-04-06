import AsyncStorage from "@react-native-async-storage/async-storage";
import { ClassSchedule } from "./class-schedule-data";

const USER_SCHEDULE_KEY = "@user_class_schedule";

export interface UserScheduleService {
  getUserSchedule: () => Promise<ClassSchedule[]>;
  saveUserSchedule: (schedule: ClassSchedule[]) => Promise<void>;
  addSubject: (subject: Omit<ClassSchedule, "id">) => Promise<ClassSchedule>;
  updateSubject: (id: string, subject: Partial<ClassSchedule>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  hasSchedule: () => Promise<boolean>;
  clearSchedule: () => Promise<void>;
}

// Generate unique ID
const generateId = (): string => {
  return `subject-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Auto-generate time slot based on existing schedules
const generateTimeSlot = (existingSchedules: ClassSchedule[]): string => {
  const timeSlots = [
    "MWF 7:30-9:00 AM",
    "MWF 9:00-10:30 AM",
    "MWF 10:30-12:00 PM",
    "MWF 1:00-2:30 PM",
    "MWF 2:30-4:00 PM",
    "TTh 7:30-9:00 AM",
    "TTh 9:00-10:30 AM",
    "TTh 10:30-12:00 PM",
    "TTh 1:00-2:30 PM",
    "TTh 2:30-4:00 PM",
  ];

  const usedSlots = existingSchedules.map((s) => s.schedule);
  const availableSlots = timeSlots.filter((slot) => !usedSlots.includes(slot));

  if (availableSlots.length > 0) {
    return availableSlots[0];
  }

  // If all slots are used, return the next available slot
  return timeSlots[existingSchedules.length % timeSlots.length];
};

// Auto-generate room based on course code
const generateRoom = (courseCode: string): string => {
  const rooms = [
    "M301",
    "M302",
    "M303",
    "M304",
    "M305",
    "M306",
    "M307",
    "S201",
    "S202",
    "S203",
    "U201",
    "U202",
  ];
  const hash = courseCode
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return rooms[hash % rooms.length];
};

export const userScheduleService: UserScheduleService = {
  async getUserSchedule(): Promise<ClassSchedule[]> {
    try {
      const stored = await AsyncStorage.getItem(USER_SCHEDULE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error("Error loading user schedule:", error);
      return [];
    }
  },

  async saveUserSchedule(schedule: ClassSchedule[]): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_SCHEDULE_KEY, JSON.stringify(schedule));
    } catch (error) {
      console.error("Error saving user schedule:", error);
    }
  },

  async addSubject(subject: Omit<ClassSchedule, "id">): Promise<ClassSchedule> {
    const schedule = await this.getUserSchedule();

    // Auto-generate time and room if not provided
    const newSubject: ClassSchedule = {
      id: generateId(),
      section: subject.section,
      courseCode: subject.courseCode,
      description: subject.description,
      schedule: subject.schedule || generateTimeSlot(schedule),
      room: subject.room || generateRoom(subject.courseCode),
    };

    schedule.push(newSubject);
    await this.saveUserSchedule(schedule);
    return newSubject;
  },

  async updateSubject(
    id: string,
    updates: Partial<ClassSchedule>,
  ): Promise<void> {
    const schedule = await this.getUserSchedule();
    const index = schedule.findIndex((s) => s.id === id);

    if (index !== -1) {
      schedule[index] = { ...schedule[index], ...updates };
      await this.saveUserSchedule(schedule);
    }
  },

  async deleteSubject(id: string): Promise<void> {
    const schedule = await this.getUserSchedule();
    const filtered = schedule.filter((s) => s.id !== id);
    await this.saveUserSchedule(filtered);
  },

  async hasSchedule(): Promise<boolean> {
    const schedule = await this.getUserSchedule();
    return schedule.length > 0;
  },

  async clearSchedule(): Promise<void> {
    await AsyncStorage.removeItem(USER_SCHEDULE_KEY);
  },
};
