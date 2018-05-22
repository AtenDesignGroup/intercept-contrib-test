import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import interceptClient from 'interceptClient';

import ButtonRegister from 'intercept/ButtonRegister';

const { api, select } = interceptClient;
const c = interceptClient.constants;

class EventRegisterButtonApp extends React.Component {
  componentDidMount() {
    this.props.fetchEvent(this.props.eventId);
  }

  render() {
    return (
      <div className="event-register-button__inner">
        {this.props.event && <ButtonRegister {...this.props} event={this.props.event.data} />}
      </div>
    );
  }
}

EventRegisterButtonApp.propTypes = {
  event: PropTypes.object,
  user: PropTypes.object,
  eventId: PropTypes.string.isRequired,
  fetchEvent: PropTypes.func.isRequired,
};

EventRegisterButtonApp.defaultProps = {
  event: null,
};

const mapStateToProps = (state, ownProps) => ({
  event: select.record(select.getIdentifier(c.TYPE_EVENT, ownProps.eventId))(state),
});

const mapDispatchToProps = dispatch => ({
  fetchEvent: (id) => {
    dispatch(
      // @todo: Add support for fetching a single entity rather than fetching all filtered by uuid.
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
});

export default connect(mapStateToProps, mapDispatchToProps)(EventRegisterButtonApp);
