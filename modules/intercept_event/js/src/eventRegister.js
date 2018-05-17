import React from 'react';
import { render } from 'react-dom';
import withIntercept from 'intercept/withIntercept';
import EventRegisterApp from './components/EventRegisterApp';

const App = withIntercept(EventRegisterApp);
const root = document.getElementById('eventRegisterRoot');
const uuid = root.getAttribute('data-uuid');
render(<App eventId={uuid} />, root);
