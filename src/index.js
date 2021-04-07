import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

import './index.css';
import App from './App';
import store from './stores';

Sentry.init({
  dsn:
    'https://72dc5f435c6c4bf8a7c455a11ad94e89@o566390.ingest.sentry.io/5709198',
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store()}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
