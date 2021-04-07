import { createSlice } from '@reduxjs/toolkit';

export const authentication = createSlice({
  name: 'authentication',
  initialState: null,
  reducers: {},
});

export const selectAccessToken = (state) => state.authentication.accessToken;
export const selectHasToken = (state) => !!selectAccessToken(state);

export default authentication.reducer;
