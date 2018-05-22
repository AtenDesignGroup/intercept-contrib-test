import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import interceptClient from 'interceptClient';
import FieldInline from 'intercept/FieldInline';
import Teaser from 'intercept/Teaser';

const { select, constants, utils } = interceptClient;
const c = constants;

class RegistrationTeaser extends PureComponent {
  render() {
    const { id, registration, event, image, actions } = this.props;

    const date = moment(utils.dateFromDrupal(event.attributes['field_date_time'].value));

    return (
      <Teaser
        key={id}
        modifiers={[image ? 'with-image' : 'without-image']}
        title={event.attributes.title}
        titleUrl={
          event.attributes.path ? event.attributes.path.alias : `/node/${event.attributes.nid}`
        }
        image={image}
        supertitle={get(event, 'relationships.field_location.attributes.title')}
        date={{
          month: date.utcOffset(utils.getUserUtcOffset()).format('MMM'),
          date: date.utcOffset(utils.getUserUtcOffset()).format('D'),
          time: utils.getTimeDisplay(date),
        }}
        footer={registrationProps => (actions)}
        description={event.attributes['field_text_teaser'].value}
      />
    );
  }
}

RegistrationTeaser.propTypes = {
  id: PropTypes.string.isRequired,
  registration: PropTypes.object.isRequired,
  event: PropTypes.object,
  image: PropTypes.string,
  actions: PropTypes.object,
};

RegistrationTeaser.defaultProps = {
  image: null,
  event: null,
  actions: []
};

const mapStateToProps = (state, ownProps) => {
  const identifier = select.getIdentifier(c.TYPE_EVENT_REGISTRATION, ownProps.id);
  const registration = select.bundle(identifier)(state);
  const event = get(registration, 'relationships.field_event');
  const event_identifier = select.getIdentifier(c.TYPE_EVENT, event.id);
  return {
    registration: registration,
    image: select.resourceImageStyle(event_identifier, '4to3_740x556')(state),
    event: event
  };
};

export default connect(mapStateToProps)(RegistrationTeaser);
