import React from 'react';
import PropTypes from 'prop-types';
import interceptClient from 'interceptClient';
import { connect } from 'react-redux';

const { constants, select, utils } = interceptClient;
const c = constants;

const RoomReservationSummary = props => (
  <article className="reservation-summary">
    <p className="reservation-summary__location">{props.location}</p>
    <h3 className="reservation-summary__room">{props.room}</h3>
    <span className="reservation-summary__date">{utils.getDayDisplay(props.start)}&nbsp;</span>
    <span className="reservation-summary__time">{`${utils.getTimeDisplay(
      props.start,
    )} to ${utils.getTimeDisplay(props.end)}`}</span>
  </article>
);

RoomReservationSummary.propTypes = {
  room: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  start: PropTypes.instanceOf(Date).isRequired,
  end: PropTypes.instanceOf(Date).isRequired,
};

const mapStateToProps = (state, ownProps) => {
  const roomId = ownProps[c.TYPE_ROOM];

  return {
    room: select.roomLabel(roomId)(state),
    location: select.roomLocationLabel(roomId)(state),
  };
};

export default connect(mapStateToProps)(RoomReservationSummary);
