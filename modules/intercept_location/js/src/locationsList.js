import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import interceptClient from 'interceptClient';
import LocationsList from './components/locationsList';

const store = interceptClient.store;
render(
  <Provider store={store}>
    <LocationsList location={{}} />
  </Provider>,
  document.getElementById('locationsListRoot'),
);
