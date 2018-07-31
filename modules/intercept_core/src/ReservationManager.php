<?php

namespace Drupal\intercept_core;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;

/**
 * Class ReservationManager.
 */
class ReservationManager implements ReservationManagerInterface {

  /**
   * Drupal\Core\Entity\EntityTypeManagerInterface definition.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;
  /**
   * Constructs a new ReservationManager object.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
    $this->entityTypeManager = $entity_type_manager;
  }

  protected function getTimezone() {
    $timezone_name = DateTimeItemInterface::STORAGE_TIMEZONE;
    return new \DateTimeZone($timezone_name);
  }

  protected function getDate($string) {
    return new \DateTime($string, $this->getTimezone());
  }

  protected function getDrupalDate($string) {
    return DrupalDateTime::createFromDateTime($this->getDate($string));
  }

  public function hasOpenings($reservations, $params) {
    $has_openings = FALSE;
    array_reduce($reservations, function($carry, $item) use (&$has_openings, $params) {
      $int = $carry->diff($item->getStartDate());
      $total = $int->h * 60 + $int->i;
      if ($total >= $params['duration']) {
        $has_openings = TRUE;
      }
      return $item->getEndDate();
    }, $this->getDrupalDate($params['start']));
    $res = end($reservations);
    $end_date = $this->getDrupalDate($params['end']);
    $int = $res->getEndDate()->diff($end_date);
    $total = $int->h * 60 + $int->i;
    if ($total >= $params['duration']) {
      $has_openings = TRUE;
    }
    return $has_openings;
  }

  public function getDates($reservations) {
    $return = [];
    foreach ($reservations as $reservation) {
      $return[$reservation->uuid()] = [
        'start' => $reservation->getStartDate()->format(DATE_ISO8601),
        'end' => $reservation->getEndDate()->format(DATE_ISO8601),
      ];
    }
    return $return;
  }

  public function availability($params = []) {
    $rooms = isset($params['rooms']) ? $params['rooms'] : [];
    $data = $this->reservationsByNode('room', function($query) use ($params) {
      $start_date = $this->getDate($params['start']);
      $end_date = $this->getDate($params['end']);
      if (!empty($params['rooms'])) {
        $query->condition('field_room', $params['rooms'], 'IN');
      }
      $query->condition('field_dates.value', $start_date->format(DATE_ISO8601), '>=');
      $query->condition('field_dates.end_value', $end_date->format(DATE_ISO8601), '<=');
    });
    $return = [];
    foreach ($data as $nid => $reservations) {
      $return[$nid]['status'] = $this->hasOpenings($reservations, $params);
      $return[$nid]['dates'] = $this->getDates($reservations);
    }
    foreach ($this->nodes('room', $rooms) as $node) {
      if (isset($return[$node->uuid()])) {
        continue;
      }
      $return[$node->uuid()] = [
        'status' => TRUE,
      ];
    }
    return $return;
  }

  protected function nodes($type, $ids = []) {
    $properties = [
      'type' => $type,
      'status' => 1,
      'field_reservable_online' => 1,
    ];
    if (!empty($ids)) {
      return $this->entityTypeManager->getStorage('node')->loadMultiple($ids);
    }
    return $this->entityTypeManager->getStorage('node')->loadByProperties($properties);
  }

  public function convertIds(array $uuids) {
    $nodes = \Drupal::service('entity_type.manager')->getStorage('node')->loadByProperties([
      'uuid' => $uuids,
    ]);
    return !empty($nodes) ? array_keys($nodes) : [];
  }

  public function reservationsByNode($type, $exec = NULL) {
    $reservations = [];
    foreach ($this->reservations($type, $exec) as $reservation) {
      $reservations[$reservation->field_room->entity->uuid()][$reservation->uuid()] = $reservation;
    }
    return $reservations;
  }

  public function reservations($type, $exec = NULL) {
    $storage = $this->entityTypeManager->getStorage($type . '_reservation');
    $query = $storage->getQuery();
    if (is_callable($exec)) {
      $exec($query);
    }
    $ids = $query->execute();
    $reservations = $storage->loadMultiple($ids);
    return $reservations;
  }
}
