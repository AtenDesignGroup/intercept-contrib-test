// React
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Intercept
import interceptClient from 'interceptClient';
import drupalSettings from 'drupalSettings';

// Components
import Button from 'material-ui/Button';
import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from 'material-ui/ExpansionPanel';
import { FormControlLabel } from 'material-ui/Form';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// Dialog
import AppBar from 'material-ui/AppBar';
import Dialog from 'material-ui/Dialog';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from 'material-ui/transitions/Slide';
import Collapse from 'material-ui/transitions/Collapse';
import InputIncrementer from 'intercept/Input/InputIncrementer';

import Formsy, { addValidationRule } from 'formsy-react';
import EventRegisterConfirmation from './EventRegisterConfirmation';

const { constants, select } = interceptClient;
const c = constants;

addValidationRule('isRequired', (values, value) => value !== '');
addValidationRule('isPositive', (values, value) => value >= 0);

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class EventRegisterForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      openDialog: false,
      canSubmit: false,
      values: {},
    };

    this.form = React.createRef();

    this.updateValue = this.updateValue.bind(this);
    this.updateValues = this.updateValues.bind(this);
    this.onCloseDialog = this.onCloseDialog.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onOpenDialog = this.onOpenDialog.bind(this);
    this.onValueChange = this.onValueChange.bind(this);

    this.disableButton = this.disableButton.bind(this);
    this.enableButton = this.enableButton.bind(this);
  }

  onInputChange(key) {
    return (event) => {
      this.updateValue(key, event.target.value);
    };
  }

  onValueChange(key) {
    return (value) => {
      this.updateValue(key, value);
    };
  }

  onOpenDialog = () => {
    this.setState({ openDialog: true });
  };

  onCloseDialog = () => {
    this.setState({ openDialog: false });
  };

  disableButton() {
    this.setState({ canSubmit: false });
  }

  enableButton() {
    this.setState({ canSubmit: true });
  }

  updateValue(key, value) {
    const values = { ...this.props.values, [key]: value };
    this.setState({ values });
  }

  updateValues(value) {
    const values = { ...this.props.values, ...value };
    this.setState({ values });
  }

  render() {
    const { values, segments } = this.props;

    return (
      <div className="form">
        <h2 className="form__heading">Number of Attendees?</h2>
        <Formsy
          className="form__main"
          ref={this.form}
          onValidSubmit={this.onOpenDialog}
          onValid={this.enableButton}
          onInvalid={this.disableButton}
        >
          <div className="l--subsection input-group--find-room">
            {segments.map(s => (<InputIncrementer
              label={s.value}
              value={values[s.key] || 0}
              onChange={this.onValueChange(s.key)}
              key={s.key}
              name={s.key}
              min={0}
              int
              required={values.meeting}
              validations="isPositive"
              validationError="Attendees must be a positive number"
            />))}

          </div>

          <div className="form__actions">
            <Button
              variant="raised"
              size="small"
              color="primary"
              type="submit"
              className="button button--primary"
              disabled={!this.state.canSubmit}
            >
              Register
            </Button>
          </div>
        </Formsy>
        <EventRegisterConfirmation
          open={this.state.openDialog}
          onCancel={this.onCloseDialog}
          onConfirm={() => {
            this.onCloseDialog();
          }}
          values={values}
        />

        {/* <Dialog
          fullScreen
          open={this.state.expand.findRoom}
          onClose={() => {}}
          transition={Transition}
          className="dialog dialog--fullscreen"
        >
          <AppBar className={'dialog__app-bar app-bar'}>
            <Toolbar>
              <IconButton color="inherit" onClick={this.collapse('findRoom')} aria-label="Close">
                <CloseIcon />
              </IconButton>
              <Typography variant="title" color="inherit" className={'app-bar_heading'}>
                Find a Room
              </Typography>
            </Toolbar>
          </AppBar>
          <div className="dialog__panel">
            <FindARoom onSelect={this.onRoomSelect} />
          </div>
        </Dialog> */}
      </div>
    );
  }
}

EventRegisterForm.propTypes = {
  values: PropTypes.shape({}),
};

EventRegisterForm.defaultProps = {
  values: {
    [c.TYPE_ROOM]: '',
    date: new Date(),
    start: new Date(),
    end: new Date(),
    attendees: 1,
    groupName: '',
    meetings: false,
    meetingStart: new Date(),
    meetingEnd: new Date(),
    meetingPurpose: '',
    meetingDetails: '',
    refreshments: false,
    refreshmentsDesc: '',
    user: drupalSettings.intercept.user.uuid,
  },
};

const mapStateToProps = (state, ownProps) => ({
  // meetingPurpose: ownProps.values[c.TYPE_MEETING_PURPOSE]
  //   ? select.record(
  //     select.getIdentifier(c.TYPE_MEETING_PURPOSE, ownProps.values[c.TYPE_MEETING_PURPOSE]),
  //   )(state)
  //   : null,
});

export default connect(mapStateToProps)(EventRegisterForm);
