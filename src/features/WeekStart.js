import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  selectRangeType,
  selectWeekStart,
  setWeekStart,
} from '../stores/viewState';
import { RANGE_TYPE } from '../constants';

const RangeChanger = () => {
  const currentRangeType = useSelector(selectRangeType);
  const dispatch = useDispatch();

  if (currentRangeType !== RANGE_TYPE.WEEK) {
    return null;
  }

  const weekStart = useSelector(selectWeekStart);

  return (
    <div>
      <span>Week starts on:</span>
      <label htmlFor="sunday">
        Sunday
        <input
          type="radio"
          value="sunday"
          id="sunday"
          checked={weekStart === 'sunday'}
          onChange={({ target }) => dispatch(setWeekStart(target.value))}
        />
      </label>
      <label htmlFor="monday">
        Monday
        <input
          type="radio"
          value="monday"
          id="monday"
          checked={weekStart === 'monday'}
          onChange={({ target }) => dispatch(setWeekStart(target.value))}
        />
      </label>
    </div>
  );
};

export default RangeChanger;
