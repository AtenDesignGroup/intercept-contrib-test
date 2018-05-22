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

const ActionProperties = {
  cancel: {
    status: 'canceled',
    text: 'Confirm cancellation',
    heading: 'Confirm cancel',
  },
  deny: {
    status: 'denied',
    text: 'Confirm decline',
    heading: 'Confirm decline',
  },
  approve: {
    status: 'approved',
    text: 'Confirm approval',
    heading: 'Confirm approval',
  },
}

class EventActionButtons extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      action: false,
    };
  }

  onClose () {
    this.onCancel();
  }

  onCancel () {
    this.setState({
      open: false,
    });
  }

  onClick (action) {
    this.setState({
      open: true,
      text: this.getActionProperties(action).text,
      heading: this.getActionProperties(action).text,
      action: action,
    });
  }

  getActionProperties(action) {
    return ActionProperties[action];
  }

  render() {
    const { actions } = this.props;

    return (
      <div>
        <div>
          {actions.map(action => (
            <Button
              key={action}
              onClick={this.onClick.bind(this, action)}
            >{action}
            </Button>
          ))}
        </div>
        <EventRegistrationStatus
          uuid={this.props.id}
        ></EventRegistrationStatus>
        <EventRegisterConfirmation
          open={this.state.open}
          onClose={this.onClose.bind(this)}
          onConfirm={this.props.onConfirm.bind(this)}
          onCancel={this.onCancel.bind(this)}
          text={this.state.text}
          heading={this.state.heading}
        />
      </div>
    );
  }
}

EventActionButtons.propTypes = {
  id: PropTypes.string.isRequired,
  actions: PropTypes.array.isRequired,
  entity: PropTypes.object,
  onConfirm: PropTypes.func,
};

const mapStateToProps = (state, ownProps) => ({
  entity: select.record({type: c.TYPE_EVENT_REGISTRATION, id: ownProps.id})(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onConfirm () {
    const data = this.props.entity.data;
    data.attributes.status = this.getActionProperties(this.state.action).status;
    dispatch(interceptClient.actions.edit(data, c.TYPE_EVENT_REGISTRATION, this.props.id));
    return this.props.id;
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(EventActionButtons);
