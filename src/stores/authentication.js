import { createSlice } from '@reduxjs/toolkit';

let accessToken;

try {
  accessToken = localStorage.getItem('accessToken');
} catch (e) {
  // don't handle
}

export const authentication = createSlice({
  name: 'authentication',
  initialState: {
    accessToken,
  },
  reducers: {},
});

export const selectAccessToken = (state) => state.authentication.accessToken;
export const selectHasToken = (state) => !!state.authentication.accessToken;

export default authentication.reducer;
