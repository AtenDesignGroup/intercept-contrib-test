import React from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import { withFormsy, propTypes, defaultProps } from 'formsy-react';

class InputNumber extends React.Component {
  render() {
    const { step, label, onChange, min, max, int } = this.props;

    const handleChange = (event) => {
      const parse = int ? parseInt : parseFloat;
      this.props.setValue(event.target.value ? parse(event.target.value) : null);
      // onChange(event.target.value ? parse(event.target.value) : null);
    };

    const value = this.props.getValue();

    return (
      <TextField
        label={label}
        type="number"
        onChange={handleChange}
        value={value === null ? '' : value}
        error={!this.props.isValid()}
        helperText={this.props.getErrorMessage()}
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
}

InputNumber.propTypes = {
  ...propTypes,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number,
  label: PropTypes.string,
  step: PropTypes.number,
  int: PropTypes.bool,
};

InputNumber.defaultProps = {
  ...defaultProps,
  value: null,
  label: 'Number',
  step: 1,
};

export default withFormsy(InputNumber);
