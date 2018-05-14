import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BigCalendar from 'react-big-calendar';
import Toolbar from 'react-big-calendar/lib/Toolbar';
import moment from 'moment';
import ArrowBack from '@material-ui/icons/ArrowBack';
import ArrowForward from '@material-ui/icons/ArrowForward';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));

const dateAccessor = prop => item =>
  moment(`${item.data.attributes.field_date_time[prop]}Z`, moment.ISO_8601).toDate();
const startAccessor = dateAccessor('value');
const endAccessor = dateAccessor('end_value');
const titleAccessor = item => (
  <p className="calendar-event-title--tiny">{item.data.attributes.title}</p>
);

const CalendarEvent = (props) => {
  const { event } = props;
  const { data } = event;

  return (
    <div className="calendar-event">
      <p className="calendar-event__title">{data.attributes.title}</p>
    </div>
  );
};

class CustomToolbar extends Toolbar {
  render() {
    const { messages, label } = this.props;

    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <Button
            variant="raised"
            color="primary"
            size="small"
            className="rbc-btn rbc-btn--today"
            onClick={() => this.navigate('TODAY')}
          >
            {messages.today}
          </Button>
        </span>
        <div className="rbc-toolbar__heading">
          <IconButton
            className={'rbc-toolbar__pager-button rbc-toolbar__pager-button--prev'}
            onClick={() => this.navigate('PREV')}
            color="primary"
            aria-label="Previous"
            variant="flat"
          >
            <ArrowBack />
          </IconButton>
          <h2 className="rbc-toolbar__label">{label}</h2>
          <IconButton
            className={'rbc-toolbar__pager-button rbc-toolbar__pager-button--next'}
            onClick={() => this.navigate('NEXT')}
            color="primary"
            aria-label="Next"
          >
            <ArrowForward />
          </IconButton>
        </div>

        <span className="rbc-btn-group rbc-btn-group--views">{this.viewNamesGroup(messages)}</span>
      </div>
    );
  }
}

const components = {
  event: CalendarEvent,
  toolbar: CustomToolbar,
};

const onSelectEvent = (event) => {
  const url = event.data.attributes.path
    ? event.data.attributes.path.alias
    : `/node/${event.data.attributes.nid}`;
  window.location.href = url;
};

const EventCalendar = props => (
  <BigCalendar
    components={components}
    events={props.events}
    onSelectEvent={onSelectEvent}
    titleAccessor={titleAccessor}
    startAccessor={startAccessor}
    endAccessor={endAccessor}
    onNavigate={props.onNavigate}
    onView={props.onView}
    defaultView={props.defaultView}
    defaultDate={props.defaultDate}
    popup
    views={['month', 'week', 'day']}
    elementProps={{
      style: {
        height: 'calc(100vh - 26rem)',
      },
    }}
    min={new Date('Jan 1, 2000 07:00:00')}
    max={new Date('Jan 1, 2000 22:00:00')}
  />
);

EventCalendar.propTypes = {
  events: PropTypes.arrayOf(Object).isRequired,
  onNavigate: PropTypes.func,
  onView: PropTypes.func,
  defaultDate: PropTypes.instanceOf(Date),
  defaultView: PropTypes.string,
};

EventCalendar.defaultProps = {
  onNavigate: null,
  onView: null,
  defaultDate: new Date(),
  defaultView: 'month',
};

export default EventCalendar;
