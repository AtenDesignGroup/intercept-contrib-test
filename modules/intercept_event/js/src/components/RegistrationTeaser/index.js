// React
import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Lodash
import get from 'lodash/get';

// Moment
import moment from 'moment';

// Intercept
import interceptClient from 'interceptClient';

// Intercept Components
import FieldInline from 'intercept/FieldInline';
import Teaser from 'intercept/Teaser';
import TeaserStub from 'intercept/Teaser/TeaserStub';
import EventRegistrationActions from './../EventRegistrationActions';

const { select, constants, utils } = interceptClient;
const c = constants;

class RegistrationTeaser extends React.PureComponent {
  render() {
    const { id, registration, event, image } = this.props;

    // Render a stub teaser until the entity has fully loaded.
    if (!event.attributes) {
      return <TeaserStub />;
    }
    const status = get(registration, 'attributes.status');;
    const date = moment(utils.dateFromDrupal(event.attributes['field_date_time'].value));
    let actions = [];
    let statusMessage;

    switch (status) {
      case 'active':
        actions = ['cancel'];
        statusMessage = 'Registeration Confirmed';
        break;
      case 'canceled':
        actions = [];
        statusMessage = ['Canceled'];
        break;
      case 'waitlist':
        actions = ['cancel'];
        statusMessage = 'Added to Waitlist';
        break;
      default:
        break;
    }

    return (
      <Teaser
        key={id}
        modifiers={[image ? 'with-image' : 'without-image', status]}
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
        footer={() => (
          <React.Fragment>
            {statusMessage && <p className="action-button__message">{statusMessage}</p>}
            <EventRegistrationActions id={id} actions={actions} />
          </React.Fragment>
        )}
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
};

RegistrationTeaser.defaultProps = {
  image: null,
  event: null,
};

const mapStateToProps = (state, ownProps) => {
  const identifier = select.getIdentifier(c.TYPE_EVENT_REGISTRATION, ownProps.id);
  const registration = select.bundle(identifier)(state);
  const event = get(registration, 'relationships.field_event');
  const eventIdentifier = select.getIdentifier(c.TYPE_EVENT, event.id);

  return {
    registration,
    image: select.resourceImageStyle(eventIdentifier, '4to3_740x556')(state),
    event,
  };
};

export default connect(mapStateToProps)(RegistrationTeaser);
