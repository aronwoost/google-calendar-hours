import { createSlice } from '@reduxjs/toolkit';
import { get } from 'lodash';

import { selectAccessToken } from './authentication';
import { fetchCalendarEvents } from './api';

export const calendar = createSlice({
  name: 'calendar',
  initialState: {
    map: {},
  },
  reducers: {
    setCalendarEvents: (state, { payload }) => {
      state.map[payload.calendarId] = payload.events;
    },
  },
});

const { setCalendarEvents } = calendar.actions;

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
  get(state, `calendar.map["${calendarId}"]`, null);

export default calendar.reducer;
