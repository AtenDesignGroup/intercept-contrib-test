import React from 'react';
import { render } from 'react-dom';
import AddToCalendar from 'react-add-to-calendar';

/* eslint-disable */
import Drupal from 'Drupal';
/* eslint-enable */

const getProp = (context, selector) => {
  const el = context.getElementsByClassName(selector);
  return el.length > 0 ? el[0].innerHTML : null;
};

function renderApp(root) {
  const event = {
    title: getProp(root, 'atc_title'),
    description: `${getProp(root, 'atc_description').trim()} \n\n <a href="${
      window.location
    }">View Event</a>`,
    location: getProp(root, 'atc_location'),
    startTime: getProp(root, 'atc_date_start'),
    endTime: getProp(root, 'atc_date_end'),
  };

  const services = root.getAttribute('data-calendars') || '';

  const items = services.split(', ').map((item) => {
    switch (item) {
      case 'iCalendar':
        return { apple: 'Apple Calendar' };
      case 'Google Calendar':
        return { google: 'Google' };
      case 'Outlook':
        return { outlook: 'Outlook' };
      case 'Outlook Online':
        return { outlookcom: 'Outlook.com' };
      case 'Yahoo':
        return { yahoo: 'Yahoo' };
      default:
        return null;
    }
  });

  render(<AddToCalendar className={'add-to-cal'} event={event} listItems={items} />, root);
}

Drupal.behaviors.interceptEventCustomerEvaluation = {
  attach: (context) => {
    const roots = [...context.getElementsByClassName('addtocalendar')];
    roots.map(renderApp);
  },
};
