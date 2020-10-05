import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import timekeeper from 'timekeeper';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { store } from './stores';
import App from './App';
import { getInitialState } from './stores/viewState';

const createTestStore = ({ authentication, viewState, calendars, calendar }) =>
  store({
    initialState: {
      authentication: { accessToken: 'ABC123', ...authentication },
      viewState: {
        ...getInitialState(),
        selectedCalendarId: 'test-id',
        ...viewState,
      },
      calendars: {
        list: [{ id: 'test-id', label: 'test-name' }],
        ...calendars,
      },
      calendar,
    },
  });

const renderAppWithStore = ({
  authentication,
  viewState,
  calendars,
  calendar,
} = {}) =>
  render(
    <Provider
      store={createTestStore({
        authentication,
        viewState,
        calendars,
        calendar,
      })}
    >
      <App />
    </Provider>
  );

beforeEach(() => {
  timekeeper.freeze(new Date('2018-01-01T10:00:00Z'));
  window.localStorage.removeItem('config');
});

const testEvents = [
  {
    start: { dateTime: '2016-01-01T10:00:00Z' },
    end: { dateTime: '2016-01-01T11:00:00Z' },
  },
  {
    start: { dateTime: '2018-01-02T10:00:00Z' },
    end: { dateTime: '2018-01-02T11:00:00Z' },
  },
];

const server = setupServer(
  rest.get(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    (req, res, ctx) => {
      const accessToken = req.url.searchParams.get('access_token');
      if (accessToken !== 'ABC123') {
        return res(403);
      }

      return res(
        ctx.json({ items: [{ id: 'test-id', summary: 'test-name' }] })
      );
    }
  ),
  rest.get(
    'https://www.googleapis.com/calendar/v3/calendars/test-id/events?maxResults=2500&singleEvents=true',
    (req, res, ctx) => {
      const accessToken = req.url.searchParams.get('access_token');
      if (accessToken !== 'ABC123') {
        return res(403);
      }

      return res(ctx.json({ items: testEvents }));
    }
  )
);

delete window.location;

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('renders google auth button', () => {
  const { getByAltText } = renderAppWithStore({
    authentication: { accessToken: null },
  });

  expect(getByAltText('Auth with Google')).toBeInTheDocument();
});

it('writes access token to localStorage and does redirect', () => {
  window.location = new URL(
    'https://www.example.com/hello#access_token=ABC123'
  );

  renderAppWithStore({
    authentication: { accessToken: null },
  });

  expect(window.localStorage.getItem('accessToken')).toEqual('ABC123');
  expect(window.location).toBe('/');
});

it('renders "loading" without calendars', () => {
  const { getByText } = renderAppWithStore({ calendars: { list: null } });

  expect(getByText('loading')).toBeInTheDocument();
});

it('renders calendars list', () => {
  const { queryByText } = renderAppWithStore();

  expect(queryByText('Please select calendar')).not.toBeInTheDocument();
});

it('requests calendars and display placeholder', async () => {
  const { findByText, queryByTestId, queryByText } = renderAppWithStore({
    viewState: { selectedCalendarId: null },
    calendars: { list: null },
  });

  expect(await findByText('Please select calendar')).toBeInTheDocument();
  expect(await findByText('test-name')).toBeInTheDocument();
  expect(queryByTestId('RangeSelectList')).not.toBeInTheDocument();
  expect(queryByText('Loading hours')).not.toBeInTheDocument();
  expect(queryByTestId('RangeChanger')).not.toBeInTheDocument();
});

it('renders range select list and hours (happy path)', () => {
  const { getByText } = renderAppWithStore({
    calendar: {
      map: { 'test-id': testEvents },
    },
  });

  expect(getByText('Total')).toBeInTheDocument();
  expect(getByText('Week')).toBeInTheDocument();
  expect(getByText('2h')).toBeInTheDocument();
});

