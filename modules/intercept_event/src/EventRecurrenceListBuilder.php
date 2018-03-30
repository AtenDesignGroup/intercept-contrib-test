<?php

namespace Drupal\intercept_event;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;

/**
 * Defines a class to build a listing of Event Recurrence entities.
 *
 * @ingroup intercept_event
 */
class EventRecurrenceListBuilder extends EntityListBuilder {


  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['id'] = $this->t('Event Recurrence ID');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    /* @var $entity \Drupal\intercept_event\Entity\EventRecurrence */
    $row['id'] = Link::createFromRoute(
      $entity->id(),
      'entity.event_recurrence.edit_form',
      ['event_recurrence' => $entity->id()]
    );
    return $row + parent::buildRow($entity);
  }

}
