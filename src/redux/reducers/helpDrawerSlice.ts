import { createSlice } from '@reduxjs/toolkit';

interface HelpDrawerState {
  isOpen: boolean;
}

const initialState: HelpDrawerState = {
  isOpen: false,
};

const helpDrawerSlice = createSlice({
  name: 'helpDrawer',
  initialState,
  reducers: {
    toggleHelpDrawer: (state) => {
      state.isOpen = !state.isOpen;
    },
    openHelpDrawer: (state) => {
      state.isOpen = true;
    },
    closeHelpDrawer: (state) => {
      state.isOpen = false;
    },
  },
});

export const { toggleHelpDrawer, openHelpDrawer, closeHelpDrawer } = helpDrawerSlice.actions;
export default helpDrawerSlice.reducer;