it('renders correctly after user changes calendar', () => {
  const { getByTestId, getByText } = renderAppWithStore({
    calendars: {
      list: [
        { id: 'test-id', label: 'test-name' },
        { id: 'test-id-2', label: 'test-name-2' },
      ],
    },
    calendar: {
      map: { 'test-id': [], 'test-id-2': testEvents },
    },
  });

  fireEvent.change(getByTestId('CalendarsList'), {
    target: { value: 'test-id-2' },
  });

  expect(getByText('2h')).toBeInTheDocument();
});

it('requests events, display hours and sets localStorage when loaded', async () => {
  const { getByTestId, findByText } = renderAppWithStore();

  fireEvent.change(getByTestId('CalendarsList'), {
    target: { value: 'test-id' },
  });

  expect(await findByText('2h')).toBeInTheDocument();

  expect(window.localStorage.getItem('config')).toEqual(
    '{"selectedCalendarId":"test-id"}'
  );
});

describe('localStorage', () => {
  it('saves user selection to localStorage', () => {
    const { getByTestId } = renderAppWithStore({
      calendar: {
        map: { 'test-id': testEvents },
      },
    });

    fireEvent.change(getByTestId('CalendarsList'), {
      target: { value: 'test-id' },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    expect(window.localStorage.getItem('config')).toEqual(
      '{"selectedCalendarId":"test-id","selectedRangeType":"week"}'
    );
  });

  it('uses data from localStorage to sets UI', async () => {
    window.localStorage.setItem(
      'config',
      JSON.stringify({
        selectedCalendarId: 'test-id',
        selectedRangeType: 'week',
      })
    );

    const { findByText } = renderAppWithStore({
      viewState: {
        selectedCalendarId: null,
      },
      calendars: {
        list: null,
      },
    });

    expect(await findByText('1h')).toBeInTheDocument();
  });
});

describe('calculate hours', () => {
  it('renders 0h hours (if not matching events)', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-20T10:00:00Z' },
              end: { dateTime: '2018-01-20T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    expect(getByText('0h')).toBeInTheDocument();
  });

  it('renders hours for day', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-10T10:00:00Z' },
              end: { dateTime: '2018-01-10T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'day' },
    });

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for day when user changes to previous day', () => {
    timekeeper.freeze(new Date('2018-01-02T10:00:00Z'));

    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-02T10:00:00Z' },
              end: { dateTime: '2018-01-02T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'day' },
    });

    fireEvent.click(getByText('Prev'));

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for day when user changes to next day', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-02T10:00:00Z' },
              end: { dateTime: '2018-01-02T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'day' },
    });

    fireEvent.click(getByText('Next'));

    expect(getByText('1h')).toBeInTheDocument();
  });

  it('renders hours for day when user resets', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-02T10:00:00Z' },
              end: { dateTime: '2018-01-02T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'day' },
    });

    fireEvent.click(getByText('Next'));

    fireEvent.click(getByText('Reset'));

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for week', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-02T10:00:00Z' },
              end: { dateTime: '2018-01-02T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-10T10:00:00Z' },
              end: { dateTime: '2018-01-10T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for week when user changes to previous week', () => {
    timekeeper.freeze(new Date('2018-01-12T10:00:00Z'));

    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-12T10:00:00Z' },
              end: { dateTime: '2018-01-12T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    fireEvent.click(getByText('Prev'));

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for week when user changes to next week', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-12T10:00:00Z' },
              end: { dateTime: '2018-01-12T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    fireEvent.click(getByText('Next'));

    expect(getByText('1h')).toBeInTheDocument();
  });

  it('renders hours for week when user resets', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-12T10:00:00Z' },
              end: { dateTime: '2018-01-12T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'week' },
    });

    fireEvent.click(getByText('Next'));

    fireEvent.click(getByText('Reset'));

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for month', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-14T13:00:00Z' },
              end: { dateTime: '2018-01-14T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-02-01T10:00:00Z' },
              end: { dateTime: '2018-02-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for month when user changes to previous month', () => {
    timekeeper.freeze(new Date('2018-02-01T10:00:00Z'));

    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-02-01T10:00:00Z' },
              end: { dateTime: '2018-02-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    fireEvent.click(getByText('Prev'));

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for month when user changes to next month', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-02-01T10:00:00Z' },
              end: { dateTime: '2018-02-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    fireEvent.click(getByText('Next'));

    expect(getByText('1h')).toBeInTheDocument();
  });

  it('renders hours for month when user resets', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-02-01T10:00:00Z' },
              end: { dateTime: '2018-02-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'month' },
    });

    fireEvent.click(getByText('Next'));

    fireEvent.click(getByText('Reset'));

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for year', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2017-01-01T10:00:00Z' },
              end: { dateTime: '2017-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-14T13:00:00Z' },
              end: { dateTime: '2018-01-14T14:00:00Z' },
            },
            {
              start: { dateTime: '2018-02-01T10:00:00Z' },
              end: { dateTime: '2018-02-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'year' },
    });

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for year when user changes to previous year', () => {
    timekeeper.freeze(new Date('2019-01-01T10:00:00Z'));

    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2019-01-01T10:00:00Z' },
              end: { dateTime: '2019-01-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'year' },
    });

    fireEvent.click(getByText('Prev'));

    expect(getByText('2h')).toBeInTheDocument();
  });

  it('renders hours for year when user changes to next year', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2019-01-01T10:00:00Z' },
              end: { dateTime: '2019-01-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'year' },
    });

    fireEvent.click(getByText('Next'));

    expect(getByText('1h')).toBeInTheDocument();
  });

  it('renders hours for year when user resets', () => {
    const { getByText, getByTestId } = renderAppWithStore({
      calendar: {
        map: {
          'test-id': [
            {
              start: { dateTime: '2018-01-01T10:00:00Z' },
              end: { dateTime: '2018-01-01T11:00:00Z' },
            },
            {
              start: { dateTime: '2018-01-01T13:00:00Z' },
              end: { dateTime: '2018-01-01T14:00:00Z' },
            },
            {
              start: { dateTime: '2019-01-01T10:00:00Z' },
              end: { dateTime: '2019-01-01T11:00:00Z' },
            },
          ],
        },
      },
    });

    fireEvent.change(getByTestId('RangeSelectList'), {
      target: { value: 'year' },
    });

    fireEvent.click(getByText('Next'));

    fireEvent.click(getByText('Reset'));

    expect(getByText('2h')).toBeInTheDocument();
  });
});

