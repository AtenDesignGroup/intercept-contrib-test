Intercept

## Development:

### JavaScript
This module and its submodules consist of many React applications that share a dependency on a commmon interceptClient Library.
The React applications are built using the themable [Material-UI](https://material-ui.com/) suite of components.

It is highly recommended that you install the [React Dev Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) and [Redux Dev Tools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) extensions for Chrome.

#### interceptClient
interceptClient provides a shared Redux store, Reselect selectors and Drupal JsonAPI integrations to help fetching and manipulating Drupal content as well as many other utility functions that help making interacting with Intercept a little easier.

### Installation
`npm install`

### Develeopment Build
To run the development build which will bundle the apps with the development version of React and include source maps to aid in debugging, run the following.
`npm run watch:js`

### Production Build
The production build will use an extenal production build of React hosted on a CDN, and minify the code.
`npm run build:js`

*The production build should be committed to the repository. Currently this is a manual process.*

## Events

### Event status logic
- default status: open
- check if there is no event date, if true return default status
- check if event has expired, if true return 'expired'
- check if reg is not required, or if there is no reg date, return default status
- check if reg end date has passed, if so return 'closed'
- check if reg is in process and if the capacity is full
  - if there is a waiting list, check if that is full
    - if it's full return 'full'
    - if it's not return 'waitlist'
- check if reg start date has not happened, if true return 'open_pending'
- return default status
