import { createSlice } from '@reduxjs/toolkit';

import { selectAccessToken } from './authentication';
import { fetchCalendars } from './api';
import { getConfig } from './storage';
import { setSelectedCalendar } from './viewState';

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
    const data = await fetchCalendars({ accessToken });
    dispatch(
      setCalendars(
        data.items.map(({ id, summary }) => ({ id, label: summary }))
      )
    );
    const config = getConfig();
    const selectedCalendarId = config?.selectedCalendarId;

    if (selectedCalendarId) {
      dispatch(setSelectedCalendar({ calendarId: selectedCalendarId }));
    }
  } catch (e) {
    // return null;
  }
};

export const selectCalendars = (state) => state.calendars.list;

export default calendars.reducer;
