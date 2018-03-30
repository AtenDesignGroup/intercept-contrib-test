import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import map from 'lodash/map';
import { withStyles } from 'material-ui/styles';
import interceptClient from 'interceptClient';
// Components
import DateFilter from 'intercept/DateFilter';
import SelectEventType from 'intercept/SelectEventType';
import SelectLocation from 'intercept/SelectLocation';
import SelectAudience from 'intercept/SelectAudience';
import SelectTag from 'intercept/SelectTag';

const { select, api } = interceptClient;

const styles = theme => ({

});

class EventFilters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        type: [],
        location: [],
        startDate: [],
        endDate: [],
        audience: [],
        tag: [],
      },
    };

    this.onFilterChange = this.onFilterChange.bind(this);
    this.onDateChange = this.onFilterChange('date').bind(this);
    this.onEventTypeChange = this.onFilterChange('type').bind(this);
    this.onLocationChange = this.onFilterChange('location').bind(this);
    this.onAudienceChange = this.onFilterChange('audience').bind(this);
    this.onTagChange = this.onFilterChange('tag').bind(this);
  }

  onFilterChange(key) {
    return (event) => {
      const newFilters = { ...this.state.filters, [key]: event.target.value };
      this.setState({ filters: newFilters });
      this.props.onChange(newFilters);
    };
  }

  render() {
    return (
      <div>
        <h3 className="visually-hidden">Filters</h3>
        <SelectEventType handleChange={this.onEventTypeChange} />
        <DateFilter handleChange={this.onDateChange} />
        <SelectLocation handleChange={this.onLocationChange} />
        <SelectAudience handleChange={this.onAudienceChange} />
        <SelectTag handleChange={this.onTagChange} />
      </div>
    );
  }
}

EventFilters.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(EventFilters);
