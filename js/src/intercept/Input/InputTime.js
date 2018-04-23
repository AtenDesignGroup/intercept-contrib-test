import React from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import moment from 'moment';

function InputTime(props) {
  const { value, step, label, onChange } = props;

  const handleChange = (event) => {
    const date = moment(event.target.value, 'HH:mm');
    onChange(date.isValid() ? date.toDate() : null);
  };

  return (
    <TextField
      label={label}
      type="time"
      onChange={handleChange}
      value={moment(value).format('HH:mm')}
      className="input input--time"
      InputLabelProps={{
        shrink: true,
        className: 'input__label',
      }}
      inputProps={{
        step,
      }}
    />
  );
}

InputTime.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.instanceOf(Date),
  label: PropTypes.string,
  step: PropTypes.number,
};

InputTime.defaultProps = {
  value: new Date(),
  label: 'time',
  step: 900, // 15 min
};

export default InputTime;
