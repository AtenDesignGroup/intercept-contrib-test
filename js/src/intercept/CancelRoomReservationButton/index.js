import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import interceptClient from 'interceptClient';
const { constants, api, select } = interceptClient;
const c = constants;
import { connect } from 'react-redux';

class CancelRoomReservationButton extends PureComponent {
  render() {
    return (<Button onClick={this.props.onClick(this.props.reservation)}>Cancel</Button>);
  }
}

CancelRoomReservationButton.propTypes = {
    id: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  reservation: select.record({type: c.TYPE_ROOM_RESERVATION, id: ownProps.id})(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: (reservation) => () => {
    const data = { ...reservation.data };
    data.attributes.field_status = { "value": "canceled" };
    dispatch(interceptClient.actions.edit(data, c.TYPE_ROOM_RESERVATION, ownProps.id));
    dispatch(interceptClient.api[c.TYPE_ROOM_RESERVATION].sync(ownProps.id));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(CancelRoomReservationButton);
