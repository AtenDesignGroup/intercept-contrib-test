<?php

namespace Drupal\intercept_event;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Access\AccessResult;
use Drupal\Core\Access\AccessResultAllowed;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Link;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\node\NodeInterface;
use Drupal\votingapi\VoteStorageInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class EventEvaluation {

  const FIELD_NAME_POSITIVE = 'field_evaluation_criteria_pos';

  const FIELD_NAME_NEGATIVE = 'field_evaluation_criteria_neg';

  use StringTranslationTrait;

  /**
   * @var AccountProxyInterface
   */
  protected $currentUser;

  /**
   * @var EntityTypeManagerInterface
   */
  protected $entityTypeManager;

    /**
     * @var VoteStorageInterface
     */
  protected $voteStorage;

  protected $eventTypePrimary;

  public function __construct($vote) {
    $this->vote = $vote;
  }

  public function evaluate($value, $data = []) {
    $this->vote->setValue($value);
    $this->vote->set('vote_criteria', $data);
    $this->vote->save();
  }

  public function getFeedback() {
    $feedback = $this->vote->feedback;
    return !empty($feedback) ? $feedback->getString() : '';
  }

  public function setFeedback($text) {
    $this->vote->setValue(-1)
      ->set('feedback', $text)
      ->save();
  }

  public function delete() {
    $this->vote->delete();
  }

  public function getVote() {
    return $this->vote->get('value')->getString();
  }

  public function hasCriteria() {
    return $this->getPrimaryEventType() && !empty($this->getCriteria());
  }

  public function getVoteCriteria() {
    return $this->vote->get('vote_criteria')->taxonomy_term;
  }

  public function getPrimaryEventType() {
    if (!isset($this->eventTypePrimary)) {
      $this->eventTypePrimary = FALSE;
      if (!$event = $this->vote->get('entity_id')->entity) {
        return $this->eventTypePrimary;
      }
      if (!$event_type = $event->get('field_event_type_primary')->entity) {
        return $this->eventTypePrimary;
      }
      $this->eventTypePrimary = $event_type;
    }
    return $this->eventTypePrimary;
  }

  public function getNegativeCriteria() {
    $criteria = $this->getCriteria();
    if (!empty($criteria[self::FIELD_NAME_NEGATIVE])) {
      return $criteria[self::FIELD_NAME_NEGATIVE];
    }
    return [];
  }

  public function getNegativeCriteriaOptions() {
    $criteria = $this->getNegativeCriteria();
    return array_map(function($term) {
      return $term->label();
    }, $criteria);
  }

  public function getPositiveCriteria() {
    $criteria = $this->getCriteria();
    $criteria = $this->getCriteria();
    if (!empty($criteria[self::FIELD_NAME_POSITIVE])) {
      return $criteria[self::FIELD_NAME_POSITIVE];
    }
    return [];
  }

  public function getPositiveCriteriaOptions() {
    $criteria = $this->getPositiveCriteria();
    return array_map(function($term) {
      return $term->label();
    }, $criteria);
  }

  public function getCriteria() {
    $criteria = [];
    if (!$event_type = $this->getPrimaryEventType()) {
      return $criteria;
    }
    $fields = [self::FIELD_NAME_POSITIVE, self::FIELD_NAME_NEGATIVE];
    foreach ($fields as $field_name) {
      if ($event_type->get($field_name)->isEmpty()) {
        continue;
      }
      $criteria[$field_name] = [];
      foreach ($event_type->get($field_name)->getIterator() as $item) {
        $criteria[$field_name][$item->entity->id()] = $item->entity;
      }
    }
    return $criteria;
  }

  public function access(\Drupal\Core\Session\AccountInterface $account = NULL) {
    if (!$account) {
      $account = \Drupal::service('current_user');
    }
    if ($account->hasPermission('evaluate any event')) {
      return AccessResult::allowed();
    }
    if (!$account->hasPermission('evaluate own event')) {
      return AccessResult::neutral();
    }
    // TODO: Move this to the event manager.
    $flaggings = \Drupal::service('entity_type.manager')
      ->getStorage('flagging')
      ->loadByProperties([
        'entity_id' => $this->vote->get('entity_id')->entity->id(),
        'uid' => $account->id(),
        'flag_id' => 'saved_event',
      ]);

    if (!empty($flaggings)) {
      return AccessResult::allowed();
    }

    $attendance = \Drupal::service('entity_type.manager')
      ->getStorage('event_attendance')
      ->loadByProperties([
        'field_user' => $account->id(),
        'field_event' => $this->vote->get('entity_id')->entity->id(),
      ]);
    if (!empty($attendance)) {
      return AccessResult::allowed();
    }

    $registrations = \Drupal::service('entity_type.manager')
      ->getStorage('event_registration')
      ->loadByProperties([
        'field_user' => $account->id(),
        'field_event' => $this->vote->get('entity_id')->entity->id(),
      ]);

    if (!empty($registrations)) {
      return AccessResult::allowed();
    }

    return AccessResult::neutral();
  }
}
