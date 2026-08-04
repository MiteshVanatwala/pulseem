export interface IdentificationField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea';
  required: boolean;
}

export interface DailySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface WeeklySchedule {
  monday: DailySchedule;
  tuesday: DailySchedule;
  wednesday: DailySchedule;
  thursday: DailySchedule;
  friday: DailySchedule;
  saturday: DailySchedule;
  sunday: DailySchedule;
}

export interface WidgetConfig {
  // Appearance
  name: string;
  websiteUrl: string;
  position: 'bottom-right' | 'bottom-left';
  primaryColor: string;
  greetingMessage: string;
  showBranding: boolean;

  // Behavior
  autoOpen: boolean;
  autoOpenDelay: number;
  enableAi: boolean;
  enableOfficeHours: boolean;
  timezone: string;
  emailRouting: string;
  awayMessage: string;
  weeklySchedule: WeeklySchedule;
  
  // Identification
  enableIdentification: boolean;
  identificationFields: IdentificationField[];

  // Feedback
  enableFeedback: boolean;
  feedbackTiming: 'conversation_ends' | 'after_delay';
  feedbackDelaySeconds: number;
  enableStarRating: boolean;
  enableFreeText: boolean;
  enablePredefinedTags: boolean;
  predefinedTags: string[];
  feedbackRouting: string; // Simplification for agents/teams
  
  // Marketing
  enableMarketing: boolean;
  marketingTiming: 'immediately' | 'after_first_response' | 'end_of_conversation';
  marketingRequestPhone: boolean;
}

export const initialWidgetConfig: WidgetConfig = {
  name: '',
  websiteUrl: '',
  position: 'bottom-right',
  primaryColor: '#007bff',
  greetingMessage: '',
  showBranding: true,
  autoOpen: false,
  autoOpenDelay: 5,
  enableAi: false,
  enableOfficeHours: false,
  timezone: 'UTC',
  emailRouting: '',
  awayMessage: 'We are currently offline. Please leave a message...',
  weeklySchedule: {
    monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    sunday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  },
  enableIdentification: false,
  identificationFields: [],
  enableFeedback: false,
  feedbackTiming: 'conversation_ends',
  feedbackDelaySeconds: 10,
  enableStarRating: true,
  enableFreeText: true,
  enablePredefinedTags: false,
  predefinedTags: ['Helpful', 'Fast', 'Unfriendly'],
  feedbackRouting: 'all_agents',
  enableMarketing: false,
  marketingTiming: 'end_of_conversation',
  marketingRequestPhone: false,
};
