import React from 'react';
import PropTypes from 'prop-types';
import Radio from '@material-ui/core/Radio';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';

class EvaluationWidget extends React.PureComponent {
  // state = {
  //   selectedValue: 'a',
  // };

  handleChange = (event) => {
    this.props.onChange(event.target.value);
  };

  render() {
    const { value, label } = this.props;

    const likeIcon = () => (
      <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <title>Like</title>
        <g fill="none" fillRule="evenodd">
          <circle stroke="#7A7D81" strokeWidth="5" cx="30" cy="30" r="27.5" />
          <circle fill="#7A7D81" cx="20.5" cy="24.5" r="3.5" />
          <circle fill="#7A7D81" cx="39.5" cy="24.5" r="3.5" />
          <path
            d="M19 39c7.7 6.4 14.4 6.4 22 0"
            stroke="#7A7D81"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    );
    const dislikeIcon = () => (
      <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <title>Dislike</title>
        <g fill="none" fillRule="evenodd">
          <circle stroke="#7A7D81" strokeWidth="5" cx="30" cy="30" r="27.5" />
          <circle fill="#7A7D81" cx="20.5" cy="24.5" r="3.5" />
          <circle fill="#7A7D81" cx="39.5" cy="24.5" r="3.5" />
          <path
            d="M19 43.9c7.2-6 13.7-7 22 0"
            stroke="#7A7D81"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    );

    return (
      <FormControl component="fieldset" className={'evaluation__eval-widget'} name={name}>
        {label && (
          <FormLabel component="legend" className={'evaluation__widget-label'}>
            {label}
          </FormLabel>
        )}
        <FormGroup>
          <Radio
            checked={value === '1'}
            onChange={this.handleChange}
            value="1"
            color="default"
            name={name}
            aria-label="Like"
            icon={likeIcon()}
            checkedIcon={likeIcon()}
            className="evaluation__radio-icon"
          />
          <Radio
            checked={value === '0'}
            onChange={this.handleChange}
            value="0"
            color="default"
            name={name}
            aria-label="Dislike"
            icon={dislikeIcon()}
            checkedIcon={dislikeIcon()}
            className="evaluation__radio-icon"
          />
        </FormGroup>
      </FormControl>
    );
  }
}

EvaluationWidget.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  value: PropTypes.string,
};

EvaluationWidget.defaultProps = {
  label: 'How’d the Event Go?',
};

export default EvaluationWidget;
