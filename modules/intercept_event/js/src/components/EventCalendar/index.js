import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';

// Setup the localizer by providing the moment (or globalize) Object
// to the correct localizer.
BigCalendar.momentLocalizer(moment); // or globalizeLocalizer

const dateAccessor = prop => item =>
  moment(`${item.data.attributes.field_date_time[prop]}Z`, moment.ISO_8601).toDate();
const startAccessor = dateAccessor('value');
const endAccessor = dateAccessor('end_value');
const titleAccessor = item => item.data.title;

const EventCalendar = props => (
  <BigCalendar
    events={props.events}
    titleAccessor={titleAccessor}
    startAccessor={startAccessor}
    endAccessor={endAccessor}
    popup
    views={['month', 'week', 'day']}
    elementProps={{
      style: {
        height: '100vh',
      },
      className: 'what',
    }}
  />
);

EventCalendar.propTypes = {
  events: PropTypes.arrayOf(Object).isRequired,
};

export default EventCalendar;
