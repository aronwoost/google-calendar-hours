import { createSlice } from '@reduxjs/toolkit';

import { selectAccessToken } from './authentication';
import { fetchCalendars } from './api';
import { setSelectedCalendar } from './viewState';
import { getConfig } from './storage';

export const calendars = createSlice({
  name: 'calendars',
  initialState: {
    list: null,
  },
  reducers: {
    setCalendars: (state, { payload }) => {
      state.list = payload;
    },
  },
});

const { setCalendars } = calendars.actions;

export const loadCalendars = () => async (dispatch, getState) => {
  const accessToken = selectAccessToken(getState());
  try {
    const { items } = await fetchCalendars({ accessToken });
    const calendarList = items.map(({ id, summary }) => ({
      id,
      label: summary,
    }));

    dispatch(setCalendars(calendarList));

    const { selectedCalendarId } = getConfig() ?? {};

    if (selectedCalendarId) {
      const calendarExists = calendarList?.find(
        ({ id }) => id === selectedCalendarId
      );

      if (calendarExists) {
        dispatch(setSelectedCalendar({ calendarId: selectedCalendarId }));
      } else {
        // dispatch null, so that it's removed from localStorage config
        dispatch(setSelectedCalendar({ calendarId: null }));
      }
    }
  } catch (e) {
    // return null;
  }
};

export const selectCalendars = (state) => state.calendars.list;

export default calendars.reducer;
