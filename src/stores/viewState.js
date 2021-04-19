// import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import 'dayjs/locale/de';

import { loadCalendarEvents, selectCalendarEvents } from './calendarEvents';
import { updateConfig } from './storage';
import { RANGE_TYPE, WEEK_START } from '../constants';

const SET_SELECTED_CALENDAR_ID = 'SET_SELECTED_CALENDAR_ID';
const SET_RANGE_TYPE = 'SET_RANGE_TYPE';
const CHANGE_RANGE = 'CHANGE_RANGE';
const RESET_RANGE = 'RESET_RANGE';
const SET_WEEK_START = 'SETSET_WEEK_START';
const SET_START = 'SET_START';
const SET_END = 'SET_END';

const initialState = null;

const states = {
  [SET_SELECTED_CALENDAR_ID]: (state, { payload }) => ({
    ...state,
    selectedCalendarId: payload,
  }),
  [SET_RANGE_TYPE]: (state, { payload }) => ({
    ...state,
    selectedRangeType: payload,
  }),
  [CHANGE_RANGE]: (state, { payload }) => ({
    ...state,
    currentDatePointerStart:
      payload === 'prev'
        ? dayjs(state.currentDatePointerStart)
            .subtract(1, state.selectedRangeType)
            .toJSON()
        : dayjs(state.currentDatePointerStart)
            .add(1, state.selectedRangeType)
            .toJSON(),
  }),
  [RESET_RANGE]: (state) => ({
    ...state,
    currentDatePointerStart: dayjs().startOf('day').toJSON(),
  }),
  [SET_WEEK_START]: (state, { payload }) => ({
    ...state,
    weekStart: payload,
  }),
  [SET_START]: (state, { payload }) => ({
    ...state,
    currentDatePointerStart: payload,
  }),
  [SET_END]: (state, { payload }) => ({
    ...state,
    currentDatePointerEnd: payload,
  }),
};

// export const viewState = createSlice({
//   name: 'viewState',
//   initialState: null,
//   reducers: {
//     setSelectedCalendarId: (state, { payload }) => {
//       state.selectedCalendarId = payload;
//     },
//     setRangeType: (state, { payload }) => {
//       state.selectedRangeType = payload;
//     },
//     changeRange: (state, { payload }) => {
//       if (payload === 'prev') {
//         state.currentDatePointerStart = dayjs(state.currentDatePointerStart)
//           .subtract(1, state.selectedRangeType)
//           .toJSON();
//       } else if (payload === 'next') {
//         state.currentDatePointerStart = dayjs(state.currentDatePointerStart)
//           .add(1, state.selectedRangeType)
//           .toJSON();
//       }
//     },
//     resetRange: (state) => {
//       state.currentDatePointerStart = dayjs().startOf('day').toJSON();
//     },
//     setWeekStart: (state, { payload }) => {
//       state.weekStart = payload;
//     },
//     setStart: (state, { payload }) => {
//       state.currentDatePointerStart = payload;
//     },
//     setEnd: (state, { payload }) => {
//       state.currentDatePointerEnd = payload;
//     },
//   },
// });

// export const { changeRange, resetRange } = viewState.actions;
// const {
//   setSelectedCalendarId,
//   setRangeType,
//   setWeekStart,
//   setStart,
//   setEnd,
// } = viewState.actions;

export const changeRange = (payload) => ({
  type: CHANGE_RANGE,
  payload,
});
export const resetRange = () => ({
  type: RESET_RANGE,
});
const setSelectedCalendarId = (payload) => ({
  type: SET_SELECTED_CALENDAR_ID,
  payload,
});
const setRangeType = (payload) => ({
  type: SET_RANGE_TYPE,
  payload,
});
const setWeekStart = (payload) => ({
  type: SET_WEEK_START,
  payload,
});
const setStart = (payload) => ({
  type: SET_START,
  payload,
});
const setEnd = (payload) => ({
  type: SET_END,
  payload,
});

