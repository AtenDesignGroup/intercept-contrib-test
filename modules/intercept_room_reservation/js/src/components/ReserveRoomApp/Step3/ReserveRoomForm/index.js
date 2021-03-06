// React
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Lodash
import get from 'lodash/get';

// Intercept
import interceptClient from 'interceptClient';
import drupalSettings from 'drupalSettings';

// UUID
import v4 from 'uuid/v4';

// Material UI
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';

// Intercept Components
import SelectResource from 'intercept/SelectResource';
import SelectUser from 'intercept/SelectUser';
import InputDate from 'intercept/Input/InputDate';
import InputTime from 'intercept/Input/InputTime';
import InputNumber from 'intercept/Input/InputNumber';
import InputText from 'intercept/Input/InputText';
import InputCheckbox from 'intercept/Input/InputCheckbox';

// Formsy
import Formsy, { addValidationRule } from 'formsy-react';

// Local Components
import ReserveRoomConfirmation from './ReserveRoomConfirmation';
import ReservationTeaser from './../../../ReservationTeaser';

const { actions, constants, select, utils } = interceptClient;
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

const purposeRequiresExplanation = meetingPurpose =>
  meetingPurpose && meetingPurpose.data.attributes.field_requires_explanation;

addValidationRule('isRequired', (values, value) => value !== '');
addValidationRule('isPositive', (values, value) => value > 0);
addValidationRule(
  'isRequiredIfServingRefreshments',
  (values, value) => !values.refreshments || value !== '',
);
addValidationRule('isRequiredIfMeeting', (values, value) => !values.meeting || value !== '');
addValidationRule('isGreaterOrEqualTo', (values, value, min) => min === null || value >= min);
addValidationRule('isLesserOrEqualTo', (values, value, max) => max === null || value <= max);

