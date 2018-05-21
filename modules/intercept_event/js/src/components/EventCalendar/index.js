import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BigCalendar from 'intercept/BigCalendar';
import Toolbar from 'react-big-calendar/lib/Toolbar';
import ArrowBack from '@material-ui/icons/ArrowBack';
import ArrowForward from '@material-ui/icons/ArrowForward';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import EventSummaryDialog from './EventSummaryDialog';
import interceptClient from 'interceptClient';

const { utils } = interceptClient;

const dateAccessor = prop => item =>
  utils.dateFromDrupal(item.data.attributes.field_date_time[prop]);
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

class EventCalendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showEvent: false,
      selectedEvent: null,
    };

    this.onSelectEvent = this.onSelectEvent.bind(this);
    this.onHideEvent = this.onHideEvent.bind(this);
  }

  onSelectEvent(event) {
    this.setState({
      showEvent: true,
      selectedEvent: event.data.id,
    });
  }

  onHideEvent() {
    this.setState({
      showEvent: false,
    });
  }

  render() {
    return (
      <React.Fragment>
        <BigCalendar
          timeZoneName={utils.getUserTimezone()}
          components={components}
          events={this.props.events}
          onSelectEvent={this.onSelectEvent}
          titleAccessor={titleAccessor}
          startAccessor={startAccessor}
          endAccessor={endAccessor}
          onNavigate={this.props.onNavigate}
          onView={this.props.onView}
          defaultView={this.props.defaultView}
          defaultDate={this.props.defaultDate}
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
        <EventSummaryDialog
          id={this.state.selectedEvent}
          open={this.state.showEvent}
          onClose={this.onHideEvent}
        />
      </React.Fragment>
    );
  }
}

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
