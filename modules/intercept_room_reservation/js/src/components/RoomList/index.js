import React, { Component } from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';
import interceptClient from 'interceptClient';
import RoomTeaser from 'intercept/RoomTeaser';
import ContentList from 'intercept/ContentList';

class RoomList extends Component {
  state = {};

  render() {
    const { rooms } = this.props;

    const teasers = items =>
      items.map(item => ({
        key: item.data.id,
        node: <RoomTeaser id={item.data.id} className="room-teaser" />,
      }));

    const list =
      rooms.length > 0 ? (
        <ContentList
          items={teasers(rooms)}
          key={0}
        />
      ) : (
        <p key={0}>No rooms have been loaded.</p>
      );

    return <div className="rooms-list">{list}</div>;
  }
}

RoomList.propTypes = {
  rooms: PropTypes.arrayOf(Object).isRequired,
};

export default RoomList;
