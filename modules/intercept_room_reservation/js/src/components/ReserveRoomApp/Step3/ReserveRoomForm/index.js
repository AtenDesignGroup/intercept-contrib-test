// React
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Intercept
import interceptClient from 'interceptClient';
import drupalSettings from 'drupalSettings';

// Material UI
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AppBar from '@material-ui/core/AppBar';
import Dialog from '@material-ui/core/Dialog';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Collapse from '@material-ui/core/Collapse';

// Intercept Components
import SelectResource from 'intercept/SelectResource';
import InputDate from 'intercept/Input/InputDate';
import InputTime from 'intercept/Input/InputTime';
import InputNumber from 'intercept/Input/InputNumber';
import InputText from 'intercept/Input/InputText';
import InputCheckbox from 'intercept/Input/InputCheckbox';

// Formsy
import Formsy, { addValidationRule } from 'formsy-react';

// Local Components
import ReserveRoomConfirmation from './ReserveRoomConfirmation';

const { constants, select, utils } = interceptClient;
const c = constants;

const matchTime = (original, ref) => {
  if (ref instanceof Date === false || original instanceof Date === false) {
    return ref;
  }
  const output = new Date();
  output.setTime(original.getTime());
  output.setHours(ref.getHours());
  output.setMinutes(ref.getMinutes());
  output.setSeconds(ref.getSeconds());
  output.setMilliseconds(ref.getMilliseconds());
  return output;
};
const matchDate = (original, ref) => matchTime(ref, original);

const purposeRequiresExplanation = meetingPurpose =>
  meetingPurpose && meetingPurpose.data.attributes.field_requires_explanation;

