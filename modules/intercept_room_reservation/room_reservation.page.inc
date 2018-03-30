<?php

/**
 * @file
 * Contains room_reservation.page.inc.
 *
 * Page callback for Room reservation entities.
 */

use Drupal\Core\Render\Element;

/**
 * Prepares variables for Room reservation templates.
 *
 * Default template: room_reservation.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - elements: An associative array containing the user information and any
 *   - attributes: HTML attributes for the containing element.
 */
function template_preprocess_room_reservation(array &$variables) {
  // Fetch RoomReservation Entity Object.
  $room_reservation = $variables['elements']['#room_reservation'];

  // Helpful $content variable for templates.
  foreach (Element::children($variables['elements']) as $key) {
    $variables['content'][$key] = $variables['elements'][$key];
  }
}
