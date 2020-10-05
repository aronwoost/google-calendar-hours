import { configureStore } from '@reduxjs/toolkit';
import authentication from './authentication';
import calendars from './calendars';
import viewState from './viewState';
import calendarEvents from './calendarEvents';

// eslint-disable-next-line import/prefer-default-export
export const store = ({ initialState } = {}) =>
  configureStore({
    reducer: {
      authentication,
      calendars,
      viewState,
      calendarEvents,
    },
    preloadedState: initialState,
  });
