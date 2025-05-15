export interface AnthropicUserRequest {
  campaignId: any;
  maxToken?: number | null;
  messageRequest: string;
  file?: AnthropicFileItem | null;
}

export interface AnthropicFileItem {
  fileType?: string | null;
  name?: string | null;
  fileUrl: string;
  text: string;
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