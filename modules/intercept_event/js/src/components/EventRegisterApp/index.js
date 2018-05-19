import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import interceptClient from 'interceptClient';

import EventRegisterForm from './EventRegisterForm';

const { api, select } = interceptClient;
const c = interceptClient.constants;

class EventRegisterApp extends React.Component {
  componentDidMount() {
    this.props.fetchEvent(this.props.eventId);
    this.props.fetchSegments();
  }

  render() {
    return (
      <div className="l--offset">
        <EventRegisterForm {...this.props} />
      </div>
    );
  }
}

EventRegisterApp.propTypes = {
  event: PropTypes.object,
  user: PropTypes.object,
  segments: PropTypes.arrayOf(PropTypes.object),
  eventId: PropTypes.string.isRequired,
  fetchEvent: PropTypes.func.isRequired,
  fetchSegments: PropTypes.func.isRequired,
};

EventRegisterApp.defaultProps = {
  event: null,
  segments: [],
};

const mapStateToProps = (state, ownProps) => ({
  event: select.record(select.getIdentifier(c.TYPE_EVENT, ownProps.eventId))(state),
  segments: select.recordOptions(c.TYPE_POPULATION_SEGMENT)(state),
});

const mapDispatchToProps = dispatch => ({
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
  fetchSegments: (options = {}) => {
    dispatch(api[c.TYPE_POPULATION_SEGMENT].fetchAll(options));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EventRegisterApp);
