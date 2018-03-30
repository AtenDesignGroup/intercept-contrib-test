<?php

namespace Drupal\intercept_room_reservation\Entity;

use Drupal\views\EntityViewsData;

/**
 * Provides Views data for Room reservation entities.
 */
class RoomReservationViewsData extends EntityViewsData {

  /**
   * {@inheritdoc}
   */
  public function getViewsData() {
    $data = parent::getViewsData();

    // Additional information for Views integration, such as table joins, can be
    // put here.

    return $data;
  }

}
