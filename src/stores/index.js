// import { configureStore } from '@reduxjs/toolkit';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import reduxThunk from 'redux-thunk';

import authentication from './authentication';
import calendars from './calendars';
import viewState from './viewState';
import calendarEvents from './calendarEvents';
import { getConfig } from './storage';
import { RANGE_TYPE, WEEK_START } from '../constants';

dayjs.extend(weekday);

// const composeWithDevTools = (...enhancers) => {
//   const composeEnhancers =
//     (DEBUG &&
//       typeof window === 'object' &&
//       window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
//     compose;
//   return composeEnhancers(...enhancers);
// };

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

// export default function configureStore({
//   initialState = {},
//   basename,
//   initialEntries,
//   onError = () => {},
// }) {
//   const {
//     thunk,
//     enhancer: reduxRouterEnhancer,
//     middleware: reduxRouterMiddleware,
//     reducer: reduxRouterReducer,
//   } = connectRoutes(routesMap, {
//     ...(basename ? { basename } : {}),
//     ...(initialEntries ? { initialEntries } : {}),
//     // https://github.com/faceyspacey/redux-first-router/blob/master/docs/connectRoutes.md#options
//     restoreScroll: restoreScroll({ manual: true }),
//     querySerializer: queryString,
//   });

//   const errorMiddleware = () => (next) => (action) => {
//     if (action.type === ERROR_ROUTE) {
//       onError({ ...action.payload });
//     }
//     return next(action);
//   };

//   const middlewares = [
//     ...hashedVipMiddlewares,
//     reduxRouterMiddleware,
//     reduxThunk,
//     errorMiddleware,
//     createActorRunnerMiddleware(
//       combineActors(
//         authenticationActors,
//         featuresActors,
//         pagesActors,
//         pageSegmentsActors,
//         geoLocationActors
//       )
//     ),
//   ];
//   const reducers = {
//     location: reduxRouterReducer,
//     authentication: authenticationReducer,
//     page: pageReducer,
//     features: featuresReducer,
//     pages: pagesReducer,
//     pageSegments: pageSegmentsReducer,
//     referenceData: referenceDataReducer,
//     searchQuery: searchQueryReducer,
//     geoLocation: geoLocationReducer,
//     i18n: i18nReducer,
//     snackbars: snackbarsReducer,
//     isLegacyBrowser: isLegacyBrowserReducer,
//   };

//   if (DEBUG && typeof window === 'object') {
//     const { createLogger } = require('redux-logger'); // eslint-disable-line
//     middlewares.push(createLogger({ collapsed: true, duration: true }));
//   }

//   const rootReducer = combineReducers(reducers);
//   const store = createStore(
//     rootReducer,
//     initialState,
//     composeWithDevTools(reduxRouterEnhancer, applyMiddleware(...middlewares))
//   );

//   const runRouteThunks = () => thunk(store);

//   return { store, runRouteThunks };
// }

const store = () => {
  const middlewares = [reduxThunk];

  const reducers = {
    authentication,
    calendars,
    viewState,
    calendarEvents,
  };

  // if (DEBUG && typeof window === 'object') {
  //   const { createLogger } = require('redux-logger'); // eslint-disable-line
  //   middlewares.push(createLogger({ collapsed: true, duration: true }));
  // }

  const initialState = {
    authentication: { accessToken: getAccessToken() },
    viewState: getViewState(),
  };

  const rootReducer = combineReducers(reducers);
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
};

// const store = () =>
//   configureStore({
//     reducer: {
//       authentication,
//       calendars,
//       viewState,
//       calendarEvents,
//     },
//     preloadedState: {
//       authentication: { accessToken: getAccessToken() },
//       viewState: getViewState(),
//     },
//   });

export default store;
