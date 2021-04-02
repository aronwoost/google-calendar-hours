import { configureStore } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';

import authentication from './authentication';
import calendars from './calendars';
import viewState from './viewState';
import calendarEvents from './calendarEvents';
import { getConfig } from './storage';
import { RANGE_TYPE, WEEK_START } from '../constants';

dayjs.extend(weekday);

const getAccessToken = () => {
  try {
    return sessionStorage.getItem('accessToken');
  } catch (e) {
    // don't handle
  }

  return null;
};

const getViewState = () => ({
  selectedRangeType: getConfig()?.selectedRangeType || RANGE_TYPE.MONTH,
  currentDatePointerStart:
    getConfig()?.selectedRangeType === RANGE_TYPE.CUSTOM
      ? getConfig().start
      : dayjs().startOf('day').toJSON(),
  currentDatePointerEnd: getConfig()?.end,
  weekStart: getConfig()?.weekStart || WEEK_START.MONDAY,
});

const store = () =>
  configureStore({
    reducer: {
      authentication,
      calendars,
      viewState,
      calendarEvents,
    },
    preloadedState: {
      authentication: { accessToken: getAccessToken() },
      viewState: getViewState(),
    },
  });

export default store;
