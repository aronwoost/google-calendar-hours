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

const getViewState = () => {
  const config = getConfig() ?? {};
  return {
    selectedRangeType: config.selectedRangeType ?? RANGE_TYPE.MONTH,
    currentDatePointerStart:
      config.selectedRangeType === RANGE_TYPE.CUSTOM
        ? config.start
        : dayjs().startOf('day').toJSON(),
    currentDatePointerEnd: config.end,
    weekStart: config.weekStart ?? WEEK_START.MONDAY,
  };
};

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
