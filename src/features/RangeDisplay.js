import React from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { selectDate, selectRangeType } from '../stores/viewState';

const RangeDisplay = () => {
  const currentDate = useSelector(selectDate);
  const currentRangeType = useSelector(selectRangeType);

  if (currentRangeType === 'total') {
    return null;
  }

  let range;
  const date = dayjs(currentDate);

  if (currentRangeType === 'day') {
    range = date.format('dddd, MMMM D, YYYY');
  } else if (currentRangeType === 'week') {
    const nextWeek = date.add(1, 'week');
    range = `${date.format('DD.MM.YYYY')} -  ${nextWeek.format('DD.MM.YYYY')}`;
  } else if (currentRangeType === 'month') {
    range = date.format('MMMM, YYYY');
  } else if (currentRangeType === 'year') {
    range = date.format('YYYY');
  }

  return <div data-testid="RangeDisplay">{range}</div>;
};

export default RangeDisplay;
