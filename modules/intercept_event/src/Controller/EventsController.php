<?php

namespace Drupal\intercept_event\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;

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

  /**
   * Event registration form.
   */
  public function register(\Drupal\node\NodeInterface $node) {
    $access_handler = $this->entityTypeManager()->getAccessControlHandler('event_registration');
    if (!$access_handler->createAccess('event_registration')) {
      return $this->redirect('user.login', [
        'destination' => Url::fromRoute('<current>')->toString(),
      ]);
    }
    return [];
  }
}
