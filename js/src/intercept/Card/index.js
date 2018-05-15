import React from 'react';
import PropTypes from 'prop-types';

const CardImage = (props) => {
  const img = <img src={props.image} alt={props.alt} />;

  return (
    <div className="card__image">
      {props.url && props.image ? (
        <a href={props.url} className="card__image-link" aria-hidden="true">
          {img}
        </a>
      ) : (
        img
      )}
    </div>
  );
};

CardImage.propTypes = {
  image: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  url: PropTypes.string,
};

CardImage.defaultProps = {
  url: null,
};

const CardDate = props => (
  <div className="card__dateline-wrapper">
    <p className="card__dateline">
      <span className="card__dateline-date">{'October 20, 2017'}</span>
      {/* <span className="card__date-month">{props.dateStart.month}</span> */}
      <span className="card__dateline-time">{'11 a.m.–2 p.m.'}</span>
    </p>
  </div>
);

CardDate.propTypes = {
  dateStart: PropTypes.object.isRequired,
  dateEnd: PropTypes.object,
};

CardDate.defaultProps = {
  dateEnd: null,
};

const Card = (props) => {
  const {
    date,
    body,
    footer,
    image,
    label,
    modifiers,
    supertitle,
    subtitle,
    title,
    titleUrl,
    uuid,
  } = props;
  const classes = `card ${modifiers.map(mod => `card--${mod}`).join(' ')}`;

  function createMarkup(value) {
    return { __html: value };
  }

  return (
    <article uuid={uuid} className={classes}>
      {image && <CardImage image={image} url={titleUrl} alt={title} />}
      <div className="card__content">
        <header className="card__header">
          {supertitle && <span className="card__supertitle">{supertitle}</span>}
          <h3 className="card__title">
            {titleUrl ? (
              <a href={titleUrl} className="card__title-link">
                {title}
              </a>
            ) : (
              title
            )}
          </h3>
          {subtitle && <span className="card__subtitle">{subtitle}</span>}
          {date && <CardDate dateStart={date} />}
        </header>

        {body && <div className="card__body" dangerouslySetInnerHTML={createMarkup(body)} />}
        {label && <span className="card__label">{label}</span>}
      </div>
      {footer && <div className="card__footer">{footer(props)}</div>}
    </article>
  );
};

Card.propTypes = {
  uuid: PropTypes.string,
  date: PropTypes.object,
  body: PropTypes.string,
  footer: PropTypes.func,
  image: PropTypes.string,
  label: PropTypes.string,
  modifiers: PropTypes.arrayOf(PropTypes.string),
  supertitle: PropTypes.string,
  subtitle: PropTypes.string,
  title: PropTypes.string.isRequired,
  titleUrl: PropTypes.string,
};

Card.defaultProps = {
  date: null,
  body: null,
  modifiers: [],
  footer: null,
  image: null,
  label: null,
  subtitle: null,
  supertitle: null,
  titleUrl: null,
  uuid: null,
};

export default Card;
