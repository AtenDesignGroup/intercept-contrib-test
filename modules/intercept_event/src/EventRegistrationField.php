<?php

namespace Drupal\intercept_event;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\intercept_core\Plugin\Field\FieldType\ComputedItemList;
use Drupal\node\NodeStorageInterface;
use Drupal\user\UserInterface;

class EventRegistrationField extends ComputedItemList {

  /**
   *
   */
  private $registrationManager;

  protected function computeValue() {
    $this->setValue([
      'total' => $this->getTotal(),
      'total_waitlist' => $this->getTotalWaitlist(),
      'status' => $this->getStatus(),
      'status_user' => $this->getStatusUser(),
    ]);
  }

  protected function getTotal() {
    $node = $this->getEntity();

    $ids = $this->getStorage()->getQuery()
      ->condition('field_event', $node->id(), '=')
      ->condition('status', 'active', '=')
      ->execute();

    $registrations = $this->getStorage()->loadMultiple($ids);
    $total = 0;
    foreach ($registrations as $registration) {
      $total += (int) $registration->total();
    }
    return $total;
  }

  protected function getStatus() {
    $default_status = 'open';

    if (!$this->eventDate()) {
      return $default_status;
    }

    if (!$this->regDate()) {
      return $default_status;
    }

    // Event date has ended.
    if ($this->eventEnded()) {
      return 'expired';
    }
    // Registration date has ended.
    if ($this->regEnded()) {
      return 'closed';
    }
    // Registration date has not started.
    if ($this->regPending()) {
      return 'open_pending';
    }
    // Has a capacity and it's filled.
    if ($this->capacityFull()) {
      // Has a waiting list and it's not full.
      if (!$this->waitlistFull()) {
        return 'waitlist';
      }
      return 'full';
    }
    return $default_status;
  }

  protected function hasWaitlist() {
    $field = $this->getEntity()->get('field_has_waitlist');
    return !empty($field->getString());
  }

  protected function waitlistFull() {
    $has_waitlist = $this->hasWaitlist();
    $waitlist_max = $this->getEntity()->get('field_waitlist_max')->getString();
    return $has_waitlist && !is_null($waitlist_max) && $waitlist_max <= $this->getTotalWaitlist();
  }

  protected function capacityFull() {
    $capacity_max = $this->getEntity()->get('field_capacity_max')->value;
    if (is_null($capacity_max)) {
      return FALSE;
    }
    return $capacity_max <= $this->getTotal();
  }

  protected function eventDate() {
    $date = $this->getEntity()->get('field_date_time');
    if (!$date->start_date || !$date->end_date) {
      return FALSE;
    }
    return (object) [
      'start' => $date->start_date,
      'end' => $date->end_date,
    ];
  }

  protected function regDate() {
    $date = $this->getEntity()->get('field_event_register_period');
    if (!$date->start_date || !$date->end_date) {
      return FALSE;
    }
    return (object) [
      'start' => $date->start_date,
      'end' => $date->end_date,
    ];
  }

  protected function eventEnded() {
    if ($this->eventDate()) {
      $date = new DrupalDateTime();
      return $date->diff($this->eventDate()->end)->invert;
    }
    return FALSE;
  }

  protected function regEnded() {
    if ($this->regDate()) {
      $date = new DrupalDateTime();
      return $date->diff($this->regDate()->end)->invert;
    }
    return FALSE;
  }

  protected function regPending() {
    if ($this->regDate()) {
      $date = new DrupalDateTime();
      return !$date->diff($this->regDate()->start)->invert;
    }
    return FALSE;
  }

  protected function getStatusUser(UserInterface $user = NULL) {
    $status = 'available';
    if (!$user) {
      $id = \Drupal::service('current_user')->id();
      // $id = 353;
      $user = \Drupal\user\Entity\User::load($id);
    }
    $ids = $this->getStorage()->getQuery()
      ->condition('field_event', $this->getEntity()->id(), '=')
      ->condition('field_user', $id, '=')
      ->execute();
    if (empty($ids)) {
      return $status;
    }
    $registration_id = reset($ids);
    $registration = $this->getStorage()->load($registration_id);
    if ($registration->status->value == 'active') {
      return 'registered';
    }
    if ($registration->status->value == 'waitlist') {
      return 'waitlisted';
    }
    return $status;
  }

  protected function getTotalWaitlist() {
    $node = $this->getEntity();

    $ids = $this->getStorage()->getQuery()
      ->condition('field_event', $node->id(), '=')
      ->condition('status', 'waitlist', '=')
      ->execute();

    $registrations = $this->getStorage()->loadMultiple($ids);
    $waitlist = 0;
    foreach ($registrations as $registration) {
      $waitlist += (int) $registration->total();
    }
    return $waitlist;
  }

  private function mustRegister() {
    return !empty($this->getEntity()->get('field_must_register')->value);
  }

    /**
     * Entity type manager helper function.
     *
     * @return NodeStorageInterface
     */
  private function getStorage() {
    if (!isset($this->registrationManager)) {
      $this->registrationManager = \Drupal::service('entity_type.manager')->getStorage('event_registration');
    }
    return $this->registrationManager;
  }
}