export const selectSelectedCalendar = (state) =>
  state.viewState.selectedCalendarId;

export const selectDate = (state) => state.viewState.currentDatePointerStart;

export const selectRangeType = (state) => state.viewState.selectedRangeType;
export const selectWeekStart = (state) => state.viewState.weekStart;
export const selectLocaleForWeekStart = (state) =>
  state.viewState.weekStart === WEEK_START.SUNDAY ? 'en' : 'de';

export const selectCurrentDatePointers = (state) => {
  const {
    selectedRangeType,
    currentDatePointerStart,
    currentDatePointerEnd,
  } = state.viewState;
  const currentDatePointerStartDate = dayjs(currentDatePointerStart);

  if (selectedRangeType === RANGE_TYPE.CUSTOM) {
    return {
      start: dayjs(currentDatePointerStart),
      // The selected end day should be included in the calculation, so we
      // need to add an extra day.
      end: dayjs(currentDatePointerEnd).add(1, 'day'),
    };
  }

  let rangeStart;
  let rangeEnd;

  if (selectedRangeType === RANGE_TYPE.DAY) {
    rangeStart = currentDatePointerStartDate.startOf('day');
    rangeEnd = rangeStart.add(1, 'day');
  } else if (selectedRangeType === RANGE_TYPE.WEEK) {
    rangeStart = currentDatePointerStartDate
      .locale(selectLocaleForWeekStart(state))
      .startOf('day')
      .weekday(0);
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

  return {
    start: rangeStart,
    end: rangeEnd,
  };
};

export const selectEventsByRange = (state) => {
  const events = selectCalendarEvents(state, selectSelectedCalendar(state));

  if (!events) {
    return null;
  }

  const { start, end } = selectCurrentDatePointers(state);

  return events.filter((event) => {
    const itemDateStart = new Date(event.start.dateTime);
    const itemDateEnd = new Date(event.end.dateTime);

    return itemDateStart > start && itemDateEnd < end;
  });
};

export const selectHours = (state) => {
  const events = selectEventsByRange(state);

  if (!events) {
    return null;
  }

  let hours = 0;

  events.forEach((event) => {
    const itemDateStart = new Date(event.start.dateTime);
    const itemDateEnd = new Date(event.end.dateTime);

    hours += (itemDateEnd - itemDateStart) / 1000 / 60 / 60;
  });

  return Math.round(hours * 100) / 100;
};

export const setSelectedCalendar = ({ calendarId }) => (dispatch, getState) => {
  dispatch(setSelectedCalendarId(calendarId));
  updateConfig({ selectedCalendarId: calendarId });
  const calendarEvents = selectCalendarEvents(getState(), calendarId);
  if (!calendarEvents) {
    dispatch(loadCalendarEvents({ calendarId }));
  }
};

export const changeRangeType = ({ range }) => (dispatch, getState) => {
  if (range === RANGE_TYPE.CUSTOM) {
    const { start, end } = selectCurrentDatePointers(getState());
    // We need to subtract a day here, because a day was added to `end`
    // in order to have the selected end day in the calculation.
    const correctedEnd = end.subtract(1, 'day');
    dispatch(setStart(start.toJSON()));
    dispatch(setEnd(correctedEnd.toJSON()));
    updateConfig({ start: start.toJSON(), end: correctedEnd.toJSON() });
  }
  dispatch(setRangeType(range));
  updateConfig({ selectedRangeType: range });
};

export const changeWeekStart = (weekStart) => (dispatch) => {
  dispatch(setWeekStart(weekStart));
  updateConfig({ weekStart });
};

export const changeStart = (start) => (dispatch) => {
  dispatch(setStart(start));
  updateConfig({ start });
};

export const changeEnd = (end) => (dispatch) => {
  dispatch(setEnd(end));
  updateConfig({ end });
};

// export default viewState.reducer;

export default (state = initialState, { type, ...data } = {}) =>
  states[type] ? states[type](state, data) : state;
