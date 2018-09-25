<?php

namespace Drupal\intercept_core;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Mail\MailManagerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Utility\Token;
use Drupal\intercept_core\Utility\Dates;
use Drupal\intercept_room_reservation\Entity\RoomReservation;
use Drupal\intercept_room_reservation\Entity\RoomReservationInterface;
/**
 * Class ReservationManager.
 *
 * TODO: Move partially over to an EntityReservationManager/RoomReservationManager.
 */
class ReservationManager implements ReservationManagerInterface {

  const FORMAT = 'Y-m-d\TH:i:s';

  /**
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * @var ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * @var Dates
   */
  protected $dateUtility;

  /**
   * @var Token
   */
  protected $token;

  /**
   * @var AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new ReservationManager object.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, ConfigFactoryInterface $config_factory, MailManagerInterface $mail_manager, Dates $date_utility, Token $token, AccountProxyInterface $current_user) {
    $this->entityTypeManager = $entity_type_manager;
    $this->configFactory = $config_factory;
    $this->mailManager = $mail_manager;
    $this->dateUtility = $date_utility;
    $this->token = $token;
    $this->currentUser = $current_user;
  }

  /**
   * A list of emails to use for reservations.
   *
   * TODO: Make this a hook so that it can be customized and altered.
   */
  public static function emails() {
    return [
      'reservation_requested' => t('Reservation requested'),
      'reservation_canceled' => t('Reservation canceled'),
      'reservation_approved_staff' => t('Reservation approved (by staff)'),
      'reservation_approved_auto' => t('Reservation approved (auto)'),
      'reservation_canceled_staff' => t('Reservation canceled (by staff)'),
      'reservation_denied_staff' => t('Reservation denied (by staff)'),
    ];
  }

  public function userExceededReservationLimit(AccountInterface $user) {
    if ($user->hasPermission('bypass room reservation limit')) {
      return FALSE;
    }
    $config = $this->configFactory->get('intercept_room_reservation.settings');
    return $this->userReservationCount($user) >= $config->get('reservation_limit');
  }

  public function userReservationCount(AccountInterface $user) {
    $reservations = $this->reservations('room', function($query) use ($user) {
      $query->condition('field_user', $user->id(), '=');
      $date = new DrupalDateTime('now', $this->dateUtility->getUtcTimezone());
      $query->condition('field_dates.end_value', $date->format('Y-m-d\TH:i:s'), '>');
      $query->condition('field_status', ['requested', 'approved'], 'IN');
    });
    return count($reservations);
  }

