# UC Nexus - AI Room Finder

## Overview
This application provides intelligent room scheduling suggestions using AI. Input your class requirements (size, department, schedule) and get personalized room recommendations.

## AI Features
- **Predictive Room Suggestions**: Uses Google's Gemini AI to analyze room availability and suitability
- **Intelligent Scoring**: Considers capacity efficiency, department match, equipment availability
- **Fallback Algorithm**: Works even without internet connection using local algorithms
- **Real-time Analysis**: Provides detailed explanations for each recommendation

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Free AI API Key
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Create a new API key (completely free)
4. Add the key to your `.env` file:

```
EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Run the Application
```bash
npm start
```

## Free AI Options Used

### Primary: Google Gemini API
- **Cost**: Free tier with generous limits
- **Limits**: 15 requests per minute, 1500 requests per day
- **Features**: Advanced reasoning, context awareness
- **Fallback**: Local algorithm when API unavailable

### Alternative Options (Future)
- **Hugging Face Transformers**: Completely free, offline
- **OpenAI API**: $5 free credits for new accounts
- **Local ML Models**: Custom recommendation algorithms

## How It Works

1. **Input Collection**: User provides class size, department, and schedule
2. **Room Filtering**: System filters available rooms based on schedule and capacity
3. **AI Analysis**: Gemini AI analyzes suitability factors:
   - Capacity efficiency (not too oversized)
   - Department building match
   - Equipment availability
   - Room type appropriateness
4. **Scoring**: Each room gets a 0-100 suitability score
5. **Explanations**: AI provides detailed reasoning for recommendations

## Room Data Structure

The app includes mock data for:
- **6 sample rooms** across different buildings
- **12 departments** (Computer Science, Engineering, Business, etc.)
- **Equipment types** (projectors, lab equipment, computers, etc.)
- **Room types** (classroom, laboratory, lecture hall, etc.)

## Features

- 📊 **Smart Scoring**: AI-powered room suitability analysis
- 🏢 **Department Matching**: Prioritizes rooms in relevant buildings
- ⚡ **Real-time Suggestions**: Instant AI-powered recommendations
- 📱 **Mobile Optimized**: Native React Native interface
- 🔄 **Offline Capable**: Works with fallback algorithm
- 🎯 **Detailed Explanations**: Understand why each room was suggested

## Usage Example

1. Enter class size: "25"
2. Select department: "Computer Science"
3. Choose schedule: "Monday 10:00-12:00"
4. Tap "Get AI Suggestions"
5. Review recommended rooms with scores and explanations

## Technical Stack

- **Frontend**: React Native with Expo
- **AI Service**: Google Gemini API
- **Styling**: Native StyleSheet
- **State Management**: React Hooks
- **Data**: TypeScript interfaces with mock data

## File Structure

```
/types/room-types.ts          # TypeScript interfaces
/data/room-data.ts            # Mock room and department data
/services/room-prediction-service.ts  # AI service integration
/app/manage.tsx               # Main UI component
/.env                         # API key configuration
```

## Future Enhancements

- **Real Database Integration**: Connect to actual room booking system
- **Calendar Integration**: Sync with university scheduling systems
- **Machine Learning**: Train custom models on historical booking data
- **Advanced Filters**: Equipment requirements, accessibility features
- **Booking Integration**: Direct room reservation capabilities