import { createSlice } from '@reduxjs/toolkit';

import { selectAccessToken } from './authentication';
import { fetchCalendarEvents } from './api';

export const calendarEvents = createSlice({
  name: 'calendarEvents',
  initialState: {
    map: {},
  },
  reducers: {
    setCalendarEvents: (state, { payload }) => {
      state.map[payload.calendarId] = payload.events;
    },
  },
});

const { setCalendarEvents } = calendarEvents.actions;

export const loadCalendarEvents = ({ calendarId }) => async (
  dispatch,
  getState
) => {
  const state = getState();
  const accessToken = selectAccessToken(state);
  try {
    const data = await fetchCalendarEvents({ accessToken, calendarId });
    dispatch(setCalendarEvents({ calendarId, events: data.items }));
    return Promise.resolve();
  } catch (e) {
    return Promise.reject();
  }
};

export const selectCalendarEvents = (state, calendarId) =>
  state.calendarEvents?.map[calendarId] || null;

export default calendarEvents.reducer;
