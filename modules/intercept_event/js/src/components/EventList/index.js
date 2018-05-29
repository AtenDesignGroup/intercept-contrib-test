import React, { Component } from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';
import interceptClient from 'interceptClient';
import EventTeaser from 'intercept/EventTeaser';
import ContentList from 'intercept/ContentList';

class EventList extends Component {
  state = {};

  render() {
    const { events } = this.props;

    const teasers = items =>
      items.map(id => ({
        key: id,
        node: <EventTeaser id={id} className="event-teaser" />,
      }));

    const list =
      events.length > 0 ? (
        map(events, group => (
          <ContentList
            heading={interceptClient.utils.getDayDisplay(group.date)}
            items={teasers(group.items)}
            key={group.key}
          />
        ))
      ) : (
        <p key={0}>No events have been loaded.</p>
      );

    return <div className="events-list">{list}</div>;
  }
}

EventList.propTypes = {
  events: PropTypes.arrayOf(Object).isRequired,
};

export default EventList;
