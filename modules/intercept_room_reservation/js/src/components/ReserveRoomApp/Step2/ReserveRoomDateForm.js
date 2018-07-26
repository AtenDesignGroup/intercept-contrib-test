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
import AppBar from '@material-ui/core/AppBar';
import Dialog from '@material-ui/core/Dialog';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Collapse from '@material-ui/core/Collapse';

// Intercept Components
import InputDate from 'intercept/Input/InputDate';
import InputTime from 'intercept/Input/InputTime';

// Formsy
import Formsy, { addValidationRule } from 'formsy-react';

// Local Components

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

class ReserveRoomStep2 extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      expand: {
        meeting: false,
      },
      canSubmit: false,
    };

    this.form = React.createRef();

    this.toggleState = this.toggleState.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
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

  updateValue = (key, value) => {
    const newValues = { ...this.props.values, [key]: value };
    this.props.onChange(newValues);
  };

  updateValues = (value) => {
    const newValues = { ...this.props.values, ...value };
    this.props.onChange(newValues);
  };

  render() {
    const { values } = this.props;

    return (
      <div className="form">
        <Formsy
          className="form__main"
          ref={this.form}
          onValidSubmit={this.onOpenDialog}
          onValid={this.enableButton}
          onInvalid={this.disableButton}
        >

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
              Next
            </Button>
          </div>
        </Formsy>
      </div>
    );
  }
}

ReserveRoomStep2.propTypes = {
  values: PropTypes.shape({
    date: PropTypes.instanceOf(Date),
    start: PropTypes.instanceOf(Date),
    end: PropTypes.instanceOf(Date),
    meetings: PropTypes.bool,
    meetingStart: PropTypes.instanceOf(Date),
    meetingEnd: PropTypes.instanceOf(Date),
  }),
  onChange: PropTypes.func.isRequired,
};

ReserveRoomStep2.defaultProps = {
  values: {
    date: new Date(),
    start: new Date(),
    end: new Date(),
    meetingStart: new Date(),
    meetingEnd: new Date(),
  },
  meetingPurpose: null,
};

const mapStateToProps = (state, ownProps) => ({});

export default connect(mapStateToProps)(ReserveRoomStep2);
