import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import get from 'lodash/get';
import interceptClient from 'interceptClient';
import FieldInline from './../FieldInline';
import Teaser from './../Teaser';

const { select, constants } = interceptClient;
const c = constants;
class EventTeaser extends Component {
  render() {
    const { id, event, image } = this.props;

    const termMap = item => ({
      id: item.id,
      name: get(item, 'attributes.name'),
    });

    const date = moment(`${event.attributes['field_date_time'].value}Z`, moment.ISO_8601);

    const eventTypeValues = event.relationships['field_event_type'].map(termMap).filter(i => i.id);
    const eventTypes =
      eventTypeValues.length > 0 ? (
        <FieldInline label="Event type" key="eventType" values={eventTypeValues} />
      ) : null;

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
          month: date.format('MMM'),
          date: date.format('D'),
          time: date.format('h:mm a').replace('m', '.m.'),
        }}
        description={event.attributes['field_text_teaser']}
        tags={[eventTypes, audiences]}
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

const mapStateToProps = (state, ownProps) => ({
  event: select.bundle(select.getIdentifier(c.TYPE_EVENT, ownProps.id))(state),
  image: select.eventImageStyle(ownProps.id, '4to3_740x556')(state),
  location: select.record(select.getIdentifier(c.TYPE_LOCATION)),
});

export default connect(mapStateToProps)(EventTeaser);
