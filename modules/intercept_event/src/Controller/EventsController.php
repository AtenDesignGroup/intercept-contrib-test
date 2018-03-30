<?php

namespace Drupal\intercept_event\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Class EventsController.
 */
class EventsController extends ControllerBase {

  /**
   * List.
   *
   * @return string
   *   Return a render array containing the events list block.
   */
  public function list() {
    $build = [];
    $build['#attached']['library'][] = 'intercept_event/eventList';
    $build['#markup'] = '';
    $build['intercept_event_list']['#markup'] = '<div id="eventListRoot" />';

    return $build;
  }
}
