import { useSelector } from 'react-redux';
import cx from 'classnames';

import { selectNumberOfEvents } from '../stores/viewState';

import styles from './ShowDetailsButton.module.css';

// eslint-disable-next-line react/prop-types
const ShowDetailsButton = ({ isEventsOpen, setIsEventsOpen }) => {
  const numberOfEvents = useSelector(selectNumberOfEvents);

  return (
    <div>
      <button
        type="button"
        data-testid={isEventsOpen ? 'HideEventsButton' : 'ShowEventsButton'}
        className={cx(
          styles.showDetailsButton,
          'btn',
          'btn-outline-secondary',
          'btn-sm'
        )}
        onClick={() => setIsEventsOpen(!isEventsOpen)}
      >
        {isEventsOpen
          ? `hide details of ${numberOfEvents} events`
          : `show details of ${numberOfEvents} events`}
      </button>
    </div>
  );
};

export default ShowDetailsButton;
