import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import debounce from 'lodash/debounce';
import interceptClient from 'interceptClient';
import drupalSettings from 'drupalSettings';
// import ViewSwitcher from 'intercept/ViewSwitcher';
// import PageSpinner from 'intercept/PageSpinner';
import RoomFilters from './../RoomFilters';
import RoomList from './../RoomList';

const { constants, api, select } = interceptClient;
const c = constants;

function getPublishedFilters(value = true) {
  return {
    published: {
      path: 'status',
      value: value ? '1' : '0',
    },
  };
}

function filterRooms(rooms, filters) {
  return rooms;
}

class FindARoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {},
    };
    this.onFilterChange = this.onFilterChange.bind(this);
  }

  onFilterChange(filters) {
    this.setState({ filters });
  }


  render() {
    const { rooms, onSelect } = this.props;
    const { filters } = this.state;

    return (
      <div className="l--offset">
        <div className="l__main">
          <div className="l__primary">
            <RoomFilters onChange={this.onFilterChange} filters={filters} />
            <RoomList rooms={filterRooms(rooms ,filters)} onSelect={onSelect} />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  rooms: select.roomsAscending(state),
});

FindARoom.propTypes = {
  rooms: PropTypes.arrayOf(Object).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(FindARoom);
