import React from 'react';
import PropTypes from 'prop-types';
import RoomTeaser from 'intercept/RoomTeaser';
import ContentList from 'intercept/ContentList';

class RoomList extends React.PureComponent {
  render() {
    const { rooms, teaserProps, TeaserComponent } = this.props;

    const teasers = items =>
      items.map(item => ({
        key: item.data.id,
        node: <TeaserComponent uuid={item.data.id} id={item.data.id}className="room-teaser" {...teaserProps} />,
      }));

    const list =
      rooms.length > 0 ? (
        <ContentList items={teasers(rooms)} key={0} />
      ) : (
        <p key={0}>No rooms have been loaded.</p>
      );

    return <div className="rooms-list">{list}</div>;
  }
}

RoomList.propTypes = {
  rooms: PropTypes.arrayOf(Object).isRequired,
  TeaserComponent: PropTypes.func,
  teaserProps: PropTypes.object,
};

RoomList.defaultProps = {
  TeaserComponent: RoomTeaser,
  teaserProps: {},
};

export default RoomList;
