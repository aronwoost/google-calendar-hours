import { createSlice } from '@reduxjs/toolkit';

import { selectAccessToken } from './authentication';
import { fetchCalendarEvents } from './api';

export const calendarEvents = createSlice({
  name: 'calendarEvents',
  initialState: {
    loading: false,
    map: {},
  },
  reducers: {
    setCalendarEvents: (state, { payload }) => {
      state.map[payload.calendarId] = payload.events;
    },
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
  },
});

const { setCalendarEvents, setLoading } = calendarEvents.actions;

export const loadCalendarEvents = ({ calendarId }) => async (
  dispatch,
  getState
) => {
  const accessToken = selectAccessToken(getState());
  try {
    dispatch(setLoading(true));
    const items = await fetchCalendarEvents({ accessToken, calendarId });
    dispatch(setLoading(false));
    dispatch(
      setCalendarEvents({
        calendarId,
        // take only fields we need
        events: items.map(({ id, summary, start, end }) => ({
          id,
          summary,
          start,
          end,
        })),
      })
    );
    return Promise.resolve();
  } catch (e) {
    dispatch(setLoading(false));
    return Promise.reject();
  }
};

export const selectCalendarEvents = (state, calendarId) =>
  state.calendarEvents?.map[calendarId] || null;

export const selectIsEventsLoading = (state) => state.calendarEvents?.loading;

export default calendarEvents.reducer;
