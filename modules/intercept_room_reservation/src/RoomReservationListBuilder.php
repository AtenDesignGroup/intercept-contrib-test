<?php

namespace Drupal\intercept_room_reservation;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;

/**
 * Defines a class to build a listing of Room reservation entities.
 *
 * @ingroup intercept_room_reservation
 */
class RoomReservationListBuilder extends EntityListBuilder {


  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['id'] = $this->t('Room reservation ID');
    $header['name'] = $this->t('Name');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    /* @var $entity \Drupal\intercept_room_reservation\Entity\RoomReservation */
    $row['id'] = $entity->id();
    $row['name'] = Link::createFromRoute(
      $entity->label(),
      'entity.room_reservation.edit_form',
      ['room_reservation' => $entity->id()]
    );
    return $row + parent::buildRow($entity);
  }

}
