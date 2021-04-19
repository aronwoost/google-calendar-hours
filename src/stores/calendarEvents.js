// import { createSlice } from '@reduxjs/toolkit';

import { selectAccessToken } from './authentication';
import { fetchCalendarEvents } from './api';

const SET_LOADING = 'SET_LOADING';
const SET_CALENDAR_EVENTS = 'SET_CALENDAR_EVENTS';

const initialState = {
  loading: false,
  map: {},
};

const states = {
  [SET_LOADING]: (state, { payload }) => ({
    ...state,
    loading: payload,
  }),
  [SET_CALENDAR_EVENTS]: (state, { payload }) => ({
    ...state,
    map: { ...state.map, [payload.calendarId]: payload.events },
  }),
};

// export const calendarEvents = createSlice({
//   name: 'calendarEvents',
//   initialState: {
//     loading: false,
//     map: {},
//   },
//   reducers: {
//     setCalendarEvents: (state, { payload }) => {
//       state.map[payload.calendarId] = payload.events;
//     },
//     setLoading: (state, { payload }) => {
//       state.loading = payload;
//     },
//   },
// });

const setLoading = (payload) => ({
  type: SET_LOADING,
  payload,
});

const setCalendarEvents = (payload) => ({
  type: SET_CALENDAR_EVENTS,
  payload,
});

// const { setCalendarEvents, setLoading } = calendarEvents.actions;

export const loadCalendarEvents = ({ calendarId }) => async (
  dispatch,
  getState
) => {
  const accessToken = selectAccessToken(getState());
  try {
    dispatch(setLoading(true));
    const items = await fetchCalendarEvents({ accessToken, calendarId });
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
  } catch (e) {
    // do nothing
  } finally {
    dispatch(setLoading(false));
  }
};

export const selectIsEventsLoading = (state) =>
  state.calendarEvents?.loading ?? false;

export const selectCalendarEvents = (state, calendarId) =>
  (!selectIsEventsLoading(state) && state.calendarEvents?.map[calendarId]) ??
  null;

// export default calendarEvents.reducer;

export default (state = initialState, { type, ...data } = {}) =>
  states[type] ? states[type](state, data) : state;
