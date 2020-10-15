import React from 'react';
import { useSelector } from 'react-redux';

import { selectRangeType } from '../stores/viewState';
import { RANGE_TYPE } from '../constants';

const RangeChanger = () => {
  const currentRangeType = useSelector(selectRangeType);
  const sortBy = 'monday';

  if (currentRangeType !== RANGE_TYPE.WEEK) {
    return null;
  }

  return (
    <div>
      <span>Week starts on:</span>
      <label htmlFor="date">
        Sunday
        <input
          type="radio"
          value="sunday"
          id="sunday"
          checked={sortBy === 'sunday'}
          onChange={() => {}}
        />
      </label>
      <label htmlFor="amount">
        Monday
        <input
          type="radio"
          value="monday"
          id="monday"
          checked={sortBy === 'monday'}
          onChange={() => {}}
        />
      </label>
    </div>
  );
};

export default RangeChanger;
