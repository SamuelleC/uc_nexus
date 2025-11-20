import { GoogleGenerativeAI } from '@google/generative-ai';
import { MOCK_ROOMS } from '../data/room-data';
import { AIResponse, ClassRequest, Room, RoomSuggestion } from '../types/room-types';

// You'll need to get a free API key from https://ai.google.dev/
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

class RoomPredictionService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
      console.warn('Please set EXPO_PUBLIC_GEMINI_API_KEY in your environment variables');
    }
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // Fallback function for when AI is not available
  private fallbackRoomSuggestion(request: ClassRequest): AIResponse {
    const availableRooms = this.getAvailableRooms(request);
    const suggestions: RoomSuggestion[] = availableRooms.map(room => ({
      room,
      score: this.calculateBasicScore(room, request),
      reasons: this.getBasicReasons(room, request),
      concerns: this.getBasicConcerns(room, request)
    }));

    // Sort by score (highest first)
    suggestions.sort((a, b) => b.score - a.score);

    return {
      suggestions: suggestions.slice(0, 3), // Top 3 suggestions
      explanation: 'Room suggestions based on capacity, department match, and availability.',
      confidence: 0.7
    };
  }

  private getAvailableRooms(request: ClassRequest): Room[] {
    return MOCK_ROOMS.filter(room => {
      // Check if room is available on any of the requested days
      const isAvailable = room.availability.some(slot => 
        request.schedule.days.includes(slot.day.toLowerCase()) &&
        slot.isAvailable &&
        this.timeOverlaps(
          slot.startTime, slot.endTime,
          request.schedule.startTime, request.schedule.endTime
        )
      );

      // Check if room has sufficient capacity (with some buffer)
      const hasCapacity = room.capacity >= request.classSize;

      return isAvailable && hasCapacity;
    });
  }

  private timeOverlaps(slotStart: string, slotEnd: string, requestStart: string, requestEnd: string): boolean {
    const slotStartMinutes = this.timeToMinutes(slotStart);
    const slotEndMinutes = this.timeToMinutes(slotEnd);
    const requestStartMinutes = this.timeToMinutes(requestStart);
    const requestEndMinutes = this.timeToMinutes(requestEnd);

    return requestStartMinutes >= slotStartMinutes && requestEndMinutes <= slotEndMinutes;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private calculateBasicScore(room: Room, request: ClassRequest): number {
    let score = 50; // Base score

    // Department match
    if (room.department.includes(request.department)) {
      score += 30;
    }

    // Capacity efficiency (prefer rooms that aren't too oversized)
    const capacityRatio = request.classSize / room.capacity;
    if (capacityRatio >= 0.6 && capacityRatio <= 1.0) {
      score += 15;
    } else if (capacityRatio >= 0.4) {
      score += 10;
    } else if (capacityRatio >= 0.2) {
      score += 5;
    }

    // Equipment match
    if (request.requiredEquipment) {
      const equipmentMatches = request.requiredEquipment.filter(eq => 
        room.equipment.includes(eq)
      ).length;
      score += (equipmentMatches / request.requiredEquipment.length) * 15;
    }

    // Room type preference
    if (request.preferredRoomType && room.type === request.preferredRoomType) {
      score += 10;
    }

    return Math.min(100, score);
  }

  private getBasicReasons(room: Room, request: ClassRequest): string[] {
    const reasons: string[] = [];

    if (room.department.includes(request.department)) {
      reasons.push(`Matches ${request.department} department`);
    }

    const capacityRatio = request.classSize / room.capacity;
    if (capacityRatio >= 0.6) {
      reasons.push('Optimal capacity utilization');
    } else {
      reasons.push('Has sufficient capacity');
    }

    if (request.requiredEquipment) {
      const hasEquipment = request.requiredEquipment.some(eq => room.equipment.includes(eq));
      if (hasEquipment) {
        reasons.push('Has required equipment');
      }
    }

    reasons.push(`Available during ${request.schedule.days.join(', ')} ${request.schedule.startTime}-${request.schedule.endTime}`);

    return reasons;
  }

  private getBasicConcerns(room: Room, request: ClassRequest): string[] {
    const concerns: string[] = [];

    const capacityRatio = request.classSize / room.capacity;
    if (capacityRatio < 0.3) {
      concerns.push('Room might be oversized for class');
    }

    if (!room.department.includes(request.department)) {
      concerns.push('Not in preferred department building');
    }

    if (request.requiredEquipment) {
      const missingEquipment = request.requiredEquipment.filter(eq => 
        !room.equipment.includes(eq)
      );
      if (missingEquipment.length > 0) {
        concerns.push(`Missing equipment: ${missingEquipment.join(', ')}`);
      }
    }

    return concerns;
  }

  async suggestRooms(request: ClassRequest): Promise<AIResponse> {
    try {
      // Prepare the prompt for Gemini
      const availableRooms = this.getAvailableRooms(request);
      
      if (availableRooms.length === 0) {
        return {
          suggestions: [],
          explanation: 'No rooms available for the specified time and requirements.',
          confidence: 1.0
        };
      }

      const prompt = `
You are a university room scheduling AI. Analyze the following room booking request and available rooms, then suggest the best 3 rooms with explanations.

REQUEST:
- Class size: ${request.classSize} students
- Department: ${request.department}
- Schedule: ${request.schedule.days.join(', ')} ${request.schedule.startTime}-${request.schedule.endTime}
- Required equipment: ${request.requiredEquipment?.join(', ') || 'None specified'}
- Preferred room type: ${request.preferredRoomType || 'Any'}

AVAILABLE ROOMS:
${JSON.stringify(availableRooms, null, 2)}

Please provide your response in the following JSON format:
{
  "suggestions": [
    {
      "roomId": "room-id",
      "score": 85,
      "reasons": ["reason1", "reason2"],
      "concerns": ["concern1"] // optional
    }
  ],
  "explanation": "Overall explanation of recommendations",
  "confidence": 0.9
}

Consider factors like:
1. Department match and building location
2. Capacity efficiency (not too oversized, not undersized)
3. Equipment availability
4. Room type appropriateness
5. Any potential concerns or limitations

Provide exactly 3 suggestions (or fewer if less than 3 rooms available), ranked by suitability score (0-100).
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse the AI response
      try {
        const aiData = JSON.parse(text);
        
        // Map room IDs back to room objects
        const suggestions: RoomSuggestion[] = aiData.suggestions.map((suggestion: any) => {
          const room = availableRooms.find(r => r.id === suggestion.roomId);
          return {
            room: room!,
            score: suggestion.score,
            reasons: suggestion.reasons,
            concerns: suggestion.concerns || []
          };
        });

        return {
          suggestions,
          explanation: aiData.explanation,
          confidence: aiData.confidence
        };

      } catch (parseError) {
        console.warn('Failed to parse AI response, using fallback:', parseError);
        return this.fallbackRoomSuggestion(request);
      }

    } catch (error) {
      console.warn('AI service unavailable, using fallback algorithm:', error);
      return this.fallbackRoomSuggestion(request);
    }
  }
}

export const roomPredictionService = new RoomPredictionService();