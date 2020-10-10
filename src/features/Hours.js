import React from 'react';
import { useSelector } from 'react-redux';

import { selectHours, selectSelectedCalendar } from '../stores/viewState';

const Hours = () => {
  const hours = useSelector(selectHours);
  const selectedCalendar = useSelector(selectSelectedCalendar);

  if (!selectedCalendar) {
    return null;
  }

  if (hours === undefined) {
    return <div>Loading hours</div>;
  }

  return <div>{`${hours}h`}</div>;
};

export default Hours;
