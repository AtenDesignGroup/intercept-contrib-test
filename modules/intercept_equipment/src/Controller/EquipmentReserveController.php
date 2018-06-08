<?php

namespace Drupal\intercept_equipment\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Class EquipmentReserveController.
 */
class EquipmentReserveController extends ControllerBase {

  /**
   * Hello.
   *
   * @return string
   *   Return Hello string.
   */
  public function reserveEquipment() {
    $build = [];
    $build['#attached']['library'][] = 'intercept_equipment/reserveEquipment';
    $build['#markup'] = '';
    $build['intercept_room_reserve']['#markup'] = '<div id="reserveEquipmentRoot" />';

    return $build;
  }

}
