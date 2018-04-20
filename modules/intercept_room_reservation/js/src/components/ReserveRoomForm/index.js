// React
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Lodash
import map from 'lodash/map';

// Intercept
import interceptClient from 'interceptClient';

// Components
import DateFilter from 'intercept/DateFilter';
import TimeFilter from 'intercept/TimeFilter';
import SelectResource from 'intercept/SelectResource';
import TimePicker from 'material-ui-pickers/TimePicker';
import Button from 'material-ui/Button';

const { constants } = interceptClient;
const c = constants;

class ReserveRoomForm extends PureComponent {
  constructor(props) {
    super(props);

    this.onValueChange = this.onValueChange.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  onValueChange(key, value) {
    const newValues = { ...this.props.values, [key]: value };
    this.props.onChange(newValues);
  }

  onInputChange(key) {
    return (event) => {
      this.onValueChange(key, event.target.value);
    };
  }

  onDateChange(value) {
    this.onValueChange(c.DATE, value);
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
            value={values.room}
            label={'Room'}
          />
          <DateFilter handleChange={this.onDateChange} defaultValue={null} value={values.date} />
          <TimeFilter clearable label="From" value={values.start} handleChange={this.onValueChange} />
          <TimeFilter clearable label="To" value={values.end} handleChange={this.onValueChange} />
        </div>
        <div className="form__actions">
          <Button primary onClick={console.log}>Reserve</Button>
        </div>
      </div>
    );
  }
}

ReserveRoomForm.propTypes = {
  values: PropTypes.shape({
    room: PropTypes.string,
    date: PropTypes.instanceOf(Date),
    start: PropTypes.string,
    end: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
};

ReserveRoomForm.defaultProps = {
  values: {
    room: "",
    date: null,
    start: null,
    end: null,
  },
};

export default ReserveRoomForm;
