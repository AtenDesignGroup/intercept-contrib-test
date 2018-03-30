import React from 'react';
import PropTypes from 'prop-types';
import MetaField from './../MetaField';

const Teaser = (props) => {
  const { date, modifiers, image, type, supertitle, subtitle, title, titleUrl, description, tags } = props;
  const classes = `clearfix teaser ${modifiers.map(mod => `teaser--${mod}`).join(' ')}`;

  const img = image && (<img src={image} alt={title}/>);

  return (
    <article className={classes}>
      <div className="teaser__image">
        { titleUrl
          ? (<a href="{{title_url}}" className="teaser__image-link" aria-hidden="true">{img}</a>)
          : (img)
        }
        {date && (
          <div className="teaser__date-wrapper">
            <p className="teaser__date">
              <span className="teaser__date-month">{date.month}</span>
              <span className="teaser__date-date">{date.date}</span>
              <span className="teaser__date-time">{date.time}</span>
            </p>
          </div>
        )}
      </div>
      <div className="teaser__content clearfix">
        {type && <span className="teaser__type">{type}</span>}
        {supertitle && <span className="teaser__supertitle">{supertitle}</span>}
        <h3 className="teaser__title">
          {titleUrl ? (
            <a href={titleUrl} className="teaser__title-link">
              {title}
            </a>
          ) : (
            title
          )}
        </h3>
        {subtitle && <span className="teaser__subtitle">{subtitle}</span>}
        {description && <div className="teaser__description">{description}</div>}
        {tags && <div className="teaser__tags">{tags}</div>}
      </div>
    </article>
  );
};

Teaser.propTypes = {
  modifiers: PropTypes.arrayOf(PropTypes.string),
  type: PropTypes.string,
  image: PropTypes.string,
  supertitle: PropTypes.string,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  title: PropTypes.string.isRequired,
  titleUrl: PropTypes.string,
  date: PropTypes.object,
  tags: PropTypes.arrayOf(PropTypes.element),
};

Teaser.defaultProps = {
  modifiers: [],
  type: null,
  image: null,
  subtitle: null,
  supertitle: null,
  titleUrl: null,
  date: null,
  description: null,
  tags: null,
};

export default Teaser;
