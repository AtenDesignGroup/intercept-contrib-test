import React from 'react';
import { render } from 'react-dom';
import withIntercept from 'intercept/withIntercept';
import BrowseEventsApp from './components/BrowseEventsApp';

const App = withIntercept(BrowseEventsApp);

render(<App />, document.getElementById('eventListRoot'));
