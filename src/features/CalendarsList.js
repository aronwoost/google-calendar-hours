import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import bootstrap from 'bootstrap/dist/css/bootstrap.css';

import { loadCalendars, selectCalendars } from '../stores/calendars';
import {
  selectSelectedCalendar,
  setSelectedCalendar,
} from '../stores/viewState';

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
      className={bootstrap['form-select']}
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
