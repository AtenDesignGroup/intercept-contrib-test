import React from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import moment from 'moment';
import { withFormsy } from 'formsy-react';
import { propTypes, defaultProps } from 'formsy-react';

class InputTime extends React.Component {
  render() {
    const { step, label, onChange } = this.props;
    const value = this.props.getValue();

    const handleChange = (event) => {
      const date = moment(event.target.value, 'HH:mm');
      this.props.setValue(date.isValid() ? date.toDate() : null);
      // onChange(date.isValid() ? date.toDate() : null);
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
        error={!this.props.isValid()}
        helperText={this.props.getErrorMessage()}
      />
    );
  }
}

InputTime.propTypes = {
  ...propTypes,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.instanceOf(Date),
  label: PropTypes.string,
  step: PropTypes.number,
};

InputTime.defaultProps = {
  ...defaultProps,
  value: new Date(),
  label: 'time',
  step: 900, // 15 min
};

export default withFormsy(InputTime);
