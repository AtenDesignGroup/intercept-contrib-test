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

// Formsy
import Formsy, { addValidationRule } from 'formsy-react';

// Local Components
import ReserveRoomConfirmation from './ReserveRoomConfirmation';
import FindARoom from './../FindARoom';

const { constants, select } = interceptClient;
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
addValidationRule('isFutureDate', (values, value) => value >= matchTime(new Date(), value));
addValidationRule('isFutureTime', (values, value) => value > new Date());
addValidationRule('isAfterStart', (values, value) => value > values.start);
addValidationRule('isOnOrAfterStart', (values, value) => value >= values.start);
addValidationRule('isBeforeEnd', (values, value) => value < values.end);
addValidationRule('isOnOrBeforeEnd', (values, value) => value <= values.end);
addValidationRule('isAfterMeetingStart', (values, value) => value > values.meetingStart);

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
    this.onCloseDialog = this.onCloseDialog.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onOpenDialog = this.onOpenDialog.bind(this);
    this.onSwitchChange = this.onSwitchChange.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.onRoomSelect = this.onRoomSelect.bind(this);

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

  onSwitchChange(key) {
    return (event) => {
      this.updateValue(key, event.target.checked);
      this.setState({
        expand: {
          ...this.state.expand,
          [key]: event.target.checked,
        },
      });
    };
  }

  onRoomSelect = (id) => {
    this.collapse('findRoom')();
    this.onValueChange(c.TYPE_ROOM)(id);
  };

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

  render() {
    const { values, meetingPurpose } = this.props;
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
          <div className="l--subsection input-group--find-room">
            <h4 className="">Choose a Room</h4>

            <SelectResource
              multiple={false}
              type={c.TYPE_ROOM}
              handleChange={this.onInputChange(c.TYPE_ROOM)}
              value={values[c.TYPE_ROOM]}
              label={'Room'}
              required
              name={c.TYPE_ROOM}
            />
            <Button
              variant="raised"
              color="secondary"
              size="small"
              onClick={this.expand('findRoom')}
            >
              Browse Rooms
            </Button>
          </div>

          <div className="l--subsection">
            <h4 className="">Choose a Time</h4>
            <div className="input-group--date-time">
              <InputDate
                handleChange={this.onDateChange}
                defaultValue={null}
                value={values[c.DATE]}
                name={c.DATE}
                required
                clearable={false}
                validations="isFutureDate"
                validationError="Date must be in the future"
              />
              <InputTime
                clearable
                label="Start Time"
                value={values.start}
                onChange={this.onValueChange('start')}
                name="start"
                required
                validations="isFutureTime"
                validationError="Must be in the future"
              />
              <InputTime
                clearable
                label="End Time"
                value={values.end}
                onChange={this.onValueChange('end')}
                name="end"
                required
                validations={{
                  isFutureTime: true,
                  isAfterStart: true,
                }}
                validationErrors={{
                  isFutureTime: 'Must be in the future',
                  isAfterStart: 'Must be after start time',
                }}
              />
            </div>
            <Button
              variant="raised"
              color="secondary"
              size="small"
              onClick={this.expand('findRoom')}
            >
              Find a Time
            </Button>
          </div>
          <div className="l--subsection--tight">
            <h4 className="">Groups</h4>
            <ExpansionPanel
              elevation={0}
              expanded={this.state.expand.meeting}
              onChange={this.toggleState('meeting')}
              className={'input-group input-group--expandable'}
            >
              <ExpansionPanelSummary expandIcon={null} className={'input-group__summary'}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.meeting}
                      onChange={this.onSwitchChange('meeting')}
                      value="meeting"
                      name="meeting"
                    />
                  }
                  label="Hosting a group?"
                  className={'input__label'}
                />
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={'input-group__details'}>
                <div className="input-group--date-time">
                  <InputTime
                    clearable
                    label="Meeting Start Time"
                    value={values.meetingStart}
                    onChange={this.onValueChange('meetingStart')}
                    name="meetingStart"
                    required={values.meeting}
                    validations={{
                      isFutureTime: true,
                      isOnOrAfterStart: true,
                      isOnOrBeforeEnd: true,
                    }}
                    validationErrors={{
                      isFutureTime: 'Must be in the future',
                      isOnOrAfterStart: 'Must be on or after reservation start time',
                      isOnOrBeforeEnd: 'Must be on or before reservation end time',
                    }}
                  />
                  <InputTime
                    clearable
                    label="Meeting End Time"
                    value={values.meetingEnd}
                    onChange={this.onValueChange('meetingEnd')}
                    name="meetingEnd"
                    required={values.meeting}
                    validations={{
                      isFutureTime: true,
                      isOnOrBeforeEnd: true,
                      isAfterMeetingStart: true,
                    }}
                    validationErrors={{
                      isFutureTime: 'Must be in the future',
                      isOnOrBeforeEnd: 'Must be on or before reservation end time',
                      isAfterMeetingStart: 'Must be after meeting start time',
                    }}
                  />
                </div>
                <InputNumber
                  label="Number of Attendees"
                  value={values.attendees}
                  onChange={this.onValueChange('attendees')}
                  name={'attendees'}
                  min={0}
                  int
                  required={values.meeting}
                  validations="isPositive"
                  validationError="Attendees must be a positive number"
                />
                <InputText
                  label="Group Name"
                  onChange={this.onValueChange('groupName')}
                  value={values.groupName}
                  name="groupName"
                  required={values.meeting}
                  validations={'isRequiredIfMeeting'}
                  validationError={'This field is required if having a meeting'}
                />
                <SelectResource
                  type={c.TYPE_MEETING_PURPOSE}
                  name={c.TYPE_MEETING_PURPOSE}
                  handleChange={this.onInputChange(c.TYPE_MEETING_PURPOSE)}
                  value={values.meetingPurpose}
                  label={'Meeting Purpose'}
                  required={values.meeting}
                />
                <Collapse in={showMeetingPurposeExplanation}>
                  <InputText
                    label="Please Explain"
                    onChange={this.onValueChange('meetingDetails')}
                    value={values.meetingDetails}
                    name="meetingDetails"
                    required={showMeetingPurposeExplanation}
                  />
                </Collapse>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </div>
          <div className="l--subsection--tight">
            <h4 className="">Refreshments</h4>
            <ExpansionPanel
              elevation={0}
              expanded={this.state.expand.refreshments}
              onChange={this.toggleState('refreshments')}
              className={'input-group input-group--expandable'}
            >
              <ExpansionPanelSummary expandIcon={null} className={'input-group__summary'}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.refreshments}
                      onChange={this.onSwitchChange('refreshments')}
                      value="refreshments"
                      name="refreshments"
                    />
                  }
                  label="Serving light refreshments?"
                  className={'input__label'}
                />
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={'input-group__details'}>
                <InputText
                  label="Please describe your light refreshments."
                  value={values.refreshmentsDesc}
                  onChange={this.onValueChange('refreshmentsDesc')}
                  name="refreshmentDesc"
                  required={values.refreshments}
                  validations={'isRequiredIfServingRefreshments'}
                  validationError={'This field is required if serving refreshments'}
                />
              </ExpansionPanelDetails>
            </ExpansionPanel>
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
              Reserve
            </Button>
          </div>
        </Formsy>
        <ReserveRoomConfirmation
          open={this.state.openDialog}
          onCancel={this.onCloseDialog}
          onConfirm={() => {
            this.onCloseDialog();
          }}
          values={values}
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
          <div className="dialog__panel">
            <FindARoom onSelect={this.onRoomSelect} />
          </div>
        </Dialog>
      </div>
    );
  }
}

ReserveRoomForm.propTypes = {
  values: PropTypes.shape({
    [c.TYPE_ROOM]: PropTypes.string,
    date: PropTypes.instanceOf(Date),
    start: PropTypes.instanceOf(Date),
    end: PropTypes.instanceOf(Date),
    attendees: PropTypes.number,
    groupName: PropTypes.string,
    meetings: PropTypes.bool,
    meetingStart: PropTypes.instanceOf(Date),
    meetingEnd: PropTypes.instanceOf(Date),
    meetingDetails: PropTypes.string,
    [c.TYPE_MEETING_PURPOSE]: PropTypes.string,
    refreshments: PropTypes.bool,
    refreshmentsDesc: PropTypes.string,
    user: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
  meetingPurpose: PropTypes.object,
};

ReserveRoomForm.defaultProps = {
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
  meetingPurpose: null,
};

const mapStateToProps = (state, ownProps) => ({
  meetingPurpose: ownProps.values[c.TYPE_MEETING_PURPOSE]
    ? select.record(
      select.getIdentifier(c.TYPE_MEETING_PURPOSE, ownProps.values[c.TYPE_MEETING_PURPOSE]),
    )(state)
    : null,
});

export default connect(mapStateToProps)(ReserveRoomForm);
