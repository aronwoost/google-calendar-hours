import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import {
  selectSelectedCalendar,
  selectEventsByRange,
} from '../stores/viewState';

const Events = () => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCalendar = useSelector(selectSelectedCalendar);
  const events = useSelector((state) =>
    selectEventsByRange(state, selectedCalendar)
  );

  if (!events) {
    return null;
  }

  return (
    <div>
      <div>
        <button type="button" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'hide details' : 'show details'}
        </button>
      </div>
      {isOpen && (
        <ul>
          {events.map((event) => (
            <li key={event.id}>{event.summary}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Events;
