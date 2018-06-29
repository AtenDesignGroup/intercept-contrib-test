// React
import React from 'react';
import PropTypes from 'prop-types';

// Material UI
import CircularProgress from '@material-ui/core/CircularProgress';
import { CSSTransition } from 'react-transition-group';

const LoadingIndicator = (props) => {
  const { loading, label } = props;

  return (
    <CSSTransition
      in={loading}
      timeout={300}
      classNames="loading-indicator"
    >
      <div className="loading-indicator">
        <CircularProgress size={40} /> <span className="loading-indicator__label">{label}</span>
      </div>
    </CSSTransition>
  );
};

LoadingIndicator.propTypes = {
  loading: PropTypes.bool.isRequired,
  label: PropTypes.string,
};

LoadingIndicator.defaultProps = {
  label: 'Loading',
};

export default LoadingIndicator;
