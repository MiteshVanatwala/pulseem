import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { GetLinksClicksReportPayload, LinkClickItem, LinksClicksReportState } from '../../Models/Reports/LinksClicksReport';

export const getLinksClicksReport = createAsyncThunk(
  'linksClicksReport/getReport',
  async ({
    CampaignID,
    IsParent,
    IsVerified,
    type
  }: GetLinksClicksReportPayload, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`Report/GetLinksClicksReport?CampaignID=${CampaignID}&IsParent=${IsParent}&IsVerified=${IsVerified}&type=${type}`);
      // return response.data;
      
      // Initialize with the sample data as requested
      const mockData: LinkClickItem[] = [
        {
          LinkID: 1001,
          Url: "https://google.com",
          CampaignID: 1392612,
          ClickCount: 1,
          ClickUniq: 1,
          ClickVerified: 1
        },
        {
          LinkID: 1002,
          Url: "https://fb.com",
          ClickCount: 1,
          ClickUniq: 1,
          ClickVerified: 1,
          CampaignID: 1392613
        },
        {
          LinkID: 1003,
          Url: "https://google.com",
          CampaignID: 1392763,
          ClickCount: 1,
          ClickUniq: 1,
          ClickVerified: 1
        },
        {
          LinkID: 1004,
          Url: "https://fb.com",
          CampaignID: 1392763,
          ClickCount: 1,
          ClickUniq: 1,
          ClickVerified: 1
        }
      ];
      
      // Filter by CampaignID if provided
      const filteredData = mockData.filter(item => 
        item.CampaignID === CampaignID
      );
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return filteredData;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

// Export individual link clicks data
export const exportLinkClicksData = createAsyncThunk(
  'linksClicksReport/exportLinkClicksData',
  async (payload: { linkId: number; campaignId: number, Culture: string, type: string }, thunkAPI) => {
    try {
      // API call to get export data for specific link
      // const response = await PulseemReactInstance.get(
      //   `linksClicksReport/ExportLinkClicksData?linkId=${payload.linkId}&campaignId=${payload.campaignId}&Culture=${payload.Culture}&type=${payload.type}`
      // );
      
      // For development, return mock data
      const mockResponse = {
        header: {
          status: "Status",
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email",
          telephone: "Telephone",
          cellphone: "Cellphone",
          address: "Address",
          birthdayDate: "Birthday Date",
          city: "City",
          state: "State",
          country: "Country",
          zip: "Zip",
          company: "Company",
          reminderDate: "Reminder Date",
          lastClickDate: "Last Click Date",
          clicksCount: "Clicks Count",
          clickCountry: "Click Country",
          clickCountryLocation: "Click Country Location",
          extraField1: "Extra Field 1",
          extraField2: "Extra Field 2",
          extraField3: "Extra Field 3",
          extraField4: "Extra Field 4",
          extraField5: "Extra Field 5",
          extraField6: "Extra Field 6",
          extraField7: "Extra Field 7",
          extraField8: "Extra Field 8",
          extraField9: "Extra Field 9",
          extraField10: "Extra Field 10",
          extraField11: "Extra Field 11",
          extraField12: "Extra Field 12",
          extraField13: "Extra Field 13",
          extraDate1: "Extra Date 1",
          extraDate2: "Extra Date 2",
          extraDate3: "Extra Date 3",
          extraDate4: "Extra Date 4"
        },
        value: [
          {
            status: "Clicked",
            firstName: "Madison",
            lastName: "Martinez",
            email: "amandaberry@frazier.org",
            telephone: "001-162-167-6831",
            cellphone: "376-750-6574x1493",
            address: "34094 Jeffrey Landing, Yoderberg, OH 86119",
            birthdayDate: "1965-08-14",
            city: "Michaelland",
            state: "South Carolina",
            country: "Lesotho",
            zip: "02720",
            company: "Berry-Rivera",
            reminderDate: "2025-09-15",
            lastClickDate: "2025-01-31",
            clicksCount: "81",
            clickCountry: "Kiribati",
            clickCountryLocation: "New Nathanmouth",
            extraField1: "live",
            extraField2: "industry",
            extraField3: "floor",
            extraField4: "president",
            extraField5: "difficult",
            extraField6: "car",
            extraField7: "few",
            extraField8: "happen",
            extraField9: "again",
            extraField10: "who",
            extraField11: "partner",
            extraField12: "beat",
            extraField13: "near",
            extraDate1: "2025-07-14",
            extraDate2: "2023-08-01",
            extraDate3: "2024-11-11",
            extraDate4: "2023-03-05"
          },
          {
            status: "Clicked",
            firstName: "Jeffrey",
            lastName: "Smith",
            email: "vmclean@hotmail.com",
            telephone: "+1-796-522-4636x984",
            cellphone: "773.637.6630",
            address: "7403 Roth Walk, Mcclureland, AK 41766",
            birthdayDate: "1961-07-11",
            city: "West Matthewfurt",
            state: "Connecticut",
            country: "Tonga",
            zip: "30651",
            company: "Park, Hayes and Ward",
            reminderDate: "2025-08-24",
            lastClickDate: "2025-06-26",
            clicksCount: "70",
            clickCountry: "Croatia",
            clickCountryLocation: "Port Alberto",
            extraField1: "clearly",
            extraField2: "your",
            extraField3: "top",
            extraField4: "apply",
            extraField5: "wait",
            extraField6: "trip",
            extraField7: "firm",
            extraField8: "manager",
            extraField9: "economic",
            extraField10: "only",
            extraField11: "me",
            extraField12: "day",
            extraField13: "term",
            extraDate1: "2022-02-10",
            extraDate2: "2024-01-20",
            extraDate3: "2025-07-04",
            extraDate4: "2021-06-07"
          }
        ]
      };
      
      // In production, return response.data
      // return response.data;
      
      // For development, return mock data
      return mockResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

// Export Links Clicks Report with all details
export const exportLinksClicksReport = createAsyncThunk(
  'linksClicksReport/exportLinksClicksReport',
  async (payload: { campaignId: number; isParent: boolean, Culture: string }, thunkAPI) => {
    try {
      // API call to get export data
      // const response = await PulseemReactInstance.get(
      //   `linksClicksReport/ExportLinksClicksReport?campaignId=${payload.campaignId}&isParent=${payload.isParent}&Culture=${payload.Culture}`
      // );
      
      // For development, return mock data
      const mockResponse = {
        header: {
          campaignNumber: 'Campaign Number',
          url: 'Url',
          status: 'Status',
          firstName: 'First Name',
          lastName: 'Last Name',
          email: 'Email',
          telephone: 'Telephone',
          cellphone: 'Cellphone',
          address: 'Address',
          birthdayDate: 'Birthday Date',
          city: 'City',
          state: 'State',
          country: 'Country',
          zip: 'Zip',
          company: 'Company',
          reminderDate: 'Reminder Date',
          clickCountry: 'Click Country',
          clickCountryLocation: 'Click Country Location',
          clicksCount: 'Clicks Count',
          extdate1: 'extdate1',
          extdate2: 'extdate2',
          extraDate3: 'ExtraDate3',
          extraDate4: 'ExtraDate4',
          ext1: 'ext1',
          ext2: 'ext2',
          ext3: 'ext3',
          extraField4: 'ExtraField4',
          extraField5: 'ExtraField5',
          extraField6: 'ExtraField6',
          extraField7: 'ExtraField7',
          extraField8: 'ExtraField8',
          extraField9: 'ExtraField9',
          extraField10: 'ExtraField10',
          extraField11: 'ExtraField11',
          extraField12: 'ExtraField12',
          extraField13: 'ExtraField13'
        },
        value: [
          {
            campaignNumber: '793840',
            url: 'https://monahan.com',
            status: 'Unopened',
            firstName: 'Jessica',
            lastName: 'Fisher',
            email: 'wmccarthy@example.org',
            telephone: '(240) 499-8876x280',
            cellphone: '(757) 810-1760',
            address: '42916 Barry Vista Suite 367, New Roger, WI 55667',
            birthdayDate: '1968-11-14',
            city: 'Andersonfort',
            state: 'Nevada',
            country: 'Lesotho',
            zip: '30457',
            company: 'Fritz and Sons',
            reminderDate: '2025-11-20',
            clickCountry: 'Saudi Arabia',
            clickCountryLocation: 'Valeriefurt',
            clicksCount: '37',
            extdate1: '2022-07-08',
            extdate2: '2020-11-29',
            extraDate3: '2017-05-10',
            extraDate4: '2020-02-17',
            ext1: 'image',
            ext2: 'list',
            ext3: 'blue',
            extraField4: 'check',
            extraField5: 'nice',
            extraField6: 'mouse',
            extraField7: 'house',
            extraField8: 'quick',
            extraField9: 'deep',
            extraField10: 'ball',
            extraField11: 'lake',
            extraField12: 'story',
            extraField13: 'north'
          },
          {
            campaignNumber: '123485',
            url: 'https://lindgren-hintz.com',
            status: 'Clicked',
            firstName: 'Brian',
            lastName: 'Wright',
            email: 'devin26@example.org',
            telephone: '(445) 359-2769x151',
            cellphone: '(903) 300-2957',
            address: '32302 Ferguson Fork, East Karen, PA 62449',
            birthdayDate: '1984-01-30',
            city: 'North Darren',
            state: 'Arizona',
            country: 'Tonga',
            zip: '85275',
            company: 'Donnelly-Flatley',
            reminderDate: '2025-10-12',
            clickCountry: 'Jamaica',
            clickCountryLocation: 'Port Alberto',
            clicksCount: '24',
            extdate1: '2018-09-01',
            extdate2: '2017-02-12',
            extraDate3: '2019-09-28',
            extraDate4: '2016-07-18',
            ext1: 'draw',
            ext2: 'sharp',
            ext3: 'world',
            extraField4: 'wide',
            extraField5: 'ring',
            extraField6: 'gate',
            extraField7: 'write',
            extraField8: 'climb',
            extraField9: 'drink',
            extraField10: 'stone',
            extraField11: 'plain',
            extraField12: 'green',
            extraField13: 'level'
          }
        ]
      };
      
      // In production, return response.data
      // return response.data;
      
      // For development, return mock data
      return mockResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

// Initial state
const initialState: LinksClicksReportState = {
  linksClicksData: [
    {
      "LinkID": 1001,
      "Url": "https://google.com",
      "CampaignID": 1392675,
      "ClickCount": 1,
      "ClickUniq": 1,
      "ClickVerified": 1
    },
    {
      "LinkID": 1002,
      "Url": "https://fb.com",
      "CampaignID": 1392675,
      "ClickCount": 1,
      "ClickUniq": 1,
      "ClickVerified": 1
    },
    {
      "LinkID": 1003,
      "Url": "https://google.com",
      "CampaignID": 1392763,
      "ClickCount": 1,
      "ClickUniq": 1,
      "ClickVerified": 1
    },
    {
      "LinkID": 1004,
      "Url": "https://fb.com",
      "CampaignID": 1392763,
      "ClickCount": 1,
      "ClickUniq": 1,
      "ClickVerified": 1
    }
  ],
  loading: false,
  error: ''
};

// Create slice
export const linksClicksReportSlice = createSlice({
  name: 'linksClicksReport',
  initialState,
  reducers: {
    clearLinksClicksReport: (state) => {
      state.linksClicksData = null;
      state.error = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Links Clicks Report
      .addCase(getLinksClicksReport.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(getLinksClicksReport.fulfilled, (state, action) => {
        state.loading = false;
        state.linksClicksData = action.payload;
      })
      .addCase(getLinksClicksReport.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to load links clicks report';
      })
  }
});

// Export actions
export const { clearLinksClicksReport } = linksClicksReportSlice.actions;

// Export reducer
export default linksClicksReportSlice.reducer;