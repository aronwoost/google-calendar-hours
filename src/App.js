import React, { Fragment, useEffect } from 'react';
import { useSelector } from 'react-redux';

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
import { selectCalendarEvents } from './stores/calendarEvents';
import logo from './google_auth.png';

import styles from './App.module.css';

const getURLParameter = (name, searchOrHash) =>
  decodeURI(
    (RegExp(`${name}=(.+?)(&|$)`).exec(searchOrHash) || [null, null])[1]
  );

const App = () => {
  const hasToken = useSelector(selectHasToken);
  const selectedCalendar = useSelector(selectSelectedCalendar);
  const events = useSelector((state) =>
    selectCalendarEvents(state, selectedCalendar)
  );

  useEffect(() => {
    const accessToken = getURLParameter(
      'access_token',
      window.location && window.location.hash
    );
    if (accessToken !== 'null') {
      sessionStorage.setItem('accessToken', accessToken);
      window.location = '/';
    }
  }, []);

  const getGoogleAuthUrl = () => {
    const clientId = '502172359025.apps.googleusercontent.com';
    const callbackUrl = `${window.location.origin}${window.location.pathname}auth.html`;
    const scope =
      'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly';
    const reqUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${callbackUrl}&scope=${scope}&response_type=token`;

    return reqUrl;
  };

  if (!hasToken) {
    return (
      <div>
        <header className={styles.appHeader}>
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
        </header>
      </div>
    );
  }

  return (
    <div>
      <header className={styles.appHeader}>
        <Headline />
        <CalendarsList />
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
      </header>
    </div>
  );
};

export default App;
