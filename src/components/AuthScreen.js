'use client';

import React, { Fragment } from 'react';
import { encode } from 'qss';

const googleClientId = '502172359025.apps.googleusercontent.com';
const googleScope =
  'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly';

const App = () => {
  const getGoogleAuthUrl = () => {
    const params = encode({
      client_id: googleClientId,
      redirect_uri: 'http://localhost:3000',
      scope: googleScope,
      response_type: 'token',
    });

    return `https://accounts.google.com/o/oauth2/auth?${params}`;
  };

  return (
    <Fragment>
      <p>
        This web app lets you see how many hours you spend on a Google Calendar.
        It uses the Google Calendar API to fetch your calendars and events,
        crunches the data and displays it nicely. You can filter by day, week,
        month, year, total or add a custom time range.
      </p>

      <p>You need to authorize the app with the following link:</p>
      <a href={getGoogleAuthUrl()} data-testid="AuthLink">
        <img
          src="./google_auth.png"
          alt="Auth with Google"
          width="191"
          height="46"
        />
      </a>
      <h3>Privacy Policy</h3>
      <p>
        This app connects to the Google Calendar API to fetch your calendars and
        events, so that it can calculate the hours. This connection happens
        directly from your browser to the Google API. There are no server or
        services involved that might cache the data.
      </p>
      <p>
        None of the data fetched from the Google Calendar API is saved elsewhere
        but in your browser. After you close the browser window/tab all
        authentication data is delete (technical detail: sessionStorage is
        used). Thats why you need to reauthorize with Google the next time you
        visit the page.
      </p>
      <p>This app only has read-only access to your calendar data.</p>
    </Fragment>
  );
};

export default App;
