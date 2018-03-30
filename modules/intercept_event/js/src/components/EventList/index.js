import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import map from 'lodash/map';
import EventTeaser from 'intercept/EventTeaser';

const styles = theme => ({});

class EventList extends Component {
  state = {};

  render() {
    const { events } = this.props;

    const list =
      Object.keys(events).length > 0 ? (
        map(events, id => <EventTeaser key={id} id={id} className="event-teaser" />)
      ) : (
        <p>No events have been loaded.</p>
      );

    return <div className="eventsList">{list}</div>;
  }
}

EventList.propTypes = {
  events: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default withStyles(styles, { withTheme: true })(EventList);
