import React, { useEffect, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import CalendarsList from './features/CalendarsList';
import Range from './features/Range';
import RangeChanger from './features/RangeChanger';
import CustomRange from './features/CustomRange';
import Hours from './features/Hours';
import RangeDisplay from './features/RangeDisplay';
import Events from './features/Events';
import WeekStart from './features/WeekStart';
import { selectSelectedCalendar, selectRangeType } from './stores/viewState';
import {
  selectCalendarEvents,
  selectIsEventsLoading,
} from './stores/calendarEvents';
import { loadCalendars, selectCalendars } from './stores/calendars';
import { RANGE_TYPE } from './constants';

import styles from './Interface.module.css';

const Interface = () => {
  const dispatch = useDispatch();

  const calendars = useSelector(selectCalendars);

  useEffect(() => {
    if (!calendars) {
      dispatch(loadCalendars());
    }
  });

  const selectedCalendar = useSelector(selectSelectedCalendar);
  const events = useSelector((state) =>
    selectCalendarEvents(state, selectedCalendar)
  );
  const eventsLoading = useSelector(selectIsEventsLoading);
  const currentRangeType = useSelector(selectRangeType);

  if (!calendars) {
    return <div>loading</div>;
  }

  return (
    <div className={styles.interface}>
      {!calendars && <div>loading</div>}
      {calendars && <CalendarsList />}
      {eventsLoading && 'loading'}
      {events && (
        <Fragment>
          <Range />
          <RangeChanger />
          {currentRangeType === RANGE_TYPE.CUSTOM && <CustomRange />}
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
