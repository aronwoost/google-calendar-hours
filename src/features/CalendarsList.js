import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

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
      onChange={(event) => {
        dispatch(setSelectedCalendar({ calendarId: event.target.value }));
      }}
      value={selectedCalendar || ''}
    >
      {!selectedCalendar && (
        <option key="default">Please select calendar</option>
      )}
      {calendars.map((item) => (
        <option value={item.id} key={item.id}>
          {item.label}
        </option>
      ))}
    </select>
  );
};

export default CalendarsList;
