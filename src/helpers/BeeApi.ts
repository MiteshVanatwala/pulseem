import axios from 'axios'
const endpoint = "https://auth.getbee.io/apiauth";

const connectPayload = {
  client_id: 'f7768f7b-06af-4ada-bbd3-18a237524c31',
  client_secret: 'GIB9b4iD81YYO3fVJCljRrYQk4VvqNsJCgpXd9WPIXBF2ZbNOCrD',
  grant_type: "password" // Do not change
};

type GetTokenResponse = {
  token: String;
};

// type Campaign = {
//   campaignId: Number,
//   JsonData: JSON.stringify(design),
//   HtmlData: html
// }

// This method should call React API method that return the final token
export const GetBeeToken = async () => {
  try {
    const { data } = await axios.post<GetTokenResponse>(
      endpoint,
      connectPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    console.log(JSON.stringify(data, null, 4));

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('error message: ', error.message);
      return error.message;
    } else {
      console.log('unexpected error: ', error);
      return 'An unexpected error occurred';
    }
  }
}
export const SaveDesign = async (campaign: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post(`/CampaignEditor/SaveCampaign/`, campaign);
      resolve(JSON.parse(response.data));
    } catch (error: any) {
      reject(error.message);
    }
  });
}