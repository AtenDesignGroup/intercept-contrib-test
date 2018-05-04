<?php

namespace Drupal\intercept_event\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining Event Registration entities.
 *
 * @ingroup intercept_event
 */
interface EventRegistrationInterface extends ContentEntityInterface, EntityChangedInterface, EntityOwnerInterface {

  // Add get/set methods for your configuration properties here.

  /**
   * Gets the Event Registration name.
   *
   * @return string
   *   Name of the Event Registration.
   */
  public function getName();

  /**
   * Sets the Event Registration name.
   *
   * @param string $name
   *   The Event Registration name.
   *
   * @return \Drupal\intercept_event\Entity\EventRegistrationInterface
   *   The called Event Registration entity.
   */
  public function setName($name);

  /**
   * Gets the Event Registration creation timestamp.
   *
   * @return int
   *   Creation timestamp of the Event Registration.
   */
  public function getCreatedTime();

  /**
   * Sets the Event Registration creation timestamp.
   *
   * @param int $timestamp
   *   The Event Registration creation timestamp.
   *
   * @return \Drupal\intercept_event\Entity\EventRegistrationInterface
   *   The called Event Registration entity.
   */
  public function setCreatedTime($timestamp);

  /**
   * Returns the Event Registration published status indicator.
   *
   * Unpublished Event Registration are only visible to restricted users.
   *
   * @return bool
   *   TRUE if the Event Registration is published.
   */
  public function isPublished();

  /**
   * Sets the published status of a Event Registration.
   *
   * @param bool $published
   *   TRUE to set this Event Registration to published, FALSE to set it to unpublished.
   *
   * @return \Drupal\intercept_event\Entity\EventRegistrationInterface
   *   The called Event Registration entity.
   */
  public function setPublished($published);

}
