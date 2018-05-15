import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import { withFormsy, propTypes, defaultProps } from 'formsy-react';

class InputText extends React.Component {
  render() {
    const { label, isValid, onChange, getErrorMessages, isRequired } = this.props;

    const handleChange = (event) => {
      onChange(event.target.value);
      this.props.setValue(event.target.value);
    };

    return (
      <TextField
        label={label}
        type="text"
        onChange={handleChange}
        value={this.props.getValue()}
        className="input input--text"
        InputLabelProps={{
          shrink: true,
          className: 'input__label',
        }}
        inputProps={{}}
        error={!isValid()}
        helperText={this.props.getErrorMessage()}
        required={isRequired()}
      />
    );
  }
}

InputText.propTypes = {
  ...propTypes,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  label: PropTypes.string,
  validators: PropTypes.arrayOf(String),
};

InputText.defaultProps = {
  ...defaultProps,
  value: '',
  label: 'Text',
  validators: [],
};

export default withFormsy(InputText);
