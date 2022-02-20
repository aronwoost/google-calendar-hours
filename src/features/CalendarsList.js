import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import bootstrap from 'bootstrap/dist/css/bootstrap.css';

import { selectCalendars } from '../stores/calendars';
import {
  selectSelectedCalendar,
  setSelectedCalendar,
} from '../stores/viewState';

const CalendarsList = () => {
  const dispatch = useDispatch();

  const calendars = useSelector(selectCalendars);
  const selectedCalendar = useSelector(selectSelectedCalendar);

  return (
    <select
      data-testid="CalendarsList"
      className={bootstrap['form-select']}
      onChange={(event) => {
        dispatch(setSelectedCalendar({ calendarId: event.target.value }));
      }}
      value={selectedCalendar ?? ''}
    >
      {!selectedCalendar && (
        <option key="default">Please select calendar</option>
      )}
      {calendars.map(({ id, label }) => (
        <option value={id} key={id}>
          {label}
        </option>
      ))}
      <option key="all-calendars" value={calendars.map(({ id }) => (id))}>
        All calendars
      </option>
    </select>
  );
};

export default CalendarsList;
