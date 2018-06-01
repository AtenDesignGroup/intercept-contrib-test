import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import interceptClient from 'interceptClient';

// Material UI
import CircularProgress from '@material-ui/core/CircularProgress';

import EventRegisterForm from './EventRegisterForm';
import EventRegistrationList from './../EventRegistrationList';

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
    this.props.fetchRegistrations(this.props.eventId);
  }

  render() {
    const { registrations, registrationsLoading } = this.props;

    let content = <CircularProgress size={50} />;

    if (!registrationsLoading) {
      content =
        onlyActiveOrWaitlist(registrations).length > 0 ? (
          <EventRegistrationList items={registrations.map(r => r.data.id)} />
        ) : (
          <EventRegisterForm {...this.props} />
        );
    }

    return <div className="l--offset">{content}</div>;
  }
}

EventRegisterApp.propTypes = {
  registrations: PropTypes.array,
  event: PropTypes.object,
  user: PropTypes.object,
  segments: PropTypes.arrayOf(PropTypes.object),
  eventId: PropTypes.string.isRequired,
  fetchEvent: PropTypes.func.isRequired,
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
  registrations: select.eventRegistrationsByEvent(ownProps.eventId)(state),
  registrationsLoading: select.recordsAreLoading(c.TYPE_EVENT_REGISTRATION)(state),
  event: select.record(select.getIdentifier(c.TYPE_EVENT, ownProps.eventId))(state),
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
            value: ownProps.user.uid,
            path: 'field_user.uid',
          },
        },
      }),
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EventRegisterApp);
