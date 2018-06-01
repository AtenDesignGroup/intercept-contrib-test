import React from 'react';
import { render } from 'react-dom';
import withIntercept from 'intercept/withIntercept';
import drupalSettings from 'drupalSettings';
import EventAttendanceListApp from './components/EventAttendanceListApp';

const App = withIntercept(EventAttendanceListApp);
const root = document.getElementById('eventAttendanceListRoot');
const user = drupalSettings.intercept.user;

const uuid = root.getAttribute('data-event-uuid');
render(<App eventId={uuid} user={user} />, root);
