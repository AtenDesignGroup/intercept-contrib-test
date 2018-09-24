<?php

namespace Drupal\intercept_room_reservation\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\RevisionLogInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\intercept_core\Entity\ReservationInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining Room reservation entities.
 *
 * @ingroup intercept_room_reservation
 */
interface RoomReservationInterface extends ReservationInterface {

}
