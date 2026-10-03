import { Caption, Participant } from '../types';

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'user-alice',
    name: 'Alice Cooper',
    role: 'participant',
    deviceType: 'Laptop',
    connectionState: 'connected',
    isMuted: false,
    isSpeaking: true,
    joinedAt: '10:21 AM',
    accentColor: '#0D9488', // Teal
  },
  {
    id: 'user-rahul',
    name: 'Rahul Sharma',
    role: 'participant',
    deviceType: 'Phone',
    connectionState: 'connected',
    isMuted: false,
    isSpeaking: false,
    joinedAt: '10:22 AM',
    accentColor: '#2563EB', // Blue
  },
  {
    id: 'user-priya',
    name: 'Priya Patel',
    role: 'participant',
    deviceType: 'Tablet',
    connectionState: 'connected',
    isMuted: false,
    isSpeaking: false,
    joinedAt: '10:23 AM',
    accentColor: '#D97706', // Amber
  },
];

export const INITIAL_CAPTIONS: Caption[] = [
  {
    id: 'cap-1',
    speakerId: 'user-alice',
    speakerName: 'Alice',
    text: 'We should finalize the architecture today.',
    timestamp: '10:24 AM',
    deviceType: 'Laptop',
    accentColor: '#0D9488',
  },
  {
    id: 'cap-2',
    speakerId: 'user-rahul',
    speakerName: 'Rahul',
    text: "I'll handle the backend integration.",
    timestamp: '10:24 AM',
    deviceType: 'Phone',
    accentColor: '#2563EB',
  },
  {
    id: 'cap-3',
    speakerId: 'user-priya',
    speakerName: 'Priya',
    text: "Let's review the UI before deployment.",
    timestamp: '10:25 AM',
    deviceType: 'Tablet',
    accentColor: '#D97706',
  },
];

export const UPCOMING_MOCK_DIALOGUES: Array<{
  speakerId: string;
  speakerName: string;
  text: string;
  deviceType: 'Laptop' | 'Phone' | 'Tablet';
  accentColor: string;
}> = [
  {
    speakerId: 'user-alice',
    speakerName: 'Alice',
    text: 'Agreed. The multi-device audio sync latency is staying consistently below 14ms across the room.',
    deviceType: 'Laptop',
    accentColor: '#0D9488',
  },
  {
    speakerId: 'user-rahul',
    speakerName: 'Rahul',
    text: 'That gives our speaker diarization model plenty of headroom for clean attribution.',
    deviceType: 'Phone',
    accentColor: '#2563EB',
  },
  {
    speakerId: 'user-priya',
    speakerName: 'Priya',
    text: 'The transcript flow looks crisp. Contrast and typography pass all legibility checks.',
    deviceType: 'Tablet',
    accentColor: '#D97706',
  },
  {
    speakerId: 'user-alice',
    speakerName: 'Alice',
    text: 'Notice how the acoustic array seamlessly prioritizes whichever microphone is closest to the speaker.',
    deviceType: 'Laptop',
    accentColor: '#0D9488',
  },
  {
    speakerId: 'user-rahul',
    speakerName: 'Rahul',
    text: 'No echo cancellation artifacts either. The spatial separation is working as intended.',
    deviceType: 'Phone',
    accentColor: '#2563EB',
  },
  {
    speakerId: 'user-priya',
    speakerName: 'Priya',
    text: 'Once we wrap this sync, the conversation summary will be ready to export.',
    deviceType: 'Tablet',
    accentColor: '#D97706',
  },
];
