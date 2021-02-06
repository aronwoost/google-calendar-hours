import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';

import { loadCalendars, selectCalendars } from '../stores/calendars';
import {
  selectSelectedCalendar,
  setSelectedCalendar,
} from '../stores/viewState';

import bootstrap from '../bootstrap.module.css';

const CalendarsList = () => {
  const dispatch = useDispatch();

  const calendars = useSelector(selectCalendars);
  const selectedCalendar = useSelector(selectSelectedCalendar);

  useEffect(() => {
    if (!calendars) {
      dispatch(loadCalendars());
    }
  }, [dispatch, calendars]);

  if (!calendars) {
    return <div>loading</div>;
  }

  return (
    <select
      data-testid="CalendarsList"
      className={cx(bootstrap['form-select'])}
      onChange={(event) => {
        dispatch(setSelectedCalendar({ calendarId: event.target.value }));
      }}
      value={selectedCalendar || ''}
    >
      {!selectedCalendar && (
        <option key="default">Please select calendar</option>
      )}
      {calendars.map(({ id, label }) => (
        <option value={id} key={id}>
          {label}
        </option>
      ))}
    </select>
  );
};

export default CalendarsList;
