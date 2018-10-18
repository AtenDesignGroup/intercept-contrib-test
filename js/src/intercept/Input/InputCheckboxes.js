import React from 'react';
import PropTypes from 'prop-types';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import InputCheckbox from './InputCheckbox';

import union from 'lodash/union';
import without from 'lodash/without';

class InputCheckboxes extends React.Component {
  state = {
    gilad: true,
    jason: false,
    antoine: false,
  };

  handleChange = key => event => {
    const {
      onChange,
      value,
    } = this.props;

    onChange(event.target.checked
       ? union(value, [key])
       : without(value, key)
    );
  };

  render() {
    const { label, options, helperText, value } = this.props;

    const checkboxes = options.map(o => (<FormControlLabel
      key={o.key}
      control={
        <Checkbox checked={value.indexOf(o.key) >= 0} onChange={this.handleChange(o.key)} value={o.key} />
      }
      label={o.value}
    />));


    return (
      <div className={''}>
        <FormControl component="fieldset" className={''} name={name}>
          {label && (<FormLabel component="legend">{label}</FormLabel>)}
          <FormGroup>
            {checkboxes}
          </FormGroup>
          {helperText && (<FormHelperText>{helperText}</FormHelperText>)}
        </FormControl>
      </div>
    );
  }
}

InputCheckboxes.propTypes = {
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
    }),
  ),
  value: PropTypes.arrayOf(PropTypes.string),
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
};

InputCheckboxes.defaultProps = {
  checked: false,
  label: 'Agree',
  options: [],
  value: [],
};

export default InputCheckboxes;
