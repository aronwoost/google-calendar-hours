import React, { Fragment, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { encode, decode } from 'qss';

import CalendarsList from './features/CalendarsList';
import Range from './features/Range';
import RangeChanger from './features/RangeChanger';
import CustomRange from './features/CustomRange';
import Hours from './features/Hours';
import RangeDisplay from './features/RangeDisplay';
import Events from './features/Events';
import WeekStart from './features/WeekStart';
import Headline from './Headline';
import { selectHasToken } from './stores/authentication';
import { selectSelectedCalendar } from './stores/viewState';
import {
  selectCalendarEvents,
  selectIsEventsLoading,
} from './stores/calendarEvents';
import logo from './google_auth.png';

import styles from './App.module.css';

const googleClientId = '502172359025.apps.googleusercontent.com';
const googleScope =
  'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly';

const App = () => {
  const hasToken = useSelector(selectHasToken);
  const selectedCalendar = useSelector(selectSelectedCalendar);
  const events = useSelector((state) =>
    selectCalendarEvents(state, selectedCalendar)
  );
  const eventsLoading = useSelector(selectIsEventsLoading);

  useEffect(() => {
    const hashParams = decode(window.location?.hash?.slice(1) ?? '');

    if (hashParams.access_token) {
      sessionStorage.setItem('accessToken', hashParams.access_token);
      window.location = '/';
    }
  }, []);

  const getGoogleAuthUrl = () => {
    const params = encode({
      client_id: googleClientId,
      redirect_uri: `${window.location.origin}${window.location.pathname}auth.html`,
      scope: googleScope,
      response_type: 'token',
    });

    return `https://accounts.google.com/o/oauth2/auth?${params}`;
  };

  if (!hasToken) {
    return (
      <div className={styles.appWrapper}>
        <div className={styles.app}>
          <Headline />
          <p>
            This web app lets you see how many hours you spend on a Google
            Calendar. It uses the Google Calendar API to fetch your calendars
            and events, crunches the data and displays it nicely. You can filter
            by day, week, month, year, total or add a custom time range.
          </p>

          <p>You need to authorize the app with the following link:</p>
          <a href={getGoogleAuthUrl()} data-testid="AuthLink">
            <img src={logo} alt="Auth with Google" width="191" height="46" />
          </a>
          <h3>Privacy Policy</h3>
          <p>
            This app connects to the Google Calendar API to fetch your calendars
            and events, so that it can calculate the hours. This connection
            happens directly from your browser to the Google API. There are no
            server or services involved that might cache the data.
          </p>
          <p>
            None of the data fetched from the Google Calendar API is saved
            elsewhere but in your browser. After you close the browser
            window/tab all authentication data is delete (technical detail:
            sessionStorage is used). Thats why you need to reauthorize with
            Google the next time you visit the page.
          </p>
          <p>This app only has read-only access to your calendar data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.appWrapper}>
      <div className={styles.app}>
        <Headline />
        <CalendarsList />
        {eventsLoading && 'loading'}
        {events && (
          <Fragment>
            <Range />
            <RangeChanger />
            <CustomRange />
            <Hours />
            <WeekStart />
            <RangeDisplay />
            <Events />
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default App;
