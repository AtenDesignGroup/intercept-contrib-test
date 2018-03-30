import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import interceptClient from 'interceptClient';
import BrowseEventsApp from './components/BrowseEventsApp';

const store = interceptClient.store;
render(
  <Provider store={store}>
    <BrowseEventsApp />
  </Provider>,
  document.getElementById('eventListRoot'),
);
