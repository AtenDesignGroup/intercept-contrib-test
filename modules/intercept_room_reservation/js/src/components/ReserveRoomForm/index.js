// React
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Intercept
import interceptClient from 'interceptClient';

// Components
import Button from 'material-ui/Button';
import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from 'material-ui/ExpansionPanel';
import { FormControlLabel } from 'material-ui/Form';
import Switch from 'material-ui/Switch';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SelectResource from 'intercept/SelectResource';
import InputDate from 'intercept/Input/InputDate';
import InputTime from 'intercept/Input/InputTime';
import InputNumber from 'intercept/Input/InputNumber';
import InputText from 'intercept/Input/InputText';
import ReserveRoomConfirmation from './ReserveRoomConfirmation';

const { constants } = interceptClient;
const c = constants;

const matchTime = (original, ref) => {
  if (ref instanceof Date === false || original instanceof Date === false) {
    return ref;
  }
  const output = new Date();
  output.setTime(original.getTime());
  output.setHours(ref.getHours());
  output.setMinutes(ref.getMinutes());
  return output;
};

const matchDate = (original, ref) => matchTime(ref, original);

class ReserveRoomForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      expandRefreshments: false,
      openDialog: false,
    };

    this.toggleState = this.toggleState.bind(this);
    this.updateValue = this.updateValue.bind(this);
    this.updateValues = this.updateValues.bind(this);
    this.onCloseDialog = this.onCloseDialog.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onOpenDialog = this.onOpenDialog.bind(this);
    this.onSwitchChange = this.onSwitchChange.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
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
        expandRefreshments: event.target.checked,
      });
    };
  }

  onOpenDialog = () => {
    this.setState({ openDialog: true });
  };

  onCloseDialog = () => {
    this.setState({ openDialog: false });
  };

  toggleState(key) {
    return () => {
      this.setState({
        [key]: !this.state[key],
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
    const { values } = this.props;

    return (
      <div className="form">
        <div className="form__main">
          <SelectResource
            multiple={false}
            type={c.TYPE_ROOM}
            handleChange={this.onInputChange(c.TYPE_ROOM)}
            value={values[c.TYPE_ROOM]}
            label={'Room'}
          />
          <div className="input-group--date-time">
            <InputDate
              handleChange={this.onDateChange}
              defaultValue={null}
              value={values[c.DATE]}
            />
            <InputTime
              clearable
              label="Start Time"
              value={values.start}
              onChange={this.onValueChange('start')}
            />
            <InputTime
              clearable
              label="End Time"
              value={values.end}
              onChange={this.onValueChange('end')}
            />
          </div>
          <InputNumber
            label="Number of Attendees"
            value={values.attendees}
            onChange={this.onValueChange('attendees')}
            min={0}
            int
          />
          <InputText
            label="Group Name"
            value={values.groupName}
            onChange={this.onValueChange('groupName')}
          />
          <ExpansionPanel
            elevation={0}
            expanded={this.state.expandRefreshments}
            onChange={this.toggleState('expandRefreshments')}
            className={'input-group input-group--expandable'}
          >
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              className={'input-group__summary'}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={values.refreshments}
                    onChange={this.onSwitchChange('refreshments')}
                    value="refreshments"
                  />
                }
                label="Serving food and/or Drink?"
                className={'input__label'}
              />
            </ExpansionPanelSummary>
            <ExpansionPanelDetails className={'input-group__details'}>
              <InputText
                label="Food &amp; Description"
                value={values.refreshmentsDesc}
                onChange={this.onValueChange('refreshmentsDesc')}
              />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </div>
        <div className="form__actions">
          <Button onClick={this.onOpenDialog} color="primary">
            Reserve
          </Button>
        </div>
        <ReserveRoomConfirmation
          open={this.state.openDialog}
          onCancel={this.onCloseDialog}
          onConfirm={() => {
            console.log(values);
            this.onCloseDialog();
          }}
          values={values}
        />
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
    refreshments: PropTypes.bool,
    refreshmentsDesc: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
};

ReserveRoomForm.defaultProps = {
  values: {
    [c.TYPE_ROOM]: '',
    date: new Date(),
    start: new Date(),
    end: new Date(),
    attendees: 1,
    groupName: '',
    refreshments: false,
    refreshmentsDesc: '',
  },
};

export default ReserveRoomForm;
