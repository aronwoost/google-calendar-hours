import queryString from 'query-string';
import dayjs from 'dayjs';

const API_BASE_PATH = 'https://www.googleapis.com/calendar/v3/';

const fetchGoogle = ({ url, accessToken, params }) =>
  fetch(
    `${url}?${queryString.stringify({
      access_token: accessToken,
      ...params,
    })}`
  ).then((response) => {
    if (response.status !== 200) {
      sessionStorage.removeItem('accessToken');
      window.location = '/';
      return Promise.reject();
    }
    return response.json();
  });

export const fetchCalendars = ({ accessToken }) =>
  fetchGoogle({ url: `${API_BASE_PATH}users/me/calendarList`, accessToken });

const fetchEvents = ({ accessToken, calendarId, pageToken, acc }) =>
  fetchGoogle({
    url: `${API_BASE_PATH}calendars/${calendarId}/events`,
    accessToken,
    params: {
      singleEvents: true,
      maxResults: 2500,
      pageToken,
      timeMax: dayjs().add(1, 'year').toJSON(),
    },
  }).then(({ items, nextPageToken }) => {
    if (!nextPageToken) {
      return [...acc, ...items];
    }

    return fetchEvents({
      accessToken,
      calendarId,
      pageToken: nextPageToken,
      acc: [...acc, ...items],
    });
  });

export const fetchCalendarEvents = async ({ accessToken, calendarId }) =>
  fetchEvents({ accessToken, calendarId, acc: [] });
