import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';


// Intercept
/* eslint-disable */
import interceptClient from 'interceptClient';
import LoadingIndicator from 'intercept/LoadingIndicator';
/* eslint-enable */

import EventRegisterForm from './EventRegisterForm';
import EventRegistrationTable from './EventRegistrationTable';

const { api, select } = interceptClient;
const c = interceptClient.constants;

function onlyActiveOrWaitlist(registrations) {
  return registrations.filter(
    r => r.data.attributes.status === 'active' || r.data.attributes.status === 'waitlist',
  );
}

class EventRegisterApp extends React.Component {
  componentDidMount() {
    this.props.fetchSegments();
    this.props.fetchEvent(this.props.eventId);
    this.props.fetchUser(this.props.user.uuid);
    this.props.fetchRegistrations(this.props.eventId);
  }

  render() {
    const { registrations, registrationsLoading, eventId } = this.props;

    if (registrationsLoading) {
      return <LoadingIndicator loading />;
    }

    const form = onlyActiveOrWaitlist(registrations).length <= 0
      ? <EventRegisterForm {...this.props} />
      : null;
    const table = registrations.length > 0 ? <EventRegistrationTable eventId={eventId} /> : null;

    return (<div className="l--offset">
      {form}
      {table}
    </div>);
  }
}

EventRegisterApp.propTypes = {
  registrations: PropTypes.array,
  event: PropTypes.object,
  user: PropTypes.object.isRequired,
  segments: PropTypes.arrayOf(PropTypes.object),
  eventId: PropTypes.string.isRequired,
  fetchEvent: PropTypes.func.isRequired,
  fetchUser: PropTypes.func.isRequired,
  fetchRegistrations: PropTypes.func.isRequired,
  fetchSegments: PropTypes.func.isRequired,
  registrationsLoading: PropTypes.bool.isRequired,
  eventsLoading: PropTypes.bool.isRequired,
  segmentsLoading: PropTypes.bool.isRequired,
};

EventRegisterApp.defaultProps = {
  event: null,
  registrations: [],
  segments: [],
};

const mapStateToProps = (state, ownProps) => ({
  registrations: select.eventRegistrationsByEventByUser(ownProps.eventId, ownProps.user.uuid)(state),
  registrationsLoading: select.recordsAreLoading(c.TYPE_EVENT_REGISTRATION)(state),
  event: select.record(select.getIdentifier(c.TYPE_EVENT, ownProps.eventId))(state),
  users: select.record(select.getIdentifier(c.TYPE_USER, ownProps.user.uuid))(state),
  eventsLoading: select.recordsAreLoading(c.TYPE_EVENT)(state),
  segments: select.recordOptions(c.TYPE_POPULATION_SEGMENT)(state),
  segmentsLoading: select.recordsAreLoading(c.TYPE_POPULATION_SEGMENT)(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchEvent: (id) => {
    dispatch(
      api[c.TYPE_EVENT].fetchAll({
        filters: {
          uuid: {
            value: id,
            path: 'uuid',
          },
        },
      }),
    );
  },
  fetchUser: (id) => {
    dispatch(
      api[c.TYPE_USER].fetchAll({
        filters: {
          uuid: {
            value: id,
            path: 'uuid',
          },
        },
      }),
    );
  },
  fetchSegments: (
    options = {
      fields: {
        [c.TYPE_POPULATION_SEGMENT]: ['name', 'uuid', 'weight'],
      },
    },
  ) => {
    dispatch(api[c.TYPE_POPULATION_SEGMENT].fetchAll(options));
  },
  fetchRegistrations: (eventId) => {
    dispatch(
      api[c.TYPE_EVENT_REGISTRATION].fetchAll({
        filters: {
          event: {
            value: eventId,
            path: 'field_event.uuid',
          },
          user: {
            value: ownProps.user.id,
            path: 'field_user.uid',
          },
        },
      }),
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EventRegisterApp);
