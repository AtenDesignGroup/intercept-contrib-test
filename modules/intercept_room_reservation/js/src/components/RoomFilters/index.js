// React
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Lodash
import map from 'lodash/map';

// Intercept
import interceptClient from 'interceptClient';

// Components
import CurrentFilters from 'intercept/CurrentFilters';
import DateFilter from 'intercept/DateFilter';
import KeywordFilter from 'intercept/KeywordFilter';
import SelectResource from 'intercept/SelectResource';

const { constants } = interceptClient;
const c = constants;

const labels = {
  [c.TYPE_LOCATION]: 'Location',
  [c.TYPE_ROOM_TYPE]: 'Room Type',
  [c.DATE]: 'Date',
  [c.KEYWORD]: 'Keyword',
};

const currentFiltersConfig = filters =>
  map(filters, (value, key) => ({
    key,
    value,
    label: labels[key],
    type: key,
  }));

class EventFilters extends PureComponent {
  constructor(props) {
    super(props);

    this.onFilterChange = this.onFilterChange.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  onFilterChange(key, value) {
    const newFilters = { ...this.props.filters, [key]: value };
    this.props.onChange(newFilters);
  }

  onInputChange(key) {
    return (event) => {
      this.onFilterChange(key, event.target.value);
    };
  }

  onDateChange(value) {
    this.onFilterChange(c.DATE, value);
  }

  render() {
    const { showDate, filters } = this.props;
    let currentFilters = currentFiltersConfig(filters);
    if (!showDate) {
      currentFilters = currentFilters.filter(f => f.key !== c.DATE);
    }

    return (
      <div className="filters">
        <h3 className="filters__heading">Filter</h3>
        <div className="filters__inputs">
          <SelectResource
            type={c.TYPE_LOCATION}
            handleChange={this.onInputChange(c.TYPE_LOCATION)}
            value={filters[c.TYPE_LOCATION]}
            label={labels[c.TYPE_LOCATION]}
          />
          <SelectResource
            type={c.TYPE_ROOM_TYPE}
            handleChange={this.onInputChange(c.TYPE_ROOM_TYPE)}
            value={filters[c.TYPE_ROOM_TYPE]}
            label={labels[c.TYPE_ROOM_TYPE]}
          />
          {showDate && (
            <DateFilter handleChange={this.onDateChange} defaultValue={null} value={filters.date} />
          )}
        </div>
        <div className="filters__current">
          <CurrentFilters filters={currentFilters} onChange={this.onFilterChange} />
        </div>
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
