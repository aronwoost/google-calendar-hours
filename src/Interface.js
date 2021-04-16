import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';

import CalendarsList from './features/CalendarsList';
import Range from './features/Range';
import RangeChanger from './features/RangeChanger';
import CustomRange from './features/CustomRange';
import Hours from './features/Hours';
import RangeDisplay from './features/RangeDisplay';
import Events from './features/Events';
import WeekStart from './features/WeekStart';
import { selectSelectedCalendar } from './stores/viewState';
import {
  selectCalendarEvents,
  selectIsEventsLoading,
} from './stores/calendarEvents';

import styles from './Interface.module.css';

const Interface = () => {
  const selectedCalendar = useSelector(selectSelectedCalendar);
  const events = useSelector((state) =>
    selectCalendarEvents(state, selectedCalendar)
  );
  const eventsLoading = useSelector(selectIsEventsLoading);

  return (
    <div className={styles.interface}>
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
  );
};

export default Interface;
