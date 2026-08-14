import { PulseemReactInstance } from './PulseemReactAPI';
import { WidgetConfig } from '../../screens/Widgets/types';

interface PulseemResponse<T> {
    StatusCode: number;
    Message: string;
    Data: T;
}

// WidgetController returns `JsonConvert.SerializeObject(response)` as a string method,
// so the HTTP body is a double-encoded JSON string and axios hands `response.data`
// back as raw text (unlike other endpoints that return objects). Parse it back into
// the envelope. Defensive: if the backend is ever fixed to return an object, this
// passes it through unchanged.
const unwrap = <T = any>(data: any): PulseemResponse<T> =>
    typeof data === 'string' ? JSON.parse(data) : data;

interface WidgetSaveResult {
    widgetId: string;
    status: 'draft' | 'active' | 'paused';
}

/** Thrown when a save is blocked by plan-gating (StatusCode 927); Message is the FeatureTierCode name. */
export class TierBlockedError extends Error {
    featureCode: string;
    constructor(featureCode: string) {
        super(`Feature not available for current plan: ${featureCode}`);
        this.featureCode = featureCode;
    }
}

export interface WidgetSummary {
    widgetId: string;
    name: string;
    domain: string | null;
    websiteUrl: string;
    status: 'draft' | 'active' | 'paused';
    createdDate: string;
}

/**
 * Returns null when no widget record exists yet for this account/widgetId.
 * Pass widgetId to target a specific widget (by its public WidgetGUID), or
 * domain to target/create-on-first-save the widget for that domain; omit both
 * to resolve to the account's legacy/first widget (single-widget accounts,
 * unchanged behavior).
 */
export const getWidget = async (widgetId?: string, domain?: string): Promise<WidgetConfig & { widgetId?: string; status?: string } | null> => {
    const response = await PulseemReactInstance.get<PulseemResponse<any>>('Widget/GetWidget', { params: { widgetId, domain } });
    const env = unwrap(response.data);
    // A 200 envelope with Data = null legitimately means "no widget yet" — only a
    // non-200 envelope (e.g. 401 Invalid SubAccountId) is a real failure to surface,
    // otherwise it would be silently indistinguishable from "no widget yet".
    if (env.StatusCode !== 200) {
        throw new Error(env.Message || 'Failed to load widget');
    }
    return env.Data;
}

export const saveWidget = async (config: WidgetConfig, widgetId?: string, domain?: string): Promise<WidgetSaveResult> => {
    const response = await PulseemReactInstance.post<PulseemResponse<WidgetSaveResult>>('Widget/SaveWidget', config, { params: { widgetId, domain } });
    const env = unwrap<WidgetSaveResult>(response.data);
    // WidgetController always answers with HTTP 200 — the real outcome is the
    // envelope's own StatusCode, so a non-2xx envelope must throw here instead
    // of resolving with an undefined Data that would crash the caller.
    if (env.StatusCode === 927) {
        throw new TierBlockedError(env.Message);
    }
    if (!env.Data) {
        throw new Error(env.Message || 'Failed to save widget');
    }
    return env.Data;
}

export const setWidgetStatus = async (status: 'active' | 'paused' | 'draft', widgetId?: string, domain?: string): Promise<{ status: string }> => {
    const response = await PulseemReactInstance.post<PulseemResponse<{ status: string }>>('Widget/SetStatus', { status }, { params: { widgetId, domain } });
    const env = unwrap<{ status: string }>(response.data);
    if (!env.Data) {
        throw new Error(env.Message || 'Failed to update widget status');
    }
    return env.Data;
}

export const getAllWidgets = async (): Promise<WidgetSummary[]> => {
    const response = await PulseemReactInstance.get<PulseemResponse<WidgetSummary[]>>('Widget/GetAllWidgets');
    const env = unwrap<WidgetSummary[]>(response.data);
    if (env.StatusCode !== 200) {
        throw new Error(env.Message || 'Failed to load widgets');
    }
    return env.Data || [];
}
