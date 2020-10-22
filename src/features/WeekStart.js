import React from 'react';

const RangeChanger = () => {
  const sortBy = 'monday';

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
