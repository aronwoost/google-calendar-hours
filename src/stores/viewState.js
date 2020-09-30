import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { get } from 'lodash';

import { loadCalendarEvents, selectCalendarEvents } from './calendar';
import { getConfig, updateConfig } from './storage';

export const getInitialState = () => ({
  selectedCalendarId: null,
  rangeType: get(getConfig(), 'lastSelectedRangeType', 'total'),
  currentDatePointerStart: dayjs().startOf('day').toJSON(),
});

export const viewState = createSlice({
  name: 'viewState',
  initialState: getInitialState(),
  reducers: {
    setSelectedCalendarId: (state, { payload }) => {
      state.selectedCalendarId = payload;
    },
    setRangeType: (state, { payload }) => {
      state.rangeType = payload;
    },
    changeRange: (state, { payload }) => {
      if (payload === 'prev') {
        state.currentDatePointerStart = dayjs(state.currentDatePointerStart)
          .subtract(1, state.rangeType)
          .toJSON();
      } else if (payload === 'next') {
        state.currentDatePointerStart = dayjs(state.currentDatePointerStart)
          .add(1, state.rangeType)
          .toJSON();
      }
    },
    resetRange: (state) => {
      state.currentDatePointerStart = dayjs().startOf('day').toJSON();
    },
  },
});

// TODO don't export all
export const {
  setSelectedCalendarId,
  setRangeType,
  changeRange,
  resetRange,
} = viewState.actions;

export const selectSelectedCalendar = (state) =>
  state.viewState.selectedCalendarId;

export const selectDate = (state) => state.viewState.currentDatePointerStart;

export const selectRangeType = (state) => state.viewState.rangeType;

export const selectHours = (state) => {
  const events = selectCalendarEvents(state, selectSelectedCalendar(state));

  if (!events) {
    return null;
  }

  const { rangeType, currentDatePointerStart } = state.viewState;
  const currentDatePointerStartDate = dayjs(currentDatePointerStart);

  let rangeStart;
  let rangeEnd;

  if (rangeType === 'total') {
    rangeStart = dayjs('2000-01-01T10:00:00Z');
    rangeEnd = dayjs('2040-01-01T10:00:00Z');
  } else if (rangeType === 'week') {
    rangeStart = currentDatePointerStartDate.startOf('day').day(0);
    rangeEnd = rangeStart.add(1, 'week');
  } else if (rangeType === 'day') {
    rangeStart = currentDatePointerStartDate.startOf('day');
    rangeEnd = rangeStart.add(1, 'day');
  } else if (rangeType === 'month') {
    rangeStart = currentDatePointerStartDate.startOf('month');
    rangeEnd = rangeStart.add(1, 'month');
  } else if (rangeType === 'year') {
    rangeStart = currentDatePointerStartDate.startOf('year');
    rangeEnd = rangeStart.add(1, 'year');
  }

  let hours = 0;

  events.forEach((event) => {
    const itemDateStart = new Date(event.start.dateTime);
    const itemDateEnd = new Date(event.end.dateTime);

    if (itemDateStart > rangeStart && itemDateEnd < rangeEnd) {
      hours += (itemDateEnd - itemDateStart) / 1000 / 60 / 60;
    }
  });

  return hours;
};

export const setSelectedCalendar = ({ calendarId }) => async (
  dispatch,
  getState
) => {
  const state = getState();
  const calendarEvents = state.calendar.map[calendarId];
  if (!calendarEvents) {
    await dispatch(loadCalendarEvents({ calendarId }));
  }
  dispatch(setSelectedCalendarId(calendarId));
  updateConfig({ selectedCalendarId: calendarId });
};

export const changeRangeType = ({ range }) => async (dispatch) => {
  dispatch(setRangeType(range));
  updateConfig({ lastSelectedRangeType: range });
};

export default viewState.reducer;
