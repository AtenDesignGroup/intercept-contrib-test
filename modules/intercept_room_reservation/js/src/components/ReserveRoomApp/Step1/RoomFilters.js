// React
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Formsy from 'formsy-react';

// Lodash
import map from 'lodash/map';

// Intercept
import interceptClient from 'interceptClient';

// Components
import CurrentFilters from 'intercept/CurrentFilters';
import DateFilter from 'intercept/DateFilter';
import KeywordFilter from 'intercept/KeywordFilter';
import SelectResource from 'intercept/SelectResource';
import SelectSingle from 'intercept/Select/SelectSingle';
import InputDate from 'intercept/Input/InputDate';
import InputNumber from 'intercept/Input/InputNumber';

const { constants } = interceptClient;
const c = constants;
const ATTENDEES = 'attendees';
const TIME = 'time';
const DURATION = 'duration';

const labels = {
  [c.TYPE_LOCATION]: 'Location',
  [c.TYPE_ROOM_TYPE]: 'Room Type',
  [ATTENDEES]: 'Number of Attendees',
  [DURATION]: 'Duration',
  [TIME]: 'Time of Day',
};

const durationOptions = [
  { key: '15', value: '15 min.' },
  { key: '30', value: '30 min.' },
  { key: '60', value: '1 hr.' },
  { key: '120', value: '2 hrs.' },
  { key: '240', value: '4 hrs.' },
];

const timeOptions = [
  { key: '8:00-22:00', value: 'Any' },
  { key: '8:00-12:00', value: 'Morning' },
  { key: '12:00-5:00', value: 'Afternoon' },
  { key: '5:00-10:00', value: 'Evening' },
];

const currentFiltersConfig = filters =>
  map(filters, (value, key) => ({
    key,
    value,
    label: labels[key],
    type: key,
  }));

class EventFilters extends PureComponent {
  onFilterChange = (key, value) => {
    const newFilters = { ...this.props.filters, [key]: value };
    this.props.onChange(newFilters);
  }

  onInputChange = (key) => {
    return (event) => {
      this.onFilterChange(key, event.target.value);
    };
  }

  onDateChange = (value) => {
    this.onFilterChange(c.DATE, value);
  }

  onAttendeesChange = (value) => {
    this.onFilterChange(ATTENDEES, value);
  }

  render() {
    const { showDate, filters } = this.props;
    let currentFilters = currentFiltersConfig(filters);
    if (!showDate) {
      currentFilters = currentFilters.filter(f => f.key !== c.DATE);
    }

    return (
      <div className="">
        <h3 className="">Filter Rooms</h3>
        <Formsy className="">
          <SelectResource
            multiple
            type={c.TYPE_LOCATION}
            name={c.TYPE_LOCATION}
            handleChange={this.onInputChange(c.TYPE_LOCATION)}
            value={filters[c.TYPE_LOCATION]}
            label={labels[c.TYPE_LOCATION]}
          />
          <SelectResource
            multiple
            type={c.TYPE_ROOM_TYPE}
            name={c.TYPE_ROOM_TYPE}
            handleChange={this.onInputChange(c.TYPE_ROOM_TYPE)}
            value={filters[c.TYPE_ROOM_TYPE]}
            label={labels[c.TYPE_ROOM_TYPE]}
          />
          <InputDate
            handleChange={this.onDateChange}
            defaultValue={null}
            value={filters[c.DATE]}
            name={c.DATE}
            required
            clearable={false}
            validations="isFutureDate"
            validationError="Date must be in the future"
          />
          <SelectSingle
            name={TIME}
            handleChange={this.onInputChange(TIME)}
            value={filters[TIME]}
            label={labels[TIME]}
            options={timeOptions}
            clearable
          />
          <SelectSingle
            name={DURATION}
            handleChange={this.onInputChange(DURATION)}
            value={filters[DURATION]}
            label={labels[DURATION]}
            options={durationOptions}
            clearable
          />
          <InputNumber
            label={labels[ATTENDEES]}
            value={filters[ATTENDEES]}
            onChange={this.onAttendeesChange}
            name={'attendees'}
            min={0}
            int
            // validations="isPositive"
            // validationError="Attendees must be a positive number"
          />
        </Formsy>
      </div>
    );
  }
}

EventFilters.propTypes = {
  onChange: PropTypes.func.isRequired,
  showDate: PropTypes.bool,
  filters: PropTypes.object,
};

EventFilters.defaultProps = {
  showDate: true,
  filters: {},
};

export default EventFilters;
