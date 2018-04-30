import React from 'react';
import PropTypes from 'prop-types';
import interceptClient from 'interceptClient';
import { connect } from 'react-redux';
import { moment } from 'moment';

const { constants, select } = interceptClient;
const c = constants;

const RoomReservationSummary = (props) => (
  <article className="room-res-summary">
    <p className="room-res-summary__location">{props.location}</p>
    <h3 className="room-res-summary__room">{props.room}</h3>
    <span className="room-res-summary__date">{select.getDayDisplay(props.start)}</span>
    <span className="room-res-summary__time">{`${select.getTimeDisplay(props.start)} to ${select.getTimeDisplay(props.end)}`}</span>
  </article>
);


RoomReservationSummary.propTypes = {
  room: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  start: PropTypes.instanceOf(Date).isRequired,
  end: PropTypes.instanceOf(Date).isRequired,
};

const mapStateToProps = (state, ownProps) => {
  const roomId = select.getIdentifier(c.TYPE_ROOM, ownProps[c.TYPE_ROOM]);
  const room = select.record(roomId)(state);

  return {
    room: select.recordLabel(roomId)(state),
    location: select.recordLabel(room.data.relationships.field_location)(state),
  };
};

export default connect(mapStateToProps)(RoomReservationSummary);
