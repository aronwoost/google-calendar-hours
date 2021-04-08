import { lazy } from 'react';

export default lazy(() =>
  import(/* webpackChunkName: "EventsList" */ './EventsList')
);
