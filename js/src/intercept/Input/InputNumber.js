import React from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';

function InputNumber(props) {
  const { value, step, label, onChange, min, max, int } = props;

  const handleChange = (event) => {
    const parse = int ? parseInt : parseFloat;
    onChange(event.target.value ? parse(event.target.value) : null);
  };

  return (
    <TextField
      label={label}
      type="number"
      onChange={handleChange}
      value={value === null ? '' : value}
      className="input input--number"
      InputLabelProps={{
        shrink: true,
        className: 'input__label',
      }}
      inputProps={{
        step,
        min,
        max,
      }}
    />
  );
}

InputNumber.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number,
  label: PropTypes.string,
  step: PropTypes.number,
  int: PropTypes.bool,
};

InputNumber.defaultProps = {
  value: null,
  label: 'Number',
  step: 1,
};

export default InputNumber;
