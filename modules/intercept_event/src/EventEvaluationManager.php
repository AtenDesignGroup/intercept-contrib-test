<?php

namespace Drupal\intercept_event;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Link;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\node\NodeInterface;
use Drupal\votingapi\VoteStorageInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class EventEvaluationManager {

  use StringTranslationTrait;

  const VOTE_TYPE_ID = 'evaluation';

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

  /**
   * Constructs a new EventEvaluationManager object.
   */
  public function __construct(AccountProxyInterface $current_user, EntityTypeManagerInterface $entity_type_manager) {
    $this->currentUser = $current_user;
    $this->entityTypeManager = $entity_type_manager;
    $this->voteStorage = $this->entityTypeManager->getStorage('vote');
  }

  public function loadByEntity(\Drupal\Core\Entity\EntityInterface $entity) {
    return $this->loadByProperties([
      'entity_type' => $entity->getEntityTypeId(),
      'entity_id' => $entity->id(),
    ]);
  }
  public function loadByProperties(array $properties = []) {
    if (empty($properties['entity_type']) || empty($properties['entity_id'])) {
      return FALSE;
    }
    if (!empty($properties['entity_type']) && !empty($properties['entity_id'])) {
      $entity = $this->entityTypeManager->getStorage($properties['entity_type'])->load($properties['entity_id']);
    }
    $user_id = !empty($properties['user_id']) ? $properties['user_id'] : $this->currentUser->id();
    /** @var \Drupal\votingapi\VoteStorageInterface $vote_storage */
    $vote_storage = $this->entityTypeManager->getStorage('vote');
    $vote_ids = $vote_storage->getUserVotes(
      $user_id,
      self::VOTE_TYPE_ID,
      $properties['entity_type'],
      $properties['entity_id']
    );
    if (!empty($vote_ids)) {
      $votes = $vote_storage->loadMultiple($vote_ids);
      $vote = reset($votes);
    }
    else {
      /** @var \Drupal\votingapi\VoteInterface $vote */
      $vote_type = $this->entityTypeManager->getStorage('vote_type')->load(self::VOTE_TYPE_ID);
      $vote = $vote_storage->create(['type' => self::VOTE_TYPE_ID]);
      $vote->setOwnerId($user_id);
      $vote->setVotedEntityId($entity->id());
      $vote->setVotedEntityType($properties['entity_type']);
      $vote->setValueType($vote_type->getValueType());
      // TODO: Finish calculating results.
      //$vote->setValue($value);
      //$vote->save();
      //$this->resultManager->recalculateResults($entity_type_id, $entity_id, $vote_type_id);
    }
    return new EventEvaluation($vote);
  }

  public function getDefaultForm(\Drupal\Core\Entity\EntityInterface $entity) {
    $class = \Drupal\intercept_event\Form\EventEvaluationDefaultForm::class;
    $form_arg = \Drupal::service('class_resolver')->getInstanceFromDefinition($class)
      ->setEntity($entity);
    $form_state = new \Drupal\Core\Form\FormState();
    return \Drupal::service('form_builder')
      ->buildForm($form_arg, $form_state);
  }

  public function getJsForm(\Drupal\Core\Entity\EntityInterface $entity) {
    $class = \Drupal\intercept_event\Form\EventEvaluationJsForm::class;
    $form_arg = \Drupal::service('class_resolver')->getInstanceFromDefinition($class)
      ->setEntity($entity);
    $form_state = new \Drupal\Core\Form\FormState();
    return \Drupal::service('form_builder')
      ->buildForm($form_arg, $form_state);
  }

}
