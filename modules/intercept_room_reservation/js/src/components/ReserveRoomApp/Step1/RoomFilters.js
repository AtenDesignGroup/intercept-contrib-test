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
import InputNumber from 'intercept/Input/InputNumber';

const { constants } = interceptClient;
const c = constants;
const ATTENDEES = 'attendees';

const labels = {
  [c.TYPE_LOCATION]: 'Location',
  [c.TYPE_ROOM_TYPE]: 'Room Type',
  [ATTENDEES]: 'Number of Attendees',
};

const attendeesOptions = [
  { key: '0', value: 'none' },
  { key: '5', value: '5+' },
  { key: '10', value: '10+' },
  { key: '20', value: '20+' },
  { key: '50', value: '50+' },
  { key: '100', value: '100+' },
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