const buildRoomReservation = (values) => {
  const uuid = v4();
  const output = {
    id: uuid,
    type: c.TYPE_ROOM_RESERVATION,
    attributes: {
      uuid,
      field_attendee_count: values.attendees,
      field_dates: {
        value: utils.dateToDrupal(utils.getDateFromTime(values.start, values.date)),
        end_value: utils.dateToDrupal(utils.getDateFromTime(values.end, values.date)),
      },
      field_group_name: values.groupName,
      field_meeting_dates: {
        value: values.meetingStart
          ? utils.dateToDrupal(utils.getDateFromTime(values.meetingStart, values.date))
          : null,
        end_value: values.meetingEnd
          ? utils.dateToDrupal(utils.getDateFromTime(values.meetingEnd, values.date))
          : null,
      },
      field_meeting_purpose_details: values.meetingDetails,
      field_refreshments: values.refreshments,
      field_refreshments_description: {
        value: values.refreshmentsDesc,
      },
      field_status: 'requested',
    },
    relationships: {
      field_event: {
        data: values[c.TYPE_EVENT]
          ? {
            type: c.TYPE_EVENT,
            id: values[c.TYPE_EVENT],
          }
          : null,
      },
      field_room: {
        data: {
          type: c.TYPE_ROOM,
          id: values[c.TYPE_ROOM],
        },
      },
      field_meeting_purpose: {
        data: values[c.TYPE_MEETING_PURPOSE]
          ? {
            type: c.TYPE_MEETING_PURPOSE,
            id: values[c.TYPE_MEETING_PURPOSE],
          }
          : null,
      },
      field_user: {
        data: {
          type: c.TYPE_USER,
          id: values.user,
        },
      },
    },
  };
  return output;
};

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
      uuid: null,
    };

    this.toggleState = this.toggleState.bind(this);
    this.updateValue = this.updateValue.bind(this);
    this.updateValues = this.updateValues.bind(this);
    this.toggleValue = this.toggleValue.bind(this);
    this.onCloseDialog = this.onCloseDialog.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onOpenDialog = this.onOpenDialog.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.disableButton = this.disableButton.bind(this);
    this.enableButton = this.enableButton.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { values } = this.props;
    const valuesChanged = prevProps.values.attendees !== values.attendees;

    if (valuesChanged) {
      this.forceUpdate();
    }
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

  onValueUserChange(key) {
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

  saveEntitytoStore = (values) => {
    const { save } = this.props;
    const entity = buildRoomReservation(values);
    this.setState({
      uuid: entity.id,
    });
    save(entity);
    return entity.id;
  };

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
    const {
      availabilityQuery,
      combinedValues,
      event,
      hasConflict,
      meetingPurpose,
      room,
      roomCapacity,
      values,
    } = this.props;
    const showMeetingPurposeExplanation = !!purposeRequiresExplanation(meetingPurpose);

    let content = null;

    this.form = React.createRef();

    if (this.state.uuid) {
      content = <ReservationTeaser id={this.state.uuid} />;
    }
    else {
      content = (
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
                <div className="l--subsection">
                  <h4 className="section-title section-title--secondary">Reservation Details</h4>
                  <InputNumber
                    label="Number of Attendees"
                    value={values.attendees}
                    onChange={this.onValueChange('attendees')}
                    min={roomCapacity.min}
                    // Disable max because manually input of an out of range value has
                    // unexpected side effects with validation since the underlying input sets
                    // an out of range value to null.
                    // max={roomCapacity.max}
                    name={'attendees'}
                    int
                    required={!utils.userIsStaff()}
                    validations={{
                      isPositive: true,
                      isLesserOrEqualTo: roomCapacity.max,
                      isGreaterOrEqualTo: roomCapacity.min,
                    }}
                    validationErrors={{
                      isPositive: 'Attendees must be a positive number',
                      isLesserOrEqualTo: `The maximum capacity of this room is ${roomCapacity.max}`,
                      isGreaterOrEqualTo: `The minimum capacity of this room is ${
                        roomCapacity.min
                      }`,
                    }}
                    helperText={
                      roomCapacity.max &&
                      `This room holds ${roomCapacity.min} to ${roomCapacity.max} people`
                    }
                  />
                  <InputText
                    label="Group Name"
                    onChange={this.onValueChange('groupName')}
                    value={values.groupName}
                    name="groupName"
                    helperText={'Help others find you by name.'}
                    required={!utils.userIsStaff()}
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
              </div>
              <div className="l__secondary">
                <div className="l--subsection">
                  <h4 className="section-title section-title--secondary">Account</h4>
                  <SelectUser
                    label="Reserved For"
                    value={values.user}
                    onChange={value => this.onValueChange('user')(value.uuid)}
                    name={'user'}
                  />
                </div>
                <div className="l--subsection">
                  <h4 className="section-title section-title--secondary">Refreshments</h4>
                  <InputCheckbox
                    label = "I would like to serve refreshments and agree to the $25 charge that will be added to my library card. (Note: Some spaces may not allow refreshments. We will contact you if we are unable to fulfill this request.)"
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
            </div>
            <div className="form__actions l__footer">
              <Button
                variant="raised"
                size="large"
                color="primary"
                type="submit"
                className="button button--primary"
                disabled={!this.state.canSubmit || hasConflict || !room}
              >
                Reserve
              </Button>
            </div>
          </div>
        </Formsy>
      );
    }

    return (
      <div className="form">
        {content}
        <ReserveRoomConfirmation
          open={this.state.openDialog}
          onCancel={this.onCloseDialog}
          onConfirm={() =>
            this.saveEntitytoStore({
              ...combinedValues,
              [c.TYPE_ROOM]: room,
              [c.TYPE_EVENT]: event,
            })
          }
          values={{
            ...combinedValues,
            [c.TYPE_ROOM]: room,
            [c.TYPE_EVENT]: event,
          }}
          availabilityQuery={availabilityQuery}
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
  availabilityQuery: PropTypes.object.isRequired,
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
  save: PropTypes.func.isRequired,
  meetingPurpose: PropTypes.object,
  combinedValues: PropTypes.object,
  room: PropTypes.string,
  roomCapacity: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number,
  }).isRequired,
  event: PropTypes.string,
  hasConflict: PropTypes.bool,
};

ReserveRoomForm.defaultProps = {
  combinedValues: {},
  values: {
    attendees: null,
    groupName: '',
    meetingPurpose: '',
    meetingDetails: '',
    refreshments: false,
    refreshmentsDesc: '',
    user: drupalSettings.intercept.user.uuid,
  },
  meetingPurpose: null,
  room: null,
  event: null,
  hasConflict: false,
};

const mapStateToProps = (state, ownProps) => ({
  meetingPurpose: ownProps.values[c.TYPE_MEETING_PURPOSE]
    ? select.record(
      select.getIdentifier(c.TYPE_MEETING_PURPOSE, ownProps.values[c.TYPE_MEETING_PURPOSE]),
    )(state)
    : null,
  roomCapacity: ownProps.room
    ? select.roomCapacity(ownProps.room)(state)
    : {
      min: 0,
      max: null,
    },
});

const mapDispatchToProps = dispatch => ({
  save: (data) => {
    dispatch(actions.add(data, c.TYPE_ROOM_RESERVATION, data.id));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReserveRoomForm);
