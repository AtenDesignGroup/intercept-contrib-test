// import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import moment from 'moment';
// import get from 'lodash/get';
// import interceptClient from 'interceptClient';
// import FieldInline from './../FieldInline';
// import Teaser from './../Teaser';

// const { select, constants } = interceptClient;
// const c = constants;
// class EventSummary extends PureComponent {
//   render() {
//     const { id, event, image } = this.props;

//     const termMap = item => ({
//       id: item.id,
//       name: get(item, 'attributes.name'),
//     });

//     const date = moment(`${event.attributes['field_date_time'].value}Z`, moment.ISO_8601);

//     const audienceValues = event.relationships['field_event_audience']
//       .map(termMap)
//       .filter(i => i.id);

//     const audiences =
//       audienceValues.length > 0 ? (
//         <FieldInline label="Audience" key="audience" values={audienceValues} />
//       ) : null;

//     return (
//       <Teaser
//         key={id}
//         modifiers={[image ? 'with-image' : 'without-image']}
//         image={image}
//         supertitle={get(event, 'relationships.field_location.attributes.title')}
//         title={event.attributes.title}
//         titleUrl={
//           event.attributes.path ? event.attributes.path.alias : `/node/${event.attributes.nid}`
//         }
//         date={{
//           month: date.format('MMM'),
//           date: date.format('D'),
//           time: date.format('h:mm a').replace('m', '.m.'),
//         }}
//         description={event.attributes['field_text_teaser'].value}
//         tags={[audiences]}
//       />
//     );
//   }
// }

// EventSummary.propTypes = {
//   id: PropTypes.string.isRequired,
//   event: PropTypes.object.isRequired,
//   image: PropTypes.string,
// };

// EventSummary.defaultProps = {
//   image: null,
// };

// const mapStateToProps = (state, ownProps) => {
//   const identifier = select.getIdentifier(c.TYPE_EVENT, ownProps.id);

//   return {
//     event: select.bundle(identifier)(state),
//     image: select.resourceImageStyle(identifier, '4to3_740x556')(state),
//   };
// };

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { withStyles } from '@material-ui/core/styles';
import interceptClient from 'interceptClient';
import Card from 'intercept/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import get from 'lodash/get';

const { constants, select } = interceptClient;
const c = constants;

const styles = {
  card: {
    maxWidth: 345,
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
};

const onLearnMore = (event) => {
  const url = event.attributes.path ? event.attributes.path.alias : `/node/${event.attributes.nid}`;
  window.location.href = url;
};

function EventSummary(props) {
  const { classes, id, event, image } = props;
  const date = moment(`${event.attributes['field_date_time'].value}Z`, moment.ISO_8601);

  return (
    <div>
      <Card
        key={id}
        modifiers={[image ? 'with-image' : 'without-image']}
        image={image}
        supertitle={get(event, 'relationships.field_location.attributes.title')}
        title={event.attributes.title}
        titleUrl={
          event.attributes.path ? event.attributes.path.alias : `/node/${event.attributes.nid}`
        }
        date={{
          month: date.format('MMM'),
          date: date.format('D'),
          time: date.format('h:mm a').replace('m', '.m.'),
        }}
        body={event.attributes['field_text_teaser'].value}
      />
      {/* {image && (
        <CardMedia className={classes.media} image={image} title={event.attributes.title} />
      )}
      <CardContent>
        <Typography gutterBottom variant="subheading" component="p">
          {get(event, 'relationships.field_location.attributes.title')}
        </Typography>
        <Typography gutterBottom variant="headline" component="h2">
          {event.attributes.title}
        </Typography>
        <Typography gutterBottom variant="subheading" component="p">
          {get(event, 'relationships.field_room.attributes.title')}
        </Typography>
        <Typography component="div">{date.format('h:mm a').replace('m', '.m.')}</Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary">
          Register
        </Button>
        <Button size="small" color="primary" onClick={() => onLearnMore(event)}>
          Learn More
        </Button>
      </CardActions> */}
    </div>
  );
}

EventSummary.propTypes = {
  classes: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  event: PropTypes.object.isRequired,
  image: PropTypes.string,
};

EventSummary.defaultProps = {
  image: null,
};

const mapStateToProps = (state, ownProps) => {
  const identifier = select.getIdentifier(c.TYPE_EVENT, ownProps.id);

  return {
    event: select.bundle(identifier)(state),
    image: select.resourceImageStyle(identifier, '4to3_740x556')(state),
  };
};

export default connect(mapStateToProps)(withStyles(styles)(EventSummary));
