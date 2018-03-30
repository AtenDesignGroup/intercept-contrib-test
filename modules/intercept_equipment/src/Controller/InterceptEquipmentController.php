<?php

namespace Drupal\intercept_equipment\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Class InterceptEquipmentController.
 */
class InterceptEquipmentController extends ControllerBase {

  /**
   * Hello.
   *
   * @return string
   *   Return Hello string.
   */
  public function manage() {
    return [
      '#type' => 'markup',
      '#markup' => $this->t('Implement method: hello')
    ];
  }
}
