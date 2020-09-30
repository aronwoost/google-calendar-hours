import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  changeRangeType,
  selectSelectedCalendar,
  selectRangeType,
} from '../stores/viewState';

const Range = () => {
  const dispatch = useDispatch();

  const selectedCalendar = useSelector(selectSelectedCalendar);
  const currentRangeType = useSelector(selectRangeType);

  if (!selectedCalendar) {
    return null;
  }

  return (
    <select
      data-testid="RangeSelectList"
      onChange={(event) =>
        dispatch(changeRangeType({ range: event.target.value }))
      }
      value={currentRangeType}
    >
      <option value="day">Day</option>
      <option value="week">Week</option>
      <option value="month">Month</option>
      <option value="year">Year</option>
      <option value="total">Total</option>
    </select>
  );
};

export default Range;
