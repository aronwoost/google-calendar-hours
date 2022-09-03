import React, { useState, useEffect, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import bootstrap from 'bootstrap/dist/css/bootstrap.css';

import CalendarsList from './features/CalendarsList';
import Range from './features/Range';
import RangeChanger from './features/RangeChanger';
import CustomRange from './features/CustomRange';
import Hours from './features/Hours';
import RangeDisplay from './features/RangeDisplay';
import Events from './features/Events';
import WeekStart from './features/WeekStart';
import {
  selectSelectedCalendar,
  selectRangeType,
  selectHours,
  selectNumberOfEvents,
} from './stores/viewState';
import {
  selectCalendarEvents,
  selectIsEventsLoading,
} from './stores/calendarEvents';
import { loadCalendars, selectCalendars } from './stores/calendars';
import { RANGE_TYPE } from './constants';

import styles from './Interface.module.css';

const Interface = () => {
  const dispatch = useDispatch();
  const [isEventsOpen, setIsEventsOpen] = useState(false);

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
  const rangeType = useSelector(selectRangeType);
  const hours = useSelector(selectHours);
  const numberOfEvents = useSelector(selectNumberOfEvents);

  return (
    <div className={styles.interface}>
      {calendars ? <CalendarsList /> : <div>loading</div>}
      {eventsLoading && 'loading'}
      {events && (
        <Fragment>
          <Range />
          {rangeType !== RANGE_TYPE.TOTAL &&
            rangeType !== RANGE_TYPE.CUSTOM && <RangeChanger />}
          {rangeType === RANGE_TYPE.CUSTOM && <CustomRange />}
          <Hours />
          {rangeType === RANGE_TYPE.WEEK && <WeekStart />}
          {rangeType !== RANGE_TYPE.TOTAL && <RangeDisplay />}
          {Boolean(hours) && (
            <div>
              <button
                type="button"
                data-testid={
                  isEventsOpen ? 'HideEventsButton' : 'ShowEventsButton'
                }
                className={cx(
                  styles.showDetailsButton,
                  bootstrap.btn,
                  bootstrap['btn-outline-secondary'],
                  bootstrap['btn-sm']
                )}
                onClick={() => setIsEventsOpen(!isEventsOpen)}
              >
                {isEventsOpen
                  ? `hide details of ${numberOfEvents} events`
                  : `show details of ${numberOfEvents} events`}
              </button>
            </div>
          )}
          {!!hours && isEventsOpen && <Events />}
        </Fragment>
      )}
    </div>
  );
};

export default Interface;
