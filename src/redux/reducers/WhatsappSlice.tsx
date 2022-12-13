import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";
import axios from "axios";

export const getUsersList = createAsyncThunk(
  "whatsapp/UsersList",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(
        "https://jsonplaceholder.typicode.com/users"
      );
      //   return JSON.parse(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
);

type User = {
  id: number;
  name: string;
};

type InitialState = {
  usersList: User[];
};

const initialState: InitialState = {
  usersList: [],
};

const WhatsappSlice = createSlice({
  name: "whatsapp",
  initialState,
  reducers: {
    // fill in primary logic here
  },
  extraReducers: (builder) => {
    builder.addCase(getUsersList.fulfilled, (state, { payload }) => {
      state.usersList = payload;
    });
  },
});

export default WhatsappSlice.reducer;
