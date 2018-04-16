import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import interceptClient from 'interceptClient';
import FieldInline from './../FieldInline';
import Teaser from './../Teaser';

const { select, constants } = interceptClient;
const c = constants;

class RoomTeaser extends PureComponent {
  render() {
    const { id, room, image } = this.props;

    const termMap = item => ({
      id: item.id,
      name: get(item, 'attributes.name'),
    });


    const roomTypeValues = get(room, 'relationships.field_room_type');
    const roomTypes =
      roomTypeValues.id ? (
        <FieldInline label="Room Type" key="roomType" values={termMap(roomTypeValues)} />
      ) : null;

    const capacityValue = get(room, 'attributes.field_capacity_max');
    const capicity = capacityValue ? (
      <FieldInline
        label="Capicity"
        key="capacity"
        values={{ id: 'capacity', name: capacityValue }}
      />
    ) : null;

    return (
      <Teaser
        key={id}
        modifiers={[image ? 'with-image' : 'without-image']}
        image={image}
        supertitle={get(room, 'relationships.field_location.attributes.title')}
        title={room.attributes.title}
        description={get(room, 'attributes.field_text_teaser.value')}
        tags={[roomTypes, capicity]}
      />
    );
  }
}

RoomTeaser.propTypes = {
  id: PropTypes.string.isRequired,
  room: PropTypes.object.isRequired,
  image: PropTypes.string,
};

RoomTeaser.defaultProps = {
  image: null,
};

const mapStateToProps = (state, ownProps) => {
  const identifier = select.getIdentifier(c.TYPE_ROOM, ownProps.id);

  return {
    room: select.bundle(identifier)(state),
    image: select.resourceImageStyle(identifier, '4to3_740x556')(state),
  };
};

export default connect(mapStateToProps)(RoomTeaser);
