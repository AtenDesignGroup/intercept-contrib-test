/* eslint-disable react/no-multi-comp */

import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import interceptClient from 'interceptClient';

import moment from 'moment';

import get from 'lodash/get';
import memoize from 'lodash/memoize';
import uniqBy from 'lodash/uniqBy';

import PrintableEventSummary from './PrintableEventSummary';
import PrintableLocationLegend from './PrintableLocationLegend';

const { select, constants, utils } = interceptClient;
const c = constants;

const daysOfTheWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

class PrintableMonth extends React.Component {
  constructor(props) {
    super(props);
    this.datesInRange = memoize(this.constructor.datesInRange.bind(this));
    this.eventList = this.constructor.eventList.bind(this);
    this.eventLocations = memoize(this.constructor.eventLocations.bind(this));
  }

  render() {
    const { date, events } = this.props;
    const dates = this.datesInRange(date);
    const locations = this.eventLocations(events);
    const header = daysOfTheWeek.map(day => (
      <div key={day} className={'print-cal__cell rbc-header'}>
        <span className={'print-cal__cell-day'}>{day}</span>
      </div>
    ));

    const days = dates.map(day => (
      <div key={day.key} className={'print-cal__cell'}>
        <h3 className={'print-cal__cell-day'}>{day.label}</h3>
        {this.eventList(day.key, events)}
      </div>
    ));

    return (
      <div className={'print-cal'}>
        <div className={'print-cal__header'}>{header}</div>
        <div className={'print-cal__body'}>{days}</div>
        <PrintableLocationLegend locations={locations} />
      </div>
    );
  }
}

PrintableMonth.title = date => moment.tz(date, utils.getUserTimezone()).format('MMMM YYYY');

PrintableMonth.navigate = (date, action) => {
  switch (action) {
    case 'PREV':
      return moment
        .tz(date, utils.getUserTimezone())
        .subtract(1, 'months')
        .toDate();

    case 'NEXT':
      return moment
        .tz(date, utils.getUserTimezone())
        .add(1, 'months')
        .toDate();

    default:
      return date;
  }
};

PrintableMonth.datesInRange = (date) => {
  const dates = [];
  const startDate = moment
    .tz(date, utils.getUserTimezone())
    .startOf('month')
    .startOf('week');
  const endDate = moment
    .tz(date, utils.getUserTimezone())
    .endOf('month')
    .endOf('week')
    .toDate();
  const currentDate = startDate.clone();

  while (currentDate.toDate() <= endDate) {
    dates.push({
      date: currentDate.toDate(),
      key: currentDate.format('MMDD'),
      label: currentDate.format('DD'),
      day: currentDate.format('ddd'),
    });
    currentDate.add(1, 'days');
  }
  return dates;
};

PrintableMonth.eventList = (day, events) => {
  const items = events.filter(
    item =>
      moment(utils.dateFromDrupal(get(item, 'data.attributes.field_date_time.value')))
        .tz(utils.getUserTimezone())
        .format('MMDD') === day,
  );

  if (items.length > 0) {
    return (
      <div className={'print-cal__cell-events'}>
        {items.map(item => (
          <PrintableEventSummary id={item.data.id} key={item.data.id} />
        ))}
      </div>
    );
  }

  return null;
};

PrintableMonth.eventLocations = (events) => {
  const getId = i => get(i, 'data.relationships.field_location.data.id');
  return uniqBy(events, getId).map(getId);
};

PrintableMonth.propTypes = {
  date: PropTypes.instanceOf(Date),
  events: PropTypes.array,
};

PrintableMonth.defaultProps = {
  events: [],
  date: new Date(),
};

export default PrintableMonth;
