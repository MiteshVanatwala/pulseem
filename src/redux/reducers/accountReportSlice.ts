import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

/**
 * ─── API CONTRACT FOR BACKEND TEAM ─────────────────────────────────────
 *
 * Endpoint: POST reports/AccountReport
 *
 * Request Body:
 * {
 *   "From": "2025-05-01T00:00:00Z",   // optional, ISO date
 *   "To": "2026-04-23T23:59:59Z"      // optional, ISO date
 * }
 *
 * Expected Response:
 * {
 *   "emailsSent": [
 *     {
 *       "subAccountName": "Main Account",
 *       "emailsSent": 610,
 *       "opens": 72,
 *       "opensPercent": 11.80,
 *       "clicks": 61,
 *       "clicksPercent": 10.00,
 *       "bounced": 74,
 *       "bouncedPercent": 12.13,
 *       "color": "#A8D8EA"
 *     }
 *   ],
 *   "monthlySent": [
 *     { "month": "5/2025", "amount": 24, "color": "#8BC34A" },
 *     { "month": "6/2025", "amount": 44, "color": "#4CAF50" }
 *   ],
 *   "recipientsByDate": [
 *     { "month": "5/2025", "amount": 1, "color": "#CDDC39" },
 *     { "month": "6/2025", "amount": 158, "color": "#8BC34A" }
 *   ]
 * }
 *
 * Legacy Mapping:
 * - "emailsSent"       → replaces graphs.ashx?action=emailmonthlyreport
 * - "monthlySent"      → replaces graphs.ashx?action=customermonthlyreport (sent)
 * - "recipientsByDate" → replaces graphs.ashx?action=customermonthlyreport (recipients)
 *
 * Notes:
 * - month format: "M/YYYY" (e.g. "5/2025", "12/2025")
 * - colors can be assigned server-side or the frontend will use defaults
 * - emailsSent array has one entry per sub-account
 * ────────────────────────────────────────────────────────────────────────
 */

export const getAccountReport = createAsyncThunk(
	'reports/AccountReport',
	async (query, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`reports/AccountReport`, query);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: (error as Error).message });
		}
	}
);

export const accountReportSlice = createSlice({
	name: 'accountReport',
	initialState: {
		accountReportData: null,
		accountReportError: '',
	},
	reducers: {},
	extraReducers: builder => {
		builder.addCase(getAccountReport.fulfilled, (state, { payload }) => {
			state.accountReportData = payload;
		});
		builder.addCase(getAccountReport.rejected, (state, action) => {
			state.accountReportError = action.error.message ?? '';
			// Keep accountReportData as null so component falls back to mock data
		});
	},
});

export default accountReportSlice.reducer;