addValidationRule('isRequired', (values, value) => value !== '');
addValidationRule('isPositive', (values, value) => value > 0);
addValidationRule(
  'isRequiredIfServingRefreshments',
  (values, value) => !values.refreshments || value !== '',
);
addValidationRule('isRequiredIfMeeting', (values, value) => !values.meeting || value !== '');
// addValidationRule('isFutureDate', (values, value) => value >= matchTime(new Date(), value));
// // addValidationRule('isFutureTime', (values, value) => value > new Date());
// addValidationRule('isAfterStart', (values, value) => value > values.start);
// addValidationRule('isOnOrAfterStart', (values, value) => value >= values.start);
// addValidationRule('isBeforeEnd', (values, value) => value < values.end);
// addValidationRule('isOnOrBeforeEnd', (values, value) => value <= values.end);
// addValidationRule('isAfterMeetingStart', (values, value) => value > values.meetingStart);

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class ReserveRoomForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      expand: {
        refreshments: false,
        meeting: false,
        confirm: false,
        findRoom: false,
        findTime: false,
      },
      openDialog: false,
      canSubmit: false,
    };

    this.form = React.createRef();

    this.toggleState = this.toggleState.bind(this);
    this.updateValue = this.updateValue.bind(this);
    this.updateValues = this.updateValues.bind(this);
    this.toggleValue = this.toggleValue.bind(this);
    this.onCloseDialog = this.onCloseDialog.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onOpenDialog = this.onOpenDialog.bind(this);
    // this.onSwitchChange = this.onSwitchChange.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    // this.onRoomSelect = this.onRoomSelect.bind(this);

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

  onDateChange(value) {
    const start = matchDate(this.props.values.start, value);
    const end = matchDate(this.props.values.end, value);
    this.updateValues({
      [c.DATE]: value,
      start,
      end,
    });
  }

  onStartChange(value) {
    const start = matchTime(value, this.props.values.start);
    const end = matchTime(value, this.props.values.end);
    this.updateValues({
      [c.DATE]: value,
      start,
      end,
    });
  }

  // onSwitchChange(key) {
  //   return (event) => {
  //     this.updateValue(key, event.target.checked);
  //     this.setState({
  //       expand: {
  //         ...this.state.expand,
  //         [key]: event.target.checked,
  //       },
  //     });
  //   };
  // }

  // onRoomSelect = (id) => {
  //   this.collapse('findRoom')();
  //   this.onValueChange(c.TYPE_ROOM)(id);
  // };

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

  toggleState(key) {
    return () => {
      this.setState({
        expand: {
          ...this.state.expand,
          [key]: !this.state.expand[key],
        },
      });
    };
  }

  expand(key) {
    return () => {
      this.setState({
        expand: {
          ...this.state.expand,
          [key]: true,
        },
      });
    };
  }

  collapse(key) {
    return () => {
      this.setState({
        expand: {
          ...this.state.expand,
          [key]: false,
        },
      });
    };
  }

  updateValue(key, value) {
    const newValues = { ...this.props.values, [key]: value };
    this.props.onChange(newValues);
  }

  updateValues(value) {
    const newValues = { ...this.props.values, ...value };
    this.props.onChange(newValues);
  }

  toggleValue(key) {
    this.updateValue(key, !this.props.values[key]);
  }

  render() {
    const { values, combinedValues, meetingPurpose, room } = this.props;
    const showMeetingPurposeExplanation = !!purposeRequiresExplanation(meetingPurpose);

    return (
      <div className="form">
        <Formsy
          className="form__main"
          ref={this.form}
          onValidSubmit={this.onOpenDialog}
          onValid={this.enableButton}
          onInvalid={this.disableButton}
        >
        <div className="l--2-col">
          <div className="l__main">
            <div className="l__primary">
              <h4 className="section-title section-title--secondary">Reservation Details</h4>
              <InputNumber
                label="Number of Attendees"
                value={values.attendees}
                onChange={this.onValueChange('attendees')}
                name={'attendees'}
                min={0}
                int
                required={!utils.userIsStaff()}
                validations="isPositive"
                validationError="Attendees must be a positive number"
              />
              <InputText
                label="Group Name"
                onChange={this.onValueChange('groupName')}
                value={values.groupName}
                name="groupName"
                helperText={'Help others find you by name.'}
              />
              <SelectResource
                type={c.TYPE_MEETING_PURPOSE}
                name={c.TYPE_MEETING_PURPOSE}
                handleChange={this.onInputChange(c.TYPE_MEETING_PURPOSE)}
                value={values.meetingPurpose}
                label={'Purpose for using this room'}
                required={!utils.userIsStaff()}
              />
              <InputText
                label="Description"
                onChange={this.onValueChange('meetingDetails')}
                value={values.meetingDetails}
                name="meetingDetails"
                required={showMeetingPurposeExplanation}
              />
            </div>
            <div className="l__secondary">
              <h4 className="section-title section-title--secondary">Refreshments</h4>
              <InputCheckbox
                label="Serving light refreshments?"
                checked={values.refreshments}
                onChange={this.toggleValue}
                value="refreshments"
                name="refreshments"
              />
              <InputText
                label="Please describe your light refreshments."
                value={values.refreshmentsDesc}
                onChange={this.onValueChange('refreshmentsDesc')}
                name="refreshmentDesc"
                required={values.refreshments}
                disabled={!values.refreshments}
              />
            </div>
          </div>
          <div className="form__actions l__footer">
            <Button
              variant="raised"
              size="large"
              color="primary"
              type="submit"
              className="button button--primary"
              disabled={!this.state.canSubmit || !room}
            >
              Reserve
            </Button>
          </div>
        </div>
        </Formsy>
        <ReserveRoomConfirmation
          open={this.state.openDialog}
          onCancel={this.onCloseDialog}
          onConfirm={() => {
            this.onCloseDialog();
          }}
          values={{
            ...combinedValues,
            [c.TYPE_ROOM]: room,
          }}
        />

        <Dialog
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
        </Dialog>
      </div>
    );
  }
}

ReserveRoomForm.propTypes = {
  values: PropTypes.shape({
    attendees: PropTypes.number,
    groupName: PropTypes.string,
    meetingDetails: PropTypes.string,
    [c.TYPE_MEETING_PURPOSE]: PropTypes.string,
    refreshments: PropTypes.bool,
    refreshmentsDesc: PropTypes.string,
    user: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
  meetingPurpose: PropTypes.object,
  combinedValues: PropTypes.object,
  room: PropTypes.string,
};

ReserveRoomForm.defaultProps = {
  values: {
    attendees: 1,
    groupName: '',
    meetingPurpose: '',
    meetingDetails: '',
    refreshments: false,
    refreshmentsDesc: '',
    user: drupalSettings.intercept.user.uuid,
  },
  meetingPurpose: null,
  room: '',
};

const mapStateToProps = (state, ownProps) => ({
  meetingPurpose: ownProps.values[c.TYPE_MEETING_PURPOSE]
    ? select.record(
      select.getIdentifier(c.TYPE_MEETING_PURPOSE, ownProps.values[c.TYPE_MEETING_PURPOSE]),
    )(state)
    : null,
});

export default connect(mapStateToProps)(ReserveRoomForm);
