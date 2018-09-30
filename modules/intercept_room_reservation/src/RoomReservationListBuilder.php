<?php

namespace Drupal\intercept_room_reservation;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;
use Drupal\intercept_core\SettableListBuilderTrait;

/**
 * Defines a class to build a listing of Room reservation entities.
 *
 * @ingroup intercept_room_reservation
 */
class RoomReservationListBuilder extends EntityListBuilder {

  use SettableListBuilderTrait;

  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['name'] = $this->t('Reservation');
    $header['room'] = $this->t('Room');
    $header['location'] = $this->t('Location');
    $header['user'] = $this->t('User');
    $header['status'] = $this->t('Status');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    /* @var $entity \Drupal\intercept_room_reservation\Entity\RoomReservation */
    $row['name'] = $entity->link($entity->getDateRange('UTC'));
    $row['room'] = $this->getEntityLabel($entity->field_room->entity, $this->t('No room'));
    $row['location'] = $entity->getLocation()? $entity->getLocation()->link() : '';
    $row['user'] = $this->getEntityLabel($entity->field_user->entity, $this->t('No user'));
    $row['status'] = $entity->field_status->getString();
    return $row + parent::buildRow($entity);
  }

  /**
   * Loads entity IDs using a pager sorted by the entity id.
   *
   * @return array
   *   An array of entity IDs.
   */
  protected function getEntityIds() {
    $query = $this->getStorage()->getQuery()
      ->sort('created', 'DESC');

    // Only add the pager if a limit is specified.
    if ($this->limit) {
      $query->pager($this->limit);
    }
    return $query->execute();
  }

  private function getEntityLabel(EntityInterface $entity = NULL, $default = '') {
    return $entity ? $entity->link() : $default;
  }

}