describe('display time range in human readable format', () => {
  it('renders current day', () => {
    const { getByText } = renderAppWithStore({
      viewState: { selectedRangeType: 'day' },
      calendar: { map: { 'test-id': [] } },
    });

    expect(getByText('Monday, January 1, 2018')).toBeInTheDocument();
  });

  it('renders current week', () => {
    const { getByText } = renderAppWithStore({
      viewState: { selectedRangeType: 'week' },
      calendar: { map: { 'test-id': [] } },
    });

    expect(getByText('01.01.2018 - 08.01.2018')).toBeInTheDocument();
  });

  it('renders current month', () => {
    const { getByText } = renderAppWithStore({
      viewState: { selectedRangeType: 'month' },
      calendar: { map: { 'test-id': [] } },
    });

    expect(getByText('January, 2018')).toBeInTheDocument();
  });

  it('renders current year', () => {
    const { getByText } = renderAppWithStore({
      viewState: { selectedRangeType: 'year' },
      calendar: { map: { 'test-id': [] } },
    });

    expect(getByText('2018')).toBeInTheDocument();
  });

  it('renders without RangeDisplay ("total")', () => {
    const { queryByTestId } = renderAppWithStore({
      viewState: { selectedRangeType: 'total' },
      calendar: { map: { 'test-id': [] } },
    });

    expect(queryByTestId('RangeDisplay')).not.toBeInTheDocument();
  });
});
