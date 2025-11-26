import { GoogleGenerativeAI } from '@google/generative-ai';
import { BUILDINGS } from '../data/building-data';
import { ROOMS } from '../data/room-data';
import { AIResponse, ClassRequest, Room, RoomSuggestion } from '../types/room-types';

// You'll need to get a free API key from https://ai.google.dev/
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

class RoomPredictionService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
      console.warn('Please set EXPO_PUBLIC_GEMINI_API_KEY in your environment variables');
    } else {
      console.log('Google AI API key is configured');
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
    return ROOMS.filter(room => {
      // Check if room is available on any of the requested days
      const isAvailable = room.availability.some(slot => 
        request.schedule.days.includes(slot.day.toLowerCase()) &&
        slot.isAvailable &&
        this.timeOverlaps(
          slot.startTime, slot.endTime,
          request.schedule.startTime, request.schedule.endTime
        )
      );

      // Check if room has sufficient capacity
      const hasCapacity = room.capacity >= request.classSize;

      return isAvailable && hasCapacity;
    });
  }

  private timeOverlaps(slotStart: string, slotEnd: string, requestStart: string, requestEnd: string): boolean {
    const slotStartMinutes = this.timeToMinutes(slotStart);
    const slotEndMinutes = this.timeToMinutes(slotEnd);
    const requestStartMinutes = this.timeToMinutes(requestStart);
    const requestEndMinutes = this.timeToMinutes(requestEnd);

    // Check if the requested time overlaps with or exactly matches the slot time
    return requestStartMinutes >= slotStartMinutes && requestEndMinutes <= slotEndMinutes;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private calculateBasicScore(room: Room, request: ClassRequest): number {
    let score = 50; // Base score

    // Department match
    if (room.department?.includes(request.department)) {
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
        room.equipment?.includes(eq)
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

    if (room.department?.includes(request.department)) {
      reasons.push(`Matches ${request.department} department`);
    }

    const capacityRatio = request.classSize / room.capacity;
    if (capacityRatio >= 0.6) {
      reasons.push('Optimal capacity utilization');
    } else {
      reasons.push('Has sufficient capacity');
    }

    if (request.requiredEquipment) {
      const hasEquipment = request.requiredEquipment.some(eq => room.equipment?.includes(eq));
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

    if (!room.department?.includes(request.department)) {
      concerns.push('Not in preferred department building');
    }

    if (request.requiredEquipment) {
      const missingEquipment = request.requiredEquipment.filter(eq => 
        !room.equipment?.includes(eq)
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

  async getAIHelperResponse(facultyName: string, courseCode: string, courseName: string, customPrompt: string): Promise<string> {
    try {
      // Check if API key is configured
      if (API_KEY === 'YOUR_API_KEY_HERE') {
        return this.getFallbackAIHelperResponse(customPrompt);
      }

      // Get sample of room data for AI context
      const roomSample = ROOMS.slice(0, 10).map(room => ({
        id: room.id,
        name: room.name,
        location: room.location,
        capacity: room.capacity,
        type: room.type,
        department: room.department,
        equipment: room.equipment
      }));

      const prompt = `
You are a university course management and scheduling AI assistant. You have been asked to help with the following:

User's Request: ${customPrompt}

AVAILABLE BUILDING DATA:
${JSON.stringify(BUILDINGS, null, 2)}

SAMPLE ROOM DATA (we have many more similar rooms):
${JSON.stringify(roomSample, null, 2)}

Please provide helpful, practical advice or suggestions based on the information provided. Use the actual building and room data above to give specific recommendations. Consider factors such as:
- Specific rooms from our database that match requirements
- Building locations and their specializations
- Actual room capacities and equipment available
- Department alignments and building purposes
- Course scheduling and room requirements
- Student needs and class management
- Resource allocation and equipment needs
- Best practices for course delivery

Always reference specific buildings, room types, or equipment from the data provided above when relevant.

Provide a clear, actionable response that addresses the user's specific request with concrete examples from our university's facilities.
`;

      console.log('Sending request to AI service...');
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      console.log('AI service response received successfully');
      return response.text();

    } catch (error) {
      console.error('AI Helper service error:', error);
      
      // Return fallback response instead of error message
      console.log('Using fallback AI Helper response');
      return this.getFallbackAIHelperResponse(customPrompt);
    }
  }

  private getFallbackAIHelperResponse(customPrompt: string): string {
    const prompt = customPrompt.toLowerCase();
    
    // Get actual building and room data
    const buildings = Object.values(BUILDINGS);
    const totalRooms = buildings.reduce((sum, building) => sum + building.totalRooms, 0);
    
    if (prompt.includes('room') || prompt.includes('suitable') || prompt.includes('best')) {
      const labs = ROOMS.filter(room => room.type?.includes('lab')).slice(0, 5);
      const classrooms = ROOMS.filter(room => room.type === 'classroom').slice(0, 5);
      const seminarRooms = ROOMS.filter(room => room.type === 'seminar-room').slice(0, 3);
      
      return `Based on our actual room database with ${totalRooms} total rooms, here are specific recommendations:

🏫 **Laboratory Rooms** (${labs.length} available):
${labs.map(room => `• ${room.name} - ${room.location}, Capacity: ${room.capacity}, Equipment: ${room.equipment?.join(', ') || 'Standard lab equipment'}`).join('\n')}

📚 **Classrooms** (${classrooms.length} shown):
${classrooms.map(room => `• ${room.name} - ${room.location}, Capacity: ${room.capacity}, Department: ${room.department || 'General'}`).join('\n')}

🤝 **Seminar Rooms** (${seminarRooms.length} available):
${seminarRooms.map(room => `• ${room.name} - ${room.location}, Capacity: ${room.capacity || 'Small group'}`).join('\n')}

📍 **Buildings Overview:**
${buildings.map(building => `• ${building.name}: ${building.totalRooms} rooms, ${building.floors} floors`).join('\n')}`;
    }

    if (prompt.includes('equipment') || prompt.includes('resource') || prompt.includes('need')) {
      const equipmentRooms = ROOMS.filter(room => room.equipment && room.equipment.length > 0).slice(0, 8);
      
      return `Based on our room equipment database, here's what's available:

🛠️ **Equipped Rooms in Our Database:**
${equipmentRooms.map(room => `• ${room.name} (${room.location}): ${room.equipment?.join(', ')}`).join('\n')}

📊 **Equipment Summary:**
• Projectors: Available in most classrooms
• Computers: ${ROOMS.filter(r => r.equipment?.includes('computers')).length} rooms
• Lab Equipment: ${ROOMS.filter(r => r.equipment?.some(e => e.includes('lab'))).length} specialized labs
• Smart Boards: ${ROOMS.filter(r => r.equipment?.includes('smartboard')).length} rooms

🏢 **By Building:**
${buildings.map(building => `• ${building.name}: Specialized for ${building.id === 'S' ? 'Science/Labs' : building.id === 'M' ? 'Engineering' : building.id === 'F' ? 'Arts/Music' : 'General Education'}`).join('\n')}`;
    }

    if (prompt.includes('schedule') || prompt.includes('time') || prompt.includes('plan')) {
      const largeRooms = ROOMS.filter(room => room.capacity && room.capacity > 50).slice(0, 5);
      const smallRooms = ROOMS.filter(room => room.capacity && room.capacity <= 25).slice(0, 5);
      
      return `Based on our ${totalRooms} rooms across ${buildings.length} buildings, here are scheduling recommendations:

⏰ **Optimal Time Slots for Our Facilities:**
• **8:00-11:00 AM**: Best for large lectures in ${buildings.find(b => b.totalRooms === Math.max(...buildings.map(b => b.totalRooms)))?.name}
• **1:00-4:00 PM**: Labs in ${buildings.find(b => b.id === 'S')?.name} (Science Building)
• **Avoid 12:00-1:00 PM**: Peak lunch time

📊 **Room Capacity Planning:**
**Large Classes (50+ students):**
${largeRooms.map(room => `• ${room.name} - ${room.location} (${room.capacity} capacity)`).join('\n')}

**Small Groups (≤25 students):**
${smallRooms.map(room => `• ${room.name} - ${room.location} (${room.capacity} capacity)`).join('\n')}

🏢 **Building Utilization:**
${buildings.map(building => `• ${building.name}: ${building.floors} floors, ${building.totalRooms} rooms available`).join('\n')}`;
    }

    if (prompt.includes('building') || prompt.includes('location') || prompt.includes('where')) {
      return `Here's our complete building overview with actual data:

🏢 **Available Buildings:**
${buildings.map(building => 
`• **${building.name}**
  - Total Rooms: ${building.totalRooms}
  - Floors: ${building.floors}
  - Specialization: ${building.id === 'S' ? 'Science & Laboratory' : building.id === 'M' ? 'Engineering & Main Academics' : building.id === 'F' ? 'Arts, Music & CHTM' : building.id === 'G' ? 'Physical Education' : building.id === 'U' ? 'Business & General Studies' : 'Education & Admin'}`
).join('\n\n')}

📍 **Room Distribution:**
• Total Rooms: ${totalRooms}
• Largest Building: ${buildings.reduce((max, b) => b.totalRooms > max.totalRooms ? b : max).name} (${Math.max(...buildings.map(b => b.totalRooms))} rooms)
• Most Floors: ${buildings.reduce((max, b) => b.floors > max.floors ? b : max).name} (${Math.max(...buildings.map(b => b.floors))} floors)

🎯 **Recommendations:**
• Science courses → ${buildings.find(b => b.id === 'S')?.name}
• Engineering → ${buildings.find(b => b.id === 'M')?.name}  
• Arts/Music → ${buildings.find(b => b.id === 'F')?.name}
• General courses → ${buildings.find(b => b.id === 'U')?.name}`;
    }

    return `Here's what I can help you with using our actual university data:

🏫 **Our University Overview:**
• Total Buildings: ${buildings.length}
• Total Rooms: ${totalRooms}
• Room Types: ${[...new Set(ROOMS.map(r => r.type).filter(Boolean))].join(', ')}

📋 **Available Services:**
• Room recommendations from our ${totalRooms}-room database
• Building-specific guidance across ${buildings.length} buildings
• Equipment and capacity planning based on actual inventory
• Scheduling optimization using real availability data

🎯 **Sample Questions You Can Ask:**
• "What are the best rooms for computer science courses?"
• "Which building should I use for a 50-student lecture?"
• "What equipment is available in the Science Building?"
• "How should I schedule labs in the Main Building?"

Feel free to ask specific questions about any of our buildings or room requirements!`;
  }
}

export const roomPredictionService = new RoomPredictionService();