import { configureStore } from '@reduxjs/toolkit';
import authentication from './authentication';
import calendars from './calendars';
import viewState from './viewState';
import calendar from './calendar';

export default ({ initialState } = {}) =>
  configureStore({
    reducer: {
      authentication,
      calendars,
      viewState,
      calendar,
    },
    preloadedState: initialState,
  });
