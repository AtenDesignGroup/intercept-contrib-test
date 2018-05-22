import React from 'react';
import { render } from 'react-dom';
import withIntercept from 'intercept/withIntercept';
import drupalSettings from 'drupalSettings';
import EventRegisterButtonApp from './components/EventRegisterButtonApp';

const App = withIntercept(EventRegisterButtonApp);
const roots = [...document.getElementsByClassName('js--event-register-button')];
const user = drupalSettings.intercept.user;

function renderButton(root) {
  const uuid = root.getAttribute('data-uuid');
  render(<App eventId={uuid} user={user} />, root);
}
roots.map(renderButton);
