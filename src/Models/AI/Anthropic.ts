import { BeeTemplate } from "../Campaigns/BeeTemplate";

export interface AITemplateCreatorProps {
  classes: any,
  campaignId: any;
  onUpdate: (status: string, templateData?: any) => void;
  onRestore: (templateData?: any) => void;
}

export interface AnthropicUserRequest {
  campaignId: any;
  maxToken?: number | null;
  messageRequest: string;
  file?: AnthropicFileItem | null | undefined;
  continuationId?: string | null;
  templateRef?: BeeTemplate | any | null;
  useLatestElements: boolean | any | null;
}

export interface AnthropicDetailedLog extends AnthropicHistoryLog {
  Response?: string | null;
}

export interface AnthropicFileItem {
  fileType?: string | null;
  name?: string | null;
  fileUrl: string | null | any;
  text: any | null;
}

export interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  max_tokens: number;
}

export interface AnthropicMessage {
  role: string;
  content: string;
}

export interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  model: string;
  content: AnthropicResponseContent[];
  stop_reason: string;
  stop_sequence: string;
  usage: AnthropicResponseUsage;
}

export interface AnthropicResponseContent {
  type: string;
  text: string;
}

export interface AnthropicResponseUsage {
  input_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  output_tokens: number;
}

export interface AnthropicHistoryLog {
  AnthropicRequestId?: string | null;
  MessageRequest?: string | null;
  RequestDate?: string | null;
  TotalPrice?: number | null;
  InputTokens?: number | null;
  OutputTokens?: number | null;
}

export interface ImageUrlLink {
  ImageUrl: string;
}