<?php

namespace Drupal\intercept_core;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;
use Drupal\office_hours\OfficeHoursDateHelper;

/**
 * Class ReservationManager.
 */
class ReservationManager implements ReservationManagerInterface {

  const FORMAT = 'Y-m-d\TH:i:s';

  /**
   * Drupal\Core\Entity\EntityTypeManagerInterface definition.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  protected $idKey;

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

  protected function hasReservationConflict(array $reservations, array $params) {
    $has_openings = FALSE;
    // Check if there is open space between existing reservations.
    array_reduce($reservations, function($datetime, $reservation) use (&$has_openings, $params) {
      // Diff between current res start time and (either start time param or end date of last reservation).
      $int = $datetime->diff($reservation->getStartDate());
      $total = $int->h * 60 + $int->i;
      if ($total >= $params['duration']) {
        $has_openings = TRUE;
      }
      return $reservation->getEndDate();
    }, $this->getDrupalDate($params['start']));

    // Now check open space between (start time or last reservation) and end time.
    $date = empty($reservations) ? $this->getDrupalDate($params['start']) : end($reservations)->getEndDate();
    $int = $date->diff($this->getDrupalDate($params['end']));
    $total = $int->h * 60 + $int->i;
    if ($total >= $params['duration']) {
      $has_openings = TRUE;
    }
    return !$has_openings;
  }

  protected function hasOpeningHoursConflict($reservations, $params, $node) {
    $start = $params['start'];
    $end = $params['end'];
    $start_date = $this->getDate($params['start']);
    $end_date = $this->getDate($params['end']);
    if (!$hours = $this->getHours($params, $node)) {
      // Appears to be closed.
      return TRUE;
    }
    $start_time = $this->getAdjustedDate($params['start'], $hours['starthours'], $start_date, 'start');
    $end_time = $this->getAdjustedDate($params['end'], $hours['endhours'], $end_date, 'end');
    $params['start'] = $start_time->format(self::FORMAT);
    $params['end'] = $end_time->format(self::FORMAT);
    return $this->hasReservationConflict($reservations, $params);
  }

  protected function getLocation($node) {
    return !empty($node->field_location->entity) ? $node->field_location->entity : FALSE;
  }

  protected function getHours($params, $node) {
    if (!$location = $this->getLocation($node)) {
      return FALSE;
    }
    $start_date = $this->getDate($params['start']);
    $d = $start_date->format('w');
    $hours = $location->field_location_hours;
    $values = $hours->getValue();
    return !empty($values[$d]) ? $values[$d] : FALSE;
  }

  protected function isClosed($params, $node) {
    return empty($this->getHours($params, $node));
  }

  protected function getAdjustedDate($selected_time, $location_time, $date, $type = 'start') {
    $time = $this->getDate($selected_time)->format('Gi');
    // If the closing hours or open hours differ, we use them.
    if ($type == 'start') {
      if ($time < $location_time) {
        $time = $location_time;
      }
    }
    if ($type == 'end') {
      if ($time > $location_time) {
        $time = $location_time;
      }
    }

    // Then just covert that time to a full date using the date part specified.
    // Make sure it's 4 digits.
    $time = \Drupal\office_hours\OfficeHoursDateHelper::datePad($time, 4);
    // Parse to be in the format for a date format.
    if (!strstr($time, ':')) {
      $time = substr('0000' . $time, -4);
      $hour = substr($time, 0, -2);
      $min = substr($time, -2);
      $time = $hour . ':' . $min;
    }
    return new DrupalDateTime($date->format('Y-m-d\T') . $time);
  }


  public function getDates($reservations) {
    $return = [];
    foreach ($reservations as $reservation) {
      $return[$reservation->uuid()] = [
        'start' => $reservation->getStartDate()->format(self::FORMAT),
        'end' => $reservation->getEndDate()->format(self::FORMAT),
      ];
    }
    return $return;
  }

  public function availability($params = []) {
    $data = $this->reservationsByNode('room', function($query) use ($params) {
      $start_date = $this->getDate($params['start']);
      $end_date = $this->getDate($params['end']);
      // Add period to end to send to query.
      $period = 'PT' . (int) $params['duration'] . 'M';
      $end_date->add(new \DateInterval($period));
      $params['end'] = $end_date->format(self::FORMAT);
      if (!empty($params['rooms'])) {
        $query->condition('field_room', $params['rooms'], 'IN');
      }
      $query->condition('field_dates.value', $start_date->format(self::FORMAT), '>=');
      $query->condition('field_dates.end_value', $end_date->format(self::FORMAT), '<=');
    });

    $nodes = $this->nodes('room', isset($params['rooms']) ? $params['rooms'] : []);
    $return = [];
    foreach ($nodes as $nid => $node) {
      $uuid = $node->uuid();
      $reservations = !empty($data[$node->uuid()]) ? $data[$node->uuid()] : [];
      $return[$uuid]['has_open_hours_conflict'] = $this->hasOpeningHoursConflict($reservations, $params, $node);
      $return[$uuid]['has_reservation_conflict'] = $this->hasReservationConflict($reservations, $params);
      $return[$uuid]['is_closed'] = $this->isClosed($params, $node);
      $return[$uuid]['has_location'] = !empty($this->getLocation($node));
      $return[$uuid]['dates'] = $this->getDates($reservations);
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
