import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
// import momentTimezone from 'moment-timezone';
import get from 'lodash/get';
import interceptClient from 'interceptClient';
import FieldInline from './../FieldInline';
import Teaser from './../Teaser';
import ButtonRegister from './../ButtonRegister';
import EventRegistrationStatus from '../../../../modules/intercept_event/js/src/components/EventRegisterApp/EventRegistrationStatus';
import RegistrationStatus from './../RegistrationStatus';

const { select, constants, utils } = interceptClient;
const c = constants;
class EventTeaser extends PureComponent {
  render() {
    const { id, event, image } = this.props;

    const termMap = item => ({
      id: item.id,
      name: get(item, 'attributes.name'),
    });

    const date = moment(utils.dateFromDrupal(event.attributes['field_date_time'].value));

    const audienceValues = event.relationships['field_event_audience']
      .map(termMap)
      .filter(i => i.id);

    const audiences =
      audienceValues.length > 0 ? (
        <FieldInline label="Audience" key="audience" values={audienceValues} />
      ) : null;

    return (
      <Teaser
        key={id}
        modifiers={[image ? 'with-image' : 'without-image']}
        image={image}
        supertitle={get(event, 'relationships.field_location.attributes.title')}
        title={event.attributes.title}
        titleUrl={
          event.attributes.path ? event.attributes.path.alias : `/node/${event.attributes.nid}`
        }
        date={{
          month: date.utcOffset(utils.getUserUtcOffset()).format('MMM'),
          date: date.utcOffset(utils.getUserUtcOffset()).format('D'),
          time: utils.getTimeDisplay(date),
        }}
        description={event.attributes['field_text_teaser'].value}
        tags={[audiences]}
        footer={props => (<React.Fragment>
            <ButtonRegister event={props.event} />
            <RegistrationStatus event={props.event} />
          </React.Fragment>
        )}
        event={event}
      />
    );
  }
}

EventTeaser.propTypes = {
  id: PropTypes.string.isRequired,
  event: PropTypes.object.isRequired,
  image: PropTypes.string,
};

EventTeaser.defaultProps = {
  image: null,
};

const mapStateToProps = (state, ownProps) => {
  const identifier = select.getIdentifier(c.TYPE_EVENT, ownProps.id);

  return {
    event: select.bundle(identifier)(state),
    image: select.resourceImageStyle(identifier, '4to3_740x556')(state),
  };
};

export default connect(mapStateToProps)(EventTeaser);
