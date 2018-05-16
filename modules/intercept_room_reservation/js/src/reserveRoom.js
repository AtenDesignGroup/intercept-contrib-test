import React from 'react';
import { render } from 'react-dom';
import withIntercept from 'intercept/withIntercept';
import ReserveRoomApp from './components/ReserveRoomApp';

const App = withIntercept(ReserveRoomApp);

render(<App />, document.getElementById('reserveRoomRoot'));
