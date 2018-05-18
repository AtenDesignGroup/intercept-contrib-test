<?php

namespace Drupal\intercept_event;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;

/**
 * Defines a class to build a listing of Event Attendance entities.
 *
 * @ingroup intercept_event
 */
class EventAttendanceListBuilder extends EntityListBuilder {

  use EventListBuilderTrait;

  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header = [];
    $this->addEventHeader($header);
    $header['name'] = $this->t('Name');
    $header['user'] = $this->t('User');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    $row = [];
    $this->addEventRow($row, $entity);
    $row['name'] = $entity->link();
    $row['user'] = $this->getUserLink($entity);
    return $row + parent::buildRow($entity);
  }

}
