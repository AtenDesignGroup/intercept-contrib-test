import React, { Component } from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';

const ContentList = (props) => {
  const { items, heading, modifiers } = props;

  const classes = ['content-list'].concat(modifiers.map(modifier => `content-list--${modifier}`)).join(' ');

  const title = heading && <h3 className="content-list__heading">{heading}</h3>;

  const list = items.map(item => <li key={item.key} className="content-list__item">{item.node}</li>);

  return (
    <div className={classes}>
      {title}
      <ul className="content-list__list">
        {list}
      </ul>
    </div>
  );
}

ContentList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  modifiers: PropTypes.arrayOf(PropTypes.string),
  heading: PropTypes.node,
};

ContentList.defaultProps = {
  heading: null,
  modifiers: [],
}

export default ContentList;
