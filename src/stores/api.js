import { encode } from 'qss';
import dayjs from 'dayjs';

const API_BASE_PATH = 'https://www.googleapis.com/calendar/v3/';

const fetchGoogle = async ({ url, accessToken, params }) => {
  const response = await fetch(
    `${url}?${encode({
      access_token: accessToken,
      ...params,
    })}`
  );

  if (response.status !== 200) {
    sessionStorage.removeItem('accessToken');
    window.location = '/';
    return Promise.reject();
  }
  return response.json();
};

export const fetchCalendars = ({ accessToken }) =>
  fetchGoogle({ url: `${API_BASE_PATH}users/me/calendarList`, accessToken });

const fetchEvents = async ({ accessToken, calendarId, pageToken, acc }) => {
  const { items, nextPageToken } = await fetchGoogle({
    url: `${API_BASE_PATH}calendars/${calendarId}/events`,
    accessToken,
    params: {
      singleEvents: true,
      maxResults: 2500,
      pageToken,
      timeMax: dayjs().add(1, 'year').toJSON(),
    },
  });

  if (!nextPageToken) {
    return [...acc, ...items];
  }

  return fetchEvents({
    accessToken,
    calendarId,
    pageToken: nextPageToken,
    acc: [...acc, ...items],
  });
};

export const fetchCalendarEvents = async ({ accessToken, calendarId }) =>
  fetchEvents({ accessToken, calendarId, acc: [] });
