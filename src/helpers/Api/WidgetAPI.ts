import { PulseemReactInstance } from './PulseemReactAPI'
import { WidgetConfig } from '../../screens/Widgets/types';

interface PulseemResponse<T> {
    StatusCode: number;
    Message: string;
    Data: T;
}

interface WidgetSaveResult {
    widgetId: string;
    status: 'draft' | 'active' | 'paused';
}

/** Returns null when no widget record exists yet for this account. */
export const getWidget = async (): Promise<WidgetConfig & { widgetId?: string; status?: string } | null> => {
    const response = await PulseemReactInstance.get<PulseemResponse<any>>('Widget/GetWidget');
    return response.data.Data;
}

export const saveWidget = async (config: WidgetConfig): Promise<WidgetSaveResult> => {
    const response = await PulseemReactInstance.post<PulseemResponse<WidgetSaveResult>>('Widget/SaveWidget', config);
    return response.data.Data;
}

export const setWidgetStatus = async (status: 'active' | 'paused' | 'draft'): Promise<{ status: string }> => {
    const response = await PulseemReactInstance.post<PulseemResponse<{ status: string }>>('Widget/SetStatus', { status });
    return response.data.Data;
}
