<?php

namespace Drupal\intercept_room_reservation;

use Drupal\Core\Datetime\DrupalDateTime;
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
    // Fix the dates to be non-UTC in the display.
    // Dates/times of reservation
    $reservation_dates = $entity->get('field_dates')->getValue();
    $dateTime = new DrupalDateTime($reservation_dates[0]['value'], 'UTC');
    $reservation_start_date = date('m-d-Y g:i A', $dateTime->getTimestamp());
    $dateTime = new DrupalDateTime($reservation_dates[0]['end_value'], 'UTC');
    $reservation_end_date = date('m-d-Y g:i A', $dateTime->getTimestamp());
    /* @var $entity \Drupal\intercept_room_reservation\Entity\RoomReservation */
    $row['name'] = $entity->link($reservation_start_date . ' - ' . $reservation_end_date);
    $row['room'] = $this->getEntityLabel($entity->field_room->entity, $this->t('No room'));
    $row['location'] = $entity->get('location')->entity ? $entity->get('location')->entity->label() : '';
    $row['user'] = $this->getEntityLabel($entity->field_user->entity, $this->t('No user'));
    $row['status'] = $entity->field_status->getString();
    return $row + parent::buildRow($entity);
  }

  private function getEntityLabel(EntityInterface $entity = NULL, $default = '') {
    return $entity ? $entity->link() : $default;
  }

}
