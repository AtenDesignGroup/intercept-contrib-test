import React from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import moment from 'moment';

function InputTime(props) {
  const { value, label, onChange } = props;

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <TextField
      label={label}
      type="text"
      onChange={handleChange}
      value={value}
      className="input input--text"
      InputLabelProps={{
        shrink: true,
        className: 'input__label',
      }}
      inputProps={{}}
    />
  );
}

InputTime.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  label: PropTypes.string,
};

InputTime.defaultProps = {
  value: '',
  label: 'Text',
};

export default InputTime;
