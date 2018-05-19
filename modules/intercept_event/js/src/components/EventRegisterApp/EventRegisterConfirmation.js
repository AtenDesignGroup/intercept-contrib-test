import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import v4 from 'uuid/v4';
import map from 'lodash/map';
import interceptClient from 'interceptClient';
import DialogConfirm from 'intercept/Dialog/DialogConfirm';
// import RoomReservationSummary from './RoomReservationSummary';
import EventRegistrationStatus from './EventRegistrationStatus';

const { actions, api, constants, select, utils } = interceptClient;
const c = constants;

const buildRoomReservation = (values) => {
  const uuid = v4();

  const output = {
    id: uuid,
    type: c.TYPE_EVENT_REGISTRATION,
    attributes: {
      uuid,
    },
    relationships: {
      field_event: {
        data: {
          type: c.TYPE_EVENT,
          id: values.event,
        },
      },
      field_registrants: {
        data: map(values.registrants, (value, id) => ({
          type: c.TYPE_POPULATION_SEGMENT,
          id,
          meta: {
            count: value,
          },
        })),
      },
      field_user: {
        data: {
          type: c.TYPE_USER,
          id: values.user,
        },
      },
    },
  };
  return output;
};

class EventRegisterConfirmation extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      uuid: null,
    };

    this.handleConfirm = this.handleConfirm.bind(this);
  }

  handleConfirm() {
    const { onConfirm, values, save } = this.props;
    const entity = buildRoomReservation(values);
    this.setState({
      uuid: entity.id,
    });
    save(entity);
    // onConfirm();
  }

  render() {
    const { open, onCancel, values } = this.props;
    const { uuid } = this.state;

    const content = uuid ? (
      <EventRegistrationStatus uuid={uuid} />
    ) : null;

    const dialogProps = uuid
      ? {
        confirmText: null,
        cancelText: 'Close',
        heading: '',
        onConfirm: () => {
          window.location.href = '/account/room-reservations';
        },
        onCancel,
      }
      : {
        confirmText: 'Submit',
        cancelText: 'Cancel',
        heading: 'Confirm Registration',
        onConfirm: this.handleConfirm,
        onCancel,
      };

    return (
      <DialogConfirm {...dialogProps} open={open}>
        {content}
      </DialogConfirm>
    );
  }
}

EventRegisterConfirmation.propTypes = {
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  open: PropTypes.bool,
  save: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
};

EventRegisterConfirmation.defaultProps = {
  onConfirm: null,
  onCancel: null,
  open: false,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  save: (data) => {
    dispatch(actions.add(data, c.TYPE_EVENT_REGISTRATION, data.id));
    dispatch(api[c.TYPE_EVENT_REGISTRATION].sync(data.id));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EventRegisterConfirmation);
