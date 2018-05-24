// React
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Components
import Button from '@material-ui/core/Button';

// Intercept
import DialogConfirm from 'intercept/Dialog/DialogConfirm';
import interceptClient from 'interceptClient';

const { constants, api, select } = interceptClient;
const c = constants;

// Local Components
import EventRegisterConfirmation from '../EventRegisterApp/EventRegisterConfirmation';
import EventRegistrationStatus from '../EventRegisterApp/EventRegistrationStatus';

const actionProperties = {
  default: {
    status: '',
    text: '',
    heading: '',
  },
  cancel: {
    status: 'canceled',
    heading: 'Are you sure you want to cancel this registration?',
    text: null,
  },
  deny: {
    status: 'denied',
    heading: 'Confirm decline',
    text: 'Confirm decline',
  },
  approve: {
    status: 'approved',
    heading: 'Confirm approval',
    text: 'Confirm approval',
  },
};

class EventRegistrationActions extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      action: 'default',
    };
    this.onCancel = this.onCancel.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onConfirm = this.props.onConfirm.bind(this);
  }

  onClose() {
    this.onCancel();
  }

  onCancel() {
    this.setState({
      open: false,
    });
  }

  onClick(action) {
    return () => {
      this.setState({
        open: true,
        action,
      });
    };
  }

  render() {
    const { actions, id } = this.props;

    return (
      <div>
        {actions.length > 0 && (
          actions.map(action => (
            <Button
              key={action}
              onClick={this.onClick(action)}
              variant="raised"
              color="primary"
            >
              {action}
            </Button>
          ))
        )}
        <EventRegisterConfirmation
          open={this.state.open}
          onClose={this.onClose}
          onConfirm={this.onConfirm}
          onCancel={this.onCancel}
          uuid={id}
          text={actionProperties[this.state.action].text}
          heading={actionProperties[this.state.action].heading}
        />
      </div>
    );
  }
}

EventRegistrationActions.propTypes = {
  id: PropTypes.string.isRequired,
  actions: PropTypes.array,
  entity: PropTypes.object,
  onConfirm: PropTypes.func,
};

EventRegistrationActions.defaultProps = {
  entity: null,
  onConfirm: null,
  actions: [],
};

const mapStateToProps = (state, ownProps) => ({
  entity: select.record({ type: c.TYPE_EVENT_REGISTRATION, id: ownProps.id })(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onConfirm() {
    const data = this.props.entity.data;
    data.attributes.status = actionProperties[this.state.action].status;
    dispatch(interceptClient.actions.edit(data, c.TYPE_EVENT_REGISTRATION, this.props.id));
    return this.props.id;
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EventRegistrationActions);
