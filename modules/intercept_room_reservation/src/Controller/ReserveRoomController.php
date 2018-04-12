<?php

namespace Drupal\intercept_room_reservation\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Class ReserveRoomController.
 */
class ReserveRoomController extends ControllerBase {

  /**
   * Hello.
   *
   * @return string
   *   Return Hello string.
   */
  public function reserveRoom() {
    $build = [];
    $build['#attached']['library'][] = 'intercept_room_reservation/reserveRoom';
    $build['#markup'] = '';
    $build['intercept_room_reserve']['#markup'] = '<div id="reserveRoomRoot" />';

    return $build;
  }

}
