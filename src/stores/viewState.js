import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import { loadCalendarEvents, selectCalendarEvents } from './calendarEvents';
import { getConfig, updateConfig } from './storage';
import { RANGE_TYPE } from '../constants';

export const getInitialState = () => ({
  selectedCalendarId: null,
  selectedRangeType: getConfig()?.selectedRangeType || RANGE_TYPE.TOTAL,
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
      state.selectedRangeType = payload;
    },
    changeRange: (state, { payload }) => {
      if (payload === 'prev') {
        state.currentDatePointerStart = dayjs(state.currentDatePointerStart)
          .subtract(1, state.selectedRangeType)
          .toJSON();
      } else if (payload === 'next') {
        state.currentDatePointerStart = dayjs(state.currentDatePointerStart)
          .add(1, state.selectedRangeType)
          .toJSON();
      }
    },
    resetRange: (state) => {
      state.currentDatePointerStart = dayjs().startOf('day').toJSON();
    },
  },
});

export const { changeRange, resetRange } = viewState.actions;
const { setSelectedCalendarId, setRangeType } = viewState.actions;

export const selectSelectedCalendar = (state) =>
  state.viewState.selectedCalendarId;

export const selectDate = (state) => state.viewState.currentDatePointerStart;

export const selectRangeType = (state) => state.viewState.selectedRangeType;

export const selectHours = (state) => {
  const events = selectCalendarEvents(state, selectSelectedCalendar(state));

  if (!events) {
    return null;
  }

  const { selectedRangeType, currentDatePointerStart } = state.viewState;
  const currentDatePointerStartDate = dayjs(currentDatePointerStart);

  let rangeStart;
  let rangeEnd;

  if (selectedRangeType === RANGE_TYPE.DAY) {
    rangeStart = currentDatePointerStartDate.startOf('day');
    rangeEnd = rangeStart.add(1, 'day');
  } else if (selectedRangeType === RANGE_TYPE.WEEK) {
    rangeStart = currentDatePointerStartDate.startOf('day').day(0);
    rangeEnd = rangeStart.add(1, 'week');
  } else if (selectedRangeType === RANGE_TYPE.MONTH) {
    rangeStart = currentDatePointerStartDate.startOf('month');
    rangeEnd = rangeStart.add(1, 'month');
  } else if (selectedRangeType === RANGE_TYPE.YEAR) {
    rangeStart = currentDatePointerStartDate.startOf('year');
    rangeEnd = rangeStart.add(1, 'year');
  } else if (selectedRangeType === RANGE_TYPE.TOTAL) {
    rangeStart = dayjs('2000-01-01T10:00:00Z');
    rangeEnd = dayjs('2040-01-01T10:00:00Z');
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
  const calendarEvents = selectCalendarEvents(state, calendarId);
  if (!calendarEvents) {
    await dispatch(loadCalendarEvents({ calendarId }));
  }
  dispatch(setSelectedCalendarId(calendarId));
  updateConfig({ selectedCalendarId: calendarId });
};

export const changeRangeType = ({ range }) => async (dispatch) => {
  dispatch(setRangeType(range));
  updateConfig({ selectedRangeType: range });
};

export default viewState.reducer;