  public function availability($params = []) {
    // Show debug information in return.
    $debug = !empty($params['debug']);
    // Reservations keyed by room uuid.
    $data = $this->reservationsByNode('room', function($query) use ($params) {
      $start_date = $this->dateUtility->getDate($params['start']);
      $end_date = $this->dateUtility->getDate($params['end']);
      // Add period to end to send to query.
      $period = 'PT' . (int) $params['duration'] . 'M';
      $end_date->add(new \DateInterval($period));
      $params['end'] = $end_date->format(self::FORMAT);
      if (!empty($params['rooms'])) {
        $query->condition('field_room', $params['rooms'], 'IN');
      }
      $query->condition('field_status', ['canceled', 'denied'], 'NOT IN');
      $range = [$start_date->format(self::FORMAT), $end_date->format(self::FORMAT)];
      $query->condition($query->orConditionGroup()
        // Date start value is in between start / end params.
        ->condition('field_dates.value', $range, 'BETWEEN')
        // OR Date end value is in between start / end params.
        ->condition('field_dates.end_value', $range, 'BETWEEN')
        // OR Date start and date end values span larger than the start / end params.
        ->condition($query->andConditionGroup()
          ->condition('field_dates.value', $range[0], '<=')
          ->condition('field_dates.end_value', $range[1], '>=')
        )
      );
    });

    $nodes = $this->nodes('room', isset($params['rooms']) ? $params['rooms'] : []);
    $return = [];

    $timezone_info = [
      'default_timezone' => $this->dateUtility->getDefaultTimezone()->getName(),
      'storage_timezone' => $this->dateUtility->getStorageTimezone()->getName(),
    ];
    
    $param_info = [];
    foreach (['start', 'end'] as $param) {
      $date = $this->dateUtility->getDate($params[$param]);
      $param_info[$param]['storage_timezone'] = $date->format(self::FORMAT);
      $param_info[$param]['default_timezone'] = $this->dateUtility->convertTimezone($date, 'default')->format(self::FORMAT);
    }

    foreach ($nodes as $nid => $node) {
      $uuid = $node->uuid();
      if ($debug) {
        $return[$uuid]['debug'] = [];
        $debug_data = &$return[$uuid]['debug'];
      }
      $reservations = !empty($data[$node->uuid()]) ? $data[$node->uuid()] : [];
      $return[$uuid]['has_reservation_conflict'] = $this->hasReservationConflict($reservations, $params);
      $return[$uuid]['has_open_hours_conflict'] = $this->hasOpeningHoursConflict($reservations, $params, $node);
      $return[$uuid]['is_closed'] = $this->isClosed($params, $node);
      $return[$uuid]['has_location'] = !empty($this->getLocation($node));
      if ($debug) {
        $debug_data['schedule'] = $this->getSchedule($reservations, $params);
        $debug_data['schedule_by_open_hours'] = $this->getScheduleByOpenHours($reservations, $params, $node);
        $debug_data['hours'] = FALSE;
        if (!$this->isClosed($params, $node)) {
          $hours = $this->getHours($params, $node);
          $hours_start = $this->timeToDate($hours['starthours'], $this->dateUtility->getDate($params['start']));
          $hours_end = $this->timeToDate($hours['endhours'], $this->dateUtility->getDate($params['end']));
          $debug_data['hours'] = [
            'start' => ['raw' => $hours['starthours']],
            'end' => ['raw' => $hours['endhours']],
          ];

          $debug_data['hours']['start']['default_timezone'] = $hours_start->format(self::FORMAT);
          $debug_data['hours']['start']['storage_timezone'] = $this->dateUtility->convertTimezone($hours_start, 'storage')->format(self::FORMAT);
          $debug_data['hours']['end']['default_timezone'] = $hours_end->format(self::FORMAT);
          $debug_data['hours']['end']['storage_timezone'] = $this->dateUtility->convertTimezone($hours_end, 'storage')->format(self::FORMAT);
        }
      }
      $return[$uuid]['dates'] = $this->getDates($reservations);
      if ($debug) {
        $debug_data['room_nid'] = $node->id();
        $debug_data['location_nid'] = !empty($this->getLocation($node)) ? $this->getLocation($node)->id() : FALSE;
        $debug_data['param_info'] = $param_info;
        $debug_data['timezone_info'] = $timezone_info;
      }
    }
    return $return;
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

  public function convertIds(array $uuids) {
    $nodes = $this->entityTypeManager->getStorage('node')->loadByProperties([
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
    $ids = $query->sort('field_dates.value', 'ASC')->execute();
    $reservations = $storage->loadMultiple($ids);
    return $reservations;
  }

  public function hasReservationConflict(array $reservations, array $params) {
    return empty($this->getOpeningsByDuration($reservations, $params));
  }

  public function hasOpeningHoursConflict($reservations, $params, $node) {
    if (!$params = $this->getOpenHoursParams($reservations, $params, $node)) {
      // Appears to be closed.
      return TRUE;
    }

    return $this->hasReservationConflict($reservations, $params);
  }

  /**
   * @param RoomReservationInterface[] $reservations
   * @param array $params
   * @param bool $open_only
   * @return array
   */
  protected function getOpenings(array $reservations, array $params, $open_only = TRUE) {
    $openings = [];
    // Check if there is open space between existing reservations.
    $preceding = [];
    array_reduce($reservations, function($datetime, $reservation) use (&$openings, &$preceding) {
      // Diff between current res start time and (either start time param or end date of last reservation).
      if ($opening = $this->getOpening($datetime, $reservation->getStartDate())) {
        if (!empty($preceding)) {
          $opening['preceding_reservations'] = $preceding;
          $preceding = [];
        }
        $opening['following_reservation'] = $reservation->id();
        $openings[] = $opening;
      }
      else {
        $preceding[] = $reservation->id();
      }
      return $reservation->getEndDate();
    }, $this->dateUtility->getDrupalDate($params['start']));

    // Now check open space between (start time or last reservation) and end time.
    $last_date = empty($reservations) ? $this->dateUtility->getDrupalDate($params['start']) : end($reservations)->getEndDate();
    $slot_end = $this->dateUtility->getDrupalDate($params['end']);
    if ($opening = $this->getOpening($last_date, $slot_end)) {
      if (!empty($preceding)) {
        $opening['preceding_reservations'] = $preceding;
        $preceding = [];
      }
      $openings[] = $opening;
    }
    // Openings will include all schedule info, so return either way.
    if (!empty($openings)) {
      return $openings;
    }
    // Return empty for a conflict check, but otherwise slot info.
    return $open_only ? [] : $preceding;
  }

  protected function getOpeningsByOpenHours(array $reservations, array $params, $node) {
    if (!$params = $this->getOpenHoursParams($reservations, $params, $node)) {
      return [];
    }
    return $this->getOpenings($reservations, $params);
  }

  protected function getOpeningsByDuration(array $reservation, array $params) {
    $openings = [];
    foreach ($this->getOpenings($reservation, $params) as $id => $opening) {
      if ($opening['duration'] >= $params['duration']) {
        $openings[$id] = $opening;
      }
    }
    return $openings;
  }

  private function getOpening($start, $end) {
    if ($start > $end) {
      return FALSE;
    }
    $int = $start->diff($end);
    $total = $int->h * 60 + $int->i;
    if ($total > 0) {
      $data = [
        'duration' => $total,
        'start' => $start->format(self::FORMAT),
        'end' => $end->format(self::FORMAT),
      ];
      $data['unique_hash'] = hash('sha256', serialize($data));
      return $data;
    }
    return FALSE;
  }

  protected function getSchedule(array $reservations, array $params) {
    return $this->getOpenings($reservations, $params, FALSE);
  }

  protected function getScheduleByOpenHours(array $reservations, array $params, $node) {
    if (!$params = $this->getOpenHoursParams($reservations, $params, $node)) {
      return [];
    }
    return $this->getSchedule($reservations, $params);
  }

  /**
   * @param $reservations
   * @param $params
   * @param $node
   * @return bool|array
   */
  private function getOpenHoursParams($reservations, $params, $node) {
    // No changes if the location has no hours.
    if (!$hours = $this->getHours($params, $node)) {
      return FALSE;
    }
    foreach (['start', 'end'] as $type) {
      // get location start/end hours for location
      // convert to date objects using the start date param as a base, but default timezone
      // convert timezone to UTC
      // return dates
      $selected_date = $this->dateUtility->getDrupalDate($params[$type]);
      // Hardcode get start date here because the end date might span into another day.
      // TODO: Make this less error prone by defining a way to specify the current searched "day".
      $date = $this->timeToDate($hours[$type . 'hours'], $this->dateUtility->getDate($params['start']));
      $converted_date = $this->dateUtility->convertTimezone($date);
      if ($type == 'start' && ($converted_date > $selected_date)) {
        $params['start'] = $converted_date->format(self::FORMAT);
      }
      if ($type == 'end' && ($converted_date < $selected_date)) {
        $params['end'] = $converted_date->format(self::FORMAT);
      }
    }
    return $params;
  }

  protected function getLocation($node) {
    return !empty($node->field_location->entity) ? $node->field_location->entity : FALSE;
  }

  protected function getHours($params, $node) {
    if (!$location = $this->getLocation($node)) {
      return FALSE;
    }
    $start_date = $this->dateUtility->convertDate($params['start']);
    $d = $start_date->format('w');
    // Eventually there is going to be a TIMEZONE setting on this field.
    $hours = $location->field_location_hours;
    $values = $hours->getValue();
    // e.g. 'starthours' => '0900', 'endhours' => '1700'
    return array_reduce($values, function($car, $val) use ($d) {
      if ($val['day'] == $d) { $car = $val; }
      return $car;
    });
  }

  protected function isClosed($params, $node) {
    return empty($this->getHours($params, $node));
  }

  protected function timeToDate($time, $base_date) {
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
    $new_date_time = new DrupalDateTime($base_date->format('Y-m-d\T') . $time, $this->dateUtility->getDefaultTimezone());
    return $new_date_time;
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

  protected function getEmailConfig($type) {
    $config = $this->configFactory->get('intercept_room_reservation.settings')->get('email');
    return !empty($config[$type]) ? $config[$type] : FALSE;
  }

  /**
   * Run configured email notifications depending on reservation status.
   */
  public function notifyStatusChange(RoomReservationInterface $room_reservation, $original, $new) {
    if ($room_reservation->isNew()) {
      $original = 'empty';
    }
    $config = $this->configFactory->get('intercept_room_reservation.settings')->get('email');
    $emails = [];
    foreach ($config as $mail_key => $settings) {
      // Check if this email should be only sent out for certain logged in users.
      $pass = FALSE;
      if (!empty($settings['user'])) {
        switch($settings['user']) {
          case 'reservation_user':
            $reservation_user = $room_reservation->getRegistrant();
            $pass = $reservation_user && $this->matchesCurrentUser($reservation_user->id());
          break;
          case 'reservation_author':
            $reservation_author = $room_reservation->getOwner();
            $pass = $reservation_author && $this->matchesCurrentUser($reservation_author->id());
          break;
          case 'user_role':
            $user_roles = !empty($settings['user_role']) ? $settings['user_role'] : [];
            $roles = $this->currentUser->getRoles();
            $pass = !empty(array_intersect(array_values($user_roles), $roles));
          break;
        }

        if (!$pass) {
          continue;
        }
      }
      if (empty($settings['status_original']) || empty($settings['status_new'])) {
        continue;
      }
      $status_original = $settings['status_original'];
      $status_new      = $settings['status_new'];
      if (empty($status_original[$original]) && empty($status_original['any'])) {
        continue;
      }
      if (empty($status_new[$new]) && empty($status_new['any'])) {
        continue;
      }
      $emails[$mail_key] = $settings;
    }
    foreach ($emails as $mail_key => $settings) {
      $this->email($mail_key, $room_reservation);
    }
  }

  private function matchesCurrentUser($uid) {
    return $uid == $this->currentUser->id();
  }

  public function email($key, RoomReservation $room_reservation) {
    if (!$config = $this->getEmailConfig($key)) {
      return;
    }

    // Get room reservation author.
    if (!($user = $room_reservation->field_user->entity) || !$user->getEmail()) {
      // Watchdog error possibly.
      return;
    }

    $this->mailManager->mail('intercept_room_reservation', $key, $user->getEmail(), 'en', [
      'reservation_manager' => $this,
      'email_config' => $config,
      'room_reservation' => $room_reservation,
    ]);
  }

  /**
   * Build email content from configuration and parameters.
   *
   * @see intercept_room_reservation_mail()
   */
  public function buildEmail($key, &$message, $params) {
    $email_config = $params['email_config'];
    $variables = [
      '%site_name' => \Drupal::config('system.site')->get('name'),
      '%username' => 'username', //$account->getDisplayName(),
    ];

    $token_replacements = [
      'room_reservation' => $params['room_reservation']
    ];
    $subject = $this->token->replace($email_config['subject'], $token_replacements);
    $body = $this->token->replace($email_config['body'], $token_replacements);
    $message['subject'] = str_replace(["\r", "\n"], '', $subject);
    $message['body'][] = \Drupal\Core\Mail\MailFormatHelper::htmlToText($body);
  }

}
