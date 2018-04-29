// React
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Formsy
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

const { constants } = interceptClient;
const c = constants;

const labels = {
  [c.TYPE_EVENT_TYPE]: 'Event Type',
  [c.TYPE_LOCATION]: 'Location',
  [c.TYPE_AUDIENCE]: 'Audience',
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
        <Formsy className="filters__inputs">
          <KeywordFilter
            handleChange={this.onInputChange(c.KEYWORD)}
            value={filters[c.KEYWORD]}
            name={c.KEYWORD}
            label={labels[c.KEYWORD]}
          />
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
            type={c.TYPE_EVENT_TYPE}
            name={c.TYPE_EVENT_TYPE}
            handleChange={this.onInputChange(c.TYPE_EVENT_TYPE)}
            value={filters[c.TYPE_EVENT_TYPE]}
            label={labels[c.TYPE_EVENT_TYPE]}
          />
          <SelectResource
            multiple
            type={c.TYPE_AUDIENCE}
            name={c.TYPE_AUDIENCE}
            handleChange={this.onInputChange(c.TYPE_AUDIENCE)}
            value={filters[c.TYPE_AUDIENCE]}
            label={labels[c.TYPE_AUDIENCE]}
          />
          {showDate && (
            <DateFilter handleChange={this.onDateChange} defaultValue={null} value={filters.date} name="date" />
          )}
        </Formsy>
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
