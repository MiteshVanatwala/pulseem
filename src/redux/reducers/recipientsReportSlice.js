import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const getRecipientsReport = createAsyncThunk(
    'dashboard/GetRecipientsReport', async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`dashboard/GetRecipientsReport`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const getRecipientsReportData = createAsyncThunk(
    'RecipientReport/Get',
    async (settings, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`RecipientReport/Get`, settings);
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    }
);

export const recipientsReportSlice = createSlice({
    name: 'recipientReports',
    initialState: {
        recipientsReport: null,
        recipientsReportData: {
            "ClientID": 140184992,
            "ClientStatus": 5,
            "ClientSMSStatus": 0,
            "ClientFirstName": "yuda",
            "ClientLastName": "yuda",
            "ClientEmail": "ido@pulseem.com",
            "ClientCellphone": "0546434444",
            "ClientCreationDate": "2023-06-29T11:08:00",
            "CampaignStatistics": {
                "Sent": 131,
                "Opened": 36,
                "UnOpened": 95,
                "Clicks": 11,
                "ErrorCount": 0
            },
            "SmsCampaignStatistics": {
                "Sent": 7,
                "Opened": 0,
                "UnOpened": 0,
                "Clicks": 0,
                "ErrorCount": 0
            },
            "Campaigns": [
                {
                    "CampaignID": 1137434,
                    "Name": "Law test send_v0",
                    "Status": 1,
                    "SendDate": "2023-04-25T08:39:41.973",
                    "ErrorType": 0,
                    "ErrorData": "",
                    "OpeningCount": 2
                },
                {
                    "CampaignID": 1136358,
                    "Name": "Test refactor-copy-05",
                    "Status": 2,
                    "SendDate": "2023-04-23T10:01:42.37",
                    "ErrorType": 0,
                    "ErrorData": "",
                    "OpeningCount": 0
                },
                {
                    "CampaignID": 1136413,
                    "Name": "Test refactor-copy-12",
                    "Status": 2,
                    "SendDate": "2023-04-23T11:03:59.93",
                    "ErrorType": 0,
                    "ErrorData": "",
                    "OpeningCount": 0
                },
                {
                    "CampaignID": 1136476,
                    "Name": "Test refactor-copy-13",
                    "Status": 2,
                    "SendDate": "2023-04-23T11:06:44.423",
                    "ErrorType": 0,
                    "ErrorData": "",
                    "OpeningCount": 0
                },
                {
                    "CampaignID": 1136501,
                    "Name": "Test refactor-copy-14",
                    "Status": 2,
                    "SendDate": "2023-04-23T11:09:02.77",
                    "ErrorType": 0,
                    "ErrorData": "",
                    "OpeningCount": 0
                }
            ],
            "SmsCampaigns": [
                {
                    "SMSCampaignID": 293445,
                    "Name": "שליחה לפי תאריך שדה נוסף 2",
                    "SmsStatus": 7,
                    "SendDate": "2023-01-18T06:15:00"
                },
                {
                    "SMSCampaignID": 346092,
                    "Name": "בדיקת quick send",
                    "SmsStatus": 3,
                    "SendDate": "2023-02-26T17:25:05.48"
                },
                {
                    "SMSCampaignID": 346092,
                    "Name": "בדיקת quick send",
                    "SmsStatus": 3,
                    "SendDate": "2023-02-26T17:26:41.58"
                },
                {
                    "SMSCampaignID": 346261,
                    "Name": "test",
                    "SmsStatus": 3,
                    "SendDate": "2023-02-27T16:47:33.667"
                },
                {
                    "SMSCampaignID": 353300,
                    "Name": "csheb",
                    "SmsStatus": 3,
                    "SendDate": "2023-05-03T17:40:30.863"
                }
            ],
            "ClientToGroups": [
                {
                    "ClientID": 140184992,
                    "GroupID": 463574,
                    "GroupName": "2 test groups"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 622705,
                    "GroupName": "בדיקה חדשה 1"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 623677,
                    "GroupName": "IDo Test 23123"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 624809,
                    "GroupName": "בדיקה תיקוני אסותא"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 625657,
                    "GroupName": "שדות נוספים בדיקה"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 686610,
                    "GroupName": "testNewIdo"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 686957,
                    "GroupName": "tt3t23t"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 686996,
                    "GroupName": "229494"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 687034,
                    "GroupName": "asyncTask"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 687035,
                    "GroupName": "async 2"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 687110,
                    "GroupName": "test cell 235703"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 687141,
                    "GroupName": "235703_2"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 687148,
                    "GroupName": "73000"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 687161,
                    "GroupName": "10903"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 687170,
                    "GroupName": "10000_1"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 687205,
                    "GroupName": "aa22ee2"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 687686,
                    "GroupName": "csehgrtbdb"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 690980,
                    "GroupName": "Campaign_10330_20230308_104938"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 695648,
                    "GroupName": "asasdasd"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 695703,
                    "GroupName": "Campaign_20230319_030607_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 699659,
                    "GroupName": "PulseemEmployees"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 700804,
                    "GroupName": "Removable Fake emails"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 702022,
                    "GroupName": "640K"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 702023,
                    "GroupName": "416K"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 706242,
                    "GroupName": "CreateGroupByReport_IDO"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 706862,
                    "GroupName": "Test 441234"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 707791,
                    "GroupName": "רק עידו"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 711861,
                    "GroupName": "דודו"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 711967,
                    "GroupName": "yuda1"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 711969,
                    "GroupName": "קבוצת רקיע"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 713636,
                    "GroupName": "test"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 714042,
                    "GroupName": "aqerds"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 714045,
                    "GroupName": "12312312312312"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 714047,
                    "GroupName": "My new group"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 714048,
                    "GroupName": "RedAlert1"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 714049,
                    "GroupName": "redalert2"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 714056,
                    "GroupName": "redalert3"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 714057,
                    "GroupName": "redalert4"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 714059,
                    "GroupName": "redalert5"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 714060,
                    "GroupName": "redalert6"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 714061,
                    "GroupName": "redalert7"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 714067,
                    "GroupName": "Campaign_20230510_031204_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 714070,
                    "GroupName": "Campaign_20230510_032325_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 714079,
                    "GroupName": "Campaign_20230510_035232_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 714080,
                    "GroupName": "Campaign_20230510_035246_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 715441,
                    "GroupName": "Campaign_20230514_023218_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 716791,
                    "GroupName": "1111"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 727485,
                    "GroupName": "Campaign_20230614_054512_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 727486,
                    "GroupName": "Campaign_20230614_054624_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 729360,
                    "GroupName": "Campaign_20230620_055147_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 729361,
                    "GroupName": "Campaign_20230620_055206_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 729362,
                    "GroupName": "Campaign_20230620_055227_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 729363,
                    "GroupName": "Campaign_20230620_055244_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 729364,
                    "GroupName": "Campaign_20230620_055446_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 729365,
                    "GroupName": "Campaign_20230620_055706_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 729366,
                    "GroupName": "Campaign_20230620_055925_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 729367,
                    "GroupName": "Campaign_20230620_060047_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 729368,
                    "GroupName": "Campaign_20230620_060631_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 729528,
                    "GroupName": "Campaign_20230620_115332_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 733949,
                    "GroupName": "Campaign_20230703_125357_10330"
                },
                {
                    "ClientID": 140184992,
                    "GroupID": 734057,
                    "GroupName": "Campaign_20230703_022410_10330"
                }
            ],
            "ReturnMessage": null
        },
        recipientsReportError: ''
    },
    extraReducers: builder => {
        builder
            .addCase(getRecipientsReport.fulfilled, (state, { payload }) => {
                state.recipientsReport = payload
            })
            .addCase(getRecipientsReport.rejected, (state, action) => {
                state.recipientsReportError = action.error.message
            })
            .addCase(getRecipientsReportData.fulfilled, (state, { payload }) => {
                state.recipientsReportData = payload.Data
            })
    }
})


export default recipientsReportSlice.reducer