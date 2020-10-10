import React from 'react';
import { useSelector } from 'react-redux';

import {
  selectSelectedCalendar,
  selectEventsByRange,
} from '../stores/viewState';

const Events = () => {
  const selectedCalendar = useSelector(selectSelectedCalendar);
  const events = useSelector((state) =>
    selectEventsByRange(state, selectedCalendar)
  );

  if (!events) {
    return null;
  }

  return (
    <div>
      <ul>
        {events.map((event) => (
          <li key={event.id}>{event.summary}</li>
        ))}
      </ul>
    </div>
  );
};

export default Events;
