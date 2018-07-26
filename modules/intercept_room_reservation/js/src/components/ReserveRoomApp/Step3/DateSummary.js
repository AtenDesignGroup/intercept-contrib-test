import React from 'react';
import PropTypes from 'prop-types';

/* eslint-disable */
import interceptClient from 'interceptClient';
/* eslint-enable */

// Material UI
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';

// Intercept Components
const { utils } = interceptClient;

// Local Components
class DateSummary extends React.PureComponent {
  render() {
    const { value, onClickChange } = this.props;
    const hasValue = !!value;
    const label = utils.getDateTimespanDisplay(value);

    if (hasValue) {
      return (
        <div className="value-summary">
          <h4 className="value-summary__label">
            Date &amp; Time
            <IconButton
              className="value-summary__icon-button"
              aria-label="Edit"
              color="primary"
              onClick={onClickChange}
            >
              <EditIcon />
            </IconButton>
          </h4>
          <p className="value-summary__value">{label}</p>
        </div>
      );
    }
    return (
      <div>
        <h4 className="value-summary__label">Room</h4>
        <Button
          className="value-summary__button"
          variant="raised"
          color="primary"
          size="small"
          onClick={onClickChange}
        >
          Choose a Room
        </Button>
      </div>
    );
  }
}

DateSummary.propTypes = {
  value: PropTypes.shape({
    date: PropTypes.object,
    start: PropTypes.object,
    end: PropTypes.object,
  }),
  onClickChange: PropTypes.func.isRequired,
};

DateSummary.defaultProps = {
  value: null,
};

export default DateSummary;
