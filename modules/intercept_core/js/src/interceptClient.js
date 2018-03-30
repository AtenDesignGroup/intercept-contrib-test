import 'babel-polyfill';
// Polyfill: Fetch API.
import 'whatwg-fetch';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import intercept from 'intercept-client';
import drupalSettings from 'drupalSettings';
import thunk from 'redux-thunk';
import * as select from './select';

const reducers = combineReducers({
  ...intercept.reducer,
});

const consumer = drupalSettings.intercept ? drupalSettings.intercept.consumer : null;
/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)));
const interceptClient = Object.assign({}, intercept, { store, select, consumer });
window.interceptClient = interceptClient;
export default interceptClient;
