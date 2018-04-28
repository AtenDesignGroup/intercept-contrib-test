import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import interceptClient from 'interceptClient';
import FieldInline from 'intercept/FieldInline';
import Teaser from 'intercept/Teaser';

const { select, constants } = interceptClient;
const c = constants;

class ReservationTeaser extends PureComponent {
  render() {
    const { id, reservation, image, actions } = this.props;


    const attendeeCount = get(reservation, 'attributes.field_attendee_count');
    const attendee = attendeeCount ? (
      <FieldInline
        label="Attendees"
        key="attendee"
        values={{ id: 'attendee', name: attendeeCount }}
      />
    ) : null;


    return (
      <Teaser
        key={id}
        title={get(reservation, 'attributes.title')}
        modifiers={[image ? 'with-image' : 'without-image']}
        image={image}
        supertitle={get(reservation, 'attributes.location')}
        footer={roomProps => (actions)}
                
        tags={[attendee]}
        description={get(reservation, 'attributes.field_group_name')}
      />
    );
  }
}

ReservationTeaser.propTypes = {
  id: PropTypes.string.isRequired,
  reservation: PropTypes.object.isRequired,
  image: PropTypes.string,
  actions: PropTypes.object,
};

ReservationTeaser.defaultProps = {
  image: null,
  actions: []
};

const mapStateToProps = (state, ownProps) => {
  const identifier = select.getIdentifier(c.TYPE_ROOM_RESERVATION, ownProps.id);
  const reservation = select.bundle(identifier)(state);
  const room = get(reservation, 'relationships.field_room');
  return {
    reservation: reservation,
    image: select.resourceImageStyle(room, '4to3_740x556')(state),
  };
};

export default connect(mapStateToProps)(ReservationTeaser);
