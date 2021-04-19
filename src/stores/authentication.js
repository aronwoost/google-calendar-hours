// import { createSlice } from '@reduxjs/toolkit';

const initialState = null;

// export const authentication = createSlice({
//   name: 'authentication',
//   initialState: null,
//   reducers: {},
// });

export const selectAccessToken = (state) => state.authentication.accessToken;
export const selectHasToken = (state) => !!selectAccessToken(state);

// export default authentication.reducer;

const states = {};

export default (state = initialState, { type, ...data } = {}) =>
  states[type] ? states[type](state, data) : state;
