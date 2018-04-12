import React, { Component } from 'react';
import interceptClient from 'interceptClient';

//
// Higher order component that forces an update
// when history is updated.
//
function updateWithHistory(WrappedComponent) {
  // ...and returns another component...
  return class extends Component {
    componentDidMount() {
      // force an update if the URL changes
      interceptClient.history.listen(() => {
        this.forceUpdate();
      });
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

export default updateWithHistory;
