// React
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Moment
import moment from 'moment';

// Intercept
import interceptClient from 'interceptClient';
import drupalSettings from 'drupalSettings';

// Material UI
import Button from '@material-ui/core/Button';

// Intercept Components
import InputDate from 'intercept/Input/InputDate';
import InputTime from 'intercept/Input/InputTime';
import SelectTime from 'intercept/Select/SelectTime';

// Formsy
import Formsy, { addValidationRule } from 'formsy-react';

// Local Components

const { constants, utils } = interceptClient;
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
addValidationRule('isFutureTime', (values, value) => {
  if (value === null) {
    return true;
  }
  const now = new Date();
  const time = utils.getDateFromTime(value, values[c.DATE]);
  return time >= now;
});
addValidationRule('isAfterStart', (values, value) => value === null || value > values.start);
addValidationRule('isOnOrAfterStart', (values, value) => value === null || value >= values.start);
addValidationRule('isBeforeEnd', (values, value) => value === null || value < values.end);
addValidationRule('isOnOrBeforeEnd', (values, value) => value === null || value <= values.end);
addValidationRule(
  'isAfterMeetingStart',
  (values, value) => value === null || value > values.meetingStart,
);

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class ReserveRoomDateForm extends PureComponent {
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
    const { values, min, max, step, onSubmit } = this.props;
    const isClosed = !min || !max;
    // const minValue = matchDate(min, values.date);
    // const maxValue = matchDate(max, values.date);
    let validationErrors = {};

    if (isClosed) {
      validationErrors[c.DATE] = 'Location is closed';
    }

    return (
      <div className="form">
        <Formsy
          className="form__main"
          ref={this.form}
          onValidSubmit={this.onOpenDialog}
          onValid={this.enableButton}
          onInvalid={this.disableButton}
          validationErrors={validationErrors}
        >
          <div className="l--subsection">
            <h4 className="section-title--secondary">Choose a Time</h4>
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
            <SelectTime
              clearable
              label="Start Time"
              value={values.start}
              onChange={this.onValueChange('start')}
              name="start"
              required
              validations="isFutureTime"
              validationError="Must be in the future"
              min={min}
              max={max}
              step={step}
              disabled={isClosed}
            />
            <div className="input-group--subgroup">
              <SelectTime
                clearable
                label="Meeting Start Time"
                value={values.meetingStart}
                onChange={this.onValueChange('meetingStart')}
                name="meetingStart"
                validations={{
                  isFutureTime: false,
                  isOnOrAfterStart: true,
                  isOnOrBeforeEnd: true,
                }}
                validationErrors={{
                  isFutureTime: 'Must be in the future',
                  isOnOrAfterStart: 'Must be on or after reservation start time',
                  isOnOrBeforeEnd: 'Must be on or before reservation end time',
                }}
                min={values.start}
                max={values.end}
                step={step}
                disabled={isClosed}
              />
              <SelectTime
                label="Meeting End Time"
                value={values.meetingEnd}
                onChange={this.onValueChange('meetingEnd')}
                name="meetingEnd"
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
                min={values.start}
                max={values.end}
                step={step}
                disabled={isClosed}
              />
            </div>
            <SelectTime
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
              min={min}
              max={max}
              step={step}
              disabled={isClosed}
            />
          </div>

          <div className="form__actions">
            <Button
              variant="raised"
              size="small"
              color="primary"
              type="submit"
              className="button button--primary"
              disabled={!this.state.canSubmit}
              onClick={onSubmit}
            >
              Next
            </Button>
          </div>
        </Formsy>
      </div>
    );
  }
}

ReserveRoomDateForm.propTypes = {
  values: PropTypes.shape({
    date: PropTypes.instanceOf(Date),
    start: PropTypes.string,
    end: PropTypes.string,
    meetingStart: PropTypes.string,
    meetingEnd: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
};

ReserveRoomDateForm.defaultProps = {
  values: {
    date: utils.roundTo(new Date()).toDate(),
    start: null,
    end: null,
    meetingStart: null,
    meetingEnd: null,
  },
  step: 15,
  min: null,
  max: null,
};

const mapStateToProps = (state, ownProps) => ({});

export default connect(mapStateToProps)(ReserveRoomDateForm);
