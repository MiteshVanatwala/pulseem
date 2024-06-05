import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const getSmsData = createAsyncThunk(
	'smsCampaign/getAllSmsCampaigns',
	async (_, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`smsCampaign/getAllSmsCampaigns`);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const getSMSVirtualNumber = createAsyncThunk(
	'smsCampaign/GetAccountVirtualNumber', async (number, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`smsCampaign/GetAccountVirtualNumber/${number}`);
			return JSON.parse(response.data)
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	})
export const getTestGroups = createAsyncThunk(
	'smsCampaign/GetTestGroups',
	async (_, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`smsCampaign/GetTestGroups`);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);
export const getPreviousLandingData = createAsyncThunk(
	'smsCampaign/GetLastLandingPages',
	async (_, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`smsCampaign/GetLastLandingPages`);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);
export const getPreviousCampaignData = createAsyncThunk(
	'smsCampaign/GetLastCampaings',
	async (_, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`smsCampaign/GetLastCampaings`);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);
export const getAccountExtraData = createAsyncThunk(
	'smsCampaign/GetAccountExtraData',
	async (_, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`smsCampaign/GetAccountExtraData`);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);
export const getGroupsBySubAccountId = createAsyncThunk(
	'smsCampaign/GetGroupsBySubAccountId',
	async (_, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`smsCampaign/GetGroupsBySubAccountId`);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const getCreditsforSMS = createAsyncThunk(
	'smsCampaign/GetCreditsForSms', async (count, thunkAPI) => {
		return new Promise(async (resolve, reject) => {
			try {
				const response = await PulseemReactInstance.get(`smsCampaign/GetCreditsForSms/${count}`)
				resolve(response?.data)
			} catch (error) {
				thunkAPI.rejectWithValue({ error: error.message })
				reject();
			}
		})

	})

export const getSmsByID = createAsyncThunk(
	'smsCampaign/GetSmsCampaignById',
	async (id, _, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`smsCampaign/GetSmsCampaignById/${id}`);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const getSMSDirectReport = createAsyncThunk(
	'directReport/GetSmsDirectReport',
	async (data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`directReport/GetSmsDirectReport`, data);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const getArchiveSMSDirectReport = createAsyncThunk(
	'directReport/GetArchiveSmsDirect',
	async (data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`directReport/GetArchiveSmsDirect`, data);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const getSMSRequestOTP = createAsyncThunk(
	'RequestOTP',
	async (data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`RequestOTP`, data);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);
export const getSMSConfirmOTP = createAsyncThunk(
	'ConfirmOTP',
	async (data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`ConfirmOTP`, data);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);
export const saveManualClients = createAsyncThunk(
	'smsCampaign/SaveManualClients',
	async (data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`smsCampaign/SaveManualClients`, data);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const exportSMSDirectReport = createAsyncThunk(
	'directReport/ExportSmsDirectReport',
	async (data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`directReport/ExportSmsDirectReport`, data);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const exportArchiveSmsDirect = createAsyncThunk(
	'directReport/ExportArchiveSmsDirect', async (data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`directReport/ExportArchiveSmsDirect`, data);
			return JSON.parse(response.data)
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	})



export const restoreSms = createAsyncThunk(
	'smsCampaign/restoreSmsCampaigns',
	async (deletedsms, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.put(`smsCampaign/restoreSmsCampaigns`, deletedsms);
			return response.data;
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const deleteSms = createAsyncThunk(
	'smsCampaign/DeleteById',
	async (id, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.delete(`smsCampaign/DeleteById/${id}`);
			return response.data;
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const duplicteSms = createAsyncThunk(
	'smsCampaign/cloneSmsCampaign',
	async (cloneSettings, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.put(`smsCampaign/cloneSmsCampaign`, cloneSettings);
			return response.data;
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);
export const smsDelete = createAsyncThunk(
	'smsCampaign/deleteSmsCampaign',
	async (id, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`smsCampaign/deleteSmsCampaign/${id}`);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const getAuthorizeNumbers = createAsyncThunk(
	'getAuthorizeNumbers',
	async (_, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`authorization/getAuthorizeNumbers`, { subID: -1 });
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const sendVerificationCode = createAsyncThunk(
	'authorization/newAuthorizeNumbers', async (data, thunkAPI) => {
		const { number = '' } = data || {};
		return new Promise(async (resolve, reject) => {
			try {
				const response = await PulseemReactInstance.put(`authorization/newAuthorizeNumbers/${number}`);
				resolve(JSON.parse(response.data))
			} catch (error) {
				reject({ error: error.message });
			}
		});
	})

export const verifyCode = createAsyncThunk(
	'authorization/newAuthorizeNumberInsertCode', async (data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.put(`authorization/newAuthorizeNumberInsertCode/${data.phoneNumber}/${data.optinCode}`);
			return JSON.parse(response.data)
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	})

export const getSmsReport = createAsyncThunk(
	'reports/SmsReport',
	async (query, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`reports/SmsReport`, query);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const getSmsGraph = createAsyncThunk(
	'reports/SmsReportGraph',
	async (_, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`reports/SmsReportGraph`);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const getCampaignSumm = createAsyncThunk(
	'smsCampaign/GetCampaignSummary',
	async (id, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`smsCampaign/GetCampaignSummary/${id}`);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const smsSave = createAsyncThunk(
	'smsCampaign/Save',
	async (data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`smsCampaign/Save`, data);

			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);
export const smsSaveGroup = createAsyncThunk(
	'smsCampaign/SaveQuickSendGroups',
	async (data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`smsCampaign/SaveQuickSendGroups`, data);

			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);
export const saveSmsCampSettings = createAsyncThunk(
	'smsCampaign/SaveCampaignSettings', async (data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`smsCampaign/SaveCampaignSettings`, data);
			return JSON.parse(response.data)
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	})
export const smsQuick = createAsyncThunk(
	'smsCampaign/QuickSend',
	async (data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`smsCampaign/QuickSend`, data);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const exportSmsReport = createAsyncThunk(
	'report/ExportSmsReport',
	async (demo = false, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`report/ExportSmsReport/${demo}`);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);
export const getFinishedCampaigns = createAsyncThunk(
	'smsCampaign/GetFinishedSmsCampaigns',
	async (_, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`smsCampaign/GetFinishedSmsCampaigns`);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);
export const getCampaignSettings = createAsyncThunk(
	'smsCampaign/GetCampaignSettings',
	async (campaignId, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`smsCampaign/GetCampaignSettings/${campaignId}`);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const sendSms = createAsyncThunk(
	'smsCampaign/Send',
	async (sendData, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`smsCampaign/Send`, sendData);
			return JSON.parse(response.data);
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const IsOTPPassed = createAsyncThunk(
	'smsCampaign/IsOTPPassed', async (fromNumber, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`smsCampaign/IsOTPPassed/${fromNumber}`);
			return JSON.parse(response.data)
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	});
export const getSmsRepliesById = createAsyncThunk(
	'report/SmsReplies', async (id, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`report/SmsReplies/${id}`);
			return JSON.parse(response.data)
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	});
export const getSmsReplies = createAsyncThunk(
	'SmsReplies/get', async (requestData, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`SmsReplies/get`, requestData);
			response.data.IsExport = requestData.IsExport;
			return response.data
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	});

export const getSmsMarketing = createAsyncThunk(
	'smsCampaign/GetSmsMarketing', async (id, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`smsCampaign/GetSmsMarketing/${id}`);
			return response.data
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	});
export const setSmsMarketing = createAsyncThunk(
	'smsCampaign/SetSmsMarketing', async (payload, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`smsCampaign/SetSmsMarketing`, payload);
			return response.data
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	});

export const deleteSmsTotalMarketing = createAsyncThunk(
	'smsCampaign/DeleteSmsTotalMarketing', async (emailCampaignId, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.delete(`smsCampaign/DeleteSmsTotalMarketing/${emailCampaignId}`);
			return response.data
		} catch (error) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	});



export const smsSlice = createSlice({
	name: 'newsletter',
	initialState: {
		smsData: [],
		smsDeletedData: [],
		smsDataError: '',
		authorizationData: [],
		smsReport: [],
		smsGraph: null,
		previousLandingData: [],
		previousCampaignData: [],
		extraData: [],
		accountId: [],
		subAccountGroups: [],
		getCampaignSum: [],
		finishedCampaigns: [],
		testGroups: [],
		directSmsReport: {},
		// archiveDirectSmsReport: {},
		directSmsReportError: '',
		credits: [],
		smsCampaignSettings: [],
		smsSendResult: -1,
		OTPPassed: null,
		smsReplies: null,
		ToastMessages: {
			SUCCESS: { severity: 'success', color: 'success', message: 'sms.saved', showAnimtionCheck: true },
			QUICK_SEND_SUCCESSS: { severity: 'success', color: 'success', message: 'sms.quickSend', showAnimtionCheck: true },
			SAVE_SETTINGS: { severity: 'success', color: 'success', message: 'sms.settings_saved', showAnimtionCheck: true },
			ERROR: { severity: 'error', color: 'error', message: 'sms.error', showAnimtionCheck: false },
			OTP: { severity: 'success', color: 'success', message: 'sms.otpVerifiedSuccess', showAnimtionCheck: true },
			INVALID_NUMBER: { severity: 'error', color: 'error', message: "sms.invalidNumber", showAnimtionCheck: false },
			QUICK_SEND_ERROR: { severity: 'error', color: 'error', message: "sms.errorQuickSend", showAnimtionCheck: false },
			SENT_ALREADY: { severity: 'success', color: 'success', message: "sms.alreadySent", showAnimtionCheck: false },
			PROVISION: { severity: 'error', color: 'error', message: "sms.recipientBlocked", showAnimtionCheck: false },
			NO_CREDITS: { severity: 'error', color: 'error', message: "sms.noCredits", showAnimtionCheck: false },
			GROUP_CREATED_SUCCESS: { severity: 'success', color: 'success', message: "sms.groupSaved", showAnimtionCheck: true },
			INVALID_RECIPIENTS: { severity: 'error', color: 'error', message: "sms.noRecipientToUpdate", showAnimtionCheck: false },
			NO_GROUPS: { severity: 'error', color: 'error', message: 'smsReport.NoGroups', showAnimtionCheck: false },
			DATE_PASS: { severity: 'error', color: 'error', message: 'smsReport.pastDateSelected', showAnimtionCheck: false },
			INVALID_URL: { severity: 'error', color: 'error', message: 'common.invalidURL', showAnimtionCheck: false }
		}
	},
	reducers: {},
	extraReducers: builder => {
		builder.addCase(IsOTPPassed.fulfilled, (state, { payload }) => {
			state.OTPPassed = payload;
		})
		builder.addCase(sendSms.fulfilled, (state, { payload }) => {
			state.smsSendResult = payload;
		})
		builder.addCase(getSmsData.fulfilled, (state, { payload }) => {
			state.smsData = payload.filter(row => !row.IsDeleted)
			state.smsDeletedData = payload.filter(row => row.IsDeleted)
		})
		builder.addCase(getSmsData.rejected, (state, action) => {
			state.smsDataError = action.error.message
		})
		builder.addCase(getCampaignSumm.fulfilled, (state, { payload }) => {
			state.getCampaignSum = payload
		})

		builder.addCase(getSmsReport.fulfilled, (state, { payload }) => {
			state.smsReport = payload
		})
		builder.addCase(getSmsGraph.fulfilled, (state, { payload }) => {
			state.smsGraph = payload
		})
		builder.addCase(getSMSDirectReport.fulfilled, (state, { payload }) => {
			state.directSmsReport = payload
		})
		builder.addCase(getArchiveSMSDirectReport.fulfilled, (state, { payload }) => {
			state.directSmsReport = payload
			//state.archiveDirectSmsReport = payload
		})
		builder.addCase(getPreviousLandingData.fulfilled, (state, { payload }) => {
			state.previousLandingData = payload
		})
		builder.addCase(getTestGroups.fulfilled, (state, { payload }) => {
			state.testGroups = payload;
			state.testGroups.length && state.testGroups.forEach((c) => c.IsTestGroup = true);
		})
		builder.addCase(getFinishedCampaigns.fulfilled, (state, { payload }) => {
			state.finishedCampaigns = payload
		})

		builder.addCase(getPreviousCampaignData.fulfilled, (state, { payload }) => {
			state.previousCampaignData = payload;
		});
		builder.addCase(getAccountExtraData.fulfilled, (state, { payload }) => {
			state.extraData = payload;
		});
		builder.addCase(getCampaignSettings.fulfilled, (state, { payload }) => {
			state.smsCampaignSettings = payload;
		});
		builder.addCase(getGroupsBySubAccountId.fulfilled, (state, { payload }) => {
			let tempArr = [];
			for (let i = 0; i < payload.length; i++) {
				tempArr.push({ ...payload[i], selected: false });
			}
			state.accountId = tempArr;
			state.subAccountGroups = tempArr;
		});
		builder.addCase(getSMSDirectReport.rejected, (state, action) => {
			state.directSmsReportError = action.error;
		});
		builder.addCase(getArchiveSMSDirectReport.rejected, (state, action) => {
			state.directSmsReportError = action.error;
		});
		builder.addCase(getCampaignSettings.rejected, (state, action) => {
			state.smsCampaignSettings = action.error;
		});
		builder.addCase(getSmsReplies.fulfilled, (state, { payload }) => {
			if (!payload.IsExport) {
				state.smsReplies = payload;
			}
		});

		// builder.addCase(duplicteSms.fulfilled, () => console.log('api duplicteSms success'))
		// builder.addCase(deleteSms.fulfilled, () => console.log('api deleteSms success'))
		// builder.addCase(restoreSms.fulfilled, () => console.log('api restoreSms success'))
		// builder.addCase(getCreditsforSMS.fulfilled, () => console.log('api getCreditsforSMS success'))

		builder.addCase(duplicteSms.rejected, (_, action) =>
			console.log('Error - api duplicteSms: ' + action.error)
		);
		builder.addCase(deleteSms.rejected, (_, action) =>
			console.log('Error - api deleteSms: ' + action.error)
		);
		builder.addCase(restoreSms.rejected, (_, action) =>
			console.log('Error - api restoreSms: ' + action.error)
		);
		builder.addCase(getCreditsforSMS.rejected, (_, action) =>
			console.log('Error - api getCreditsforSMS: ' + action.error)
		);
		builder.addCase(sendSms.rejected, (_, action) =>
			console.log('error - api send sms' + action.error)
		);
	},
});

export default smsSlice.reducer;
