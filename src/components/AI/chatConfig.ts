import PulseemMascotImage from '../../assets/images/pulseem_mascot.png';
import MascotPointingImage from '../../assets/images/mascot_pointing.png';
import SupportMascotImage from '../../assets/images/support_mascot.png';

export interface AIChatConfig {
  featureId: number;
  apiAddMessage: string;
  apiLoadSession: string;
  apiNewSession: string;
  maxChars: number;
  headerTitleKey: string;
  bubbleTextKey: string;
  presetQuestionKeys: string[];
  mascotButtonImage: string;
  mascotWidgetImage: string;
  reduxSliceName: string;
  localStorageKey: string;
}

export const advisorConfig: AIChatConfig = {
  featureId: 69,
  apiAddMessage: 'PulsyAI/AddMessage',
  apiLoadSession: 'PulsyAI/LoadSessionMessages',
  apiNewSession: 'PulsyAI/NewSession',
  maxChars: 500,
  headerTitleKey: 'common.aiAdvisorHeader',
  bubbleTextKey: 'common.polyAgentIconTitleMarquee',
  presetQuestionKeys: [
    'common.presetQuestion1',
    'common.presetQuestion2',
    'common.presetQuestion3',
    'common.presetQuestion4',
  ],
  mascotButtonImage: PulseemMascotImage,
  mascotWidgetImage: MascotPointingImage,
  reduxSliceName: 'aiChat',
  localStorageKey: 'hideAIChatDialog',
};

export const supportConfig: AIChatConfig = {
  featureId: 73,
  apiAddMessage: 'PulsyAISupport/AddMessage',
  apiLoadSession: 'PulsyAISupport/LoadSessionMessages',
  apiNewSession: 'PulsyAISupport/NewConversation',
  maxChars: 2000,
  headerTitleKey: 'common.supportHeader',
  bubbleTextKey: 'common.supportBubbleText',
  presetQuestionKeys: [
    'common.supportPreset1',
    'common.supportPreset2',
    'common.supportPreset3',
    'common.supportPreset4',
  ],
  mascotButtonImage: SupportMascotImage,
  mascotWidgetImage: SupportMascotImage,
  reduxSliceName: 'supportChat',
  localStorageKey: 'hideSupportChatDialog',
};
