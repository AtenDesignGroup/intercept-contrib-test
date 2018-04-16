<?php

namespace Drupal\intercept_event\Entity;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\RevisionableContentEntityBase;
use Drupal\Core\Entity\RevisionableInterface;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\StringTranslation\TranslationManager;
use Drupal\user\UserInterface;

/**
 * Defines the Event Recurrence entity.
 *
 * @ingroup intercept_event
 *
 * @ContentEntityType(
 *   id = "event_recurrence",
 *   label = @Translation("Event Recurrence"),
 *   handlers = {
 *     "storage" = "Drupal\intercept_event\EventRecurrenceStorage",
 *     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *     "list_builder" = "Drupal\intercept_event\EventRecurrenceListBuilder",
 *     "views_data" = "Drupal\intercept_event\Entity\EventRecurrenceViewsData",
 *
 *     "form" = {
 *       "default" = "Drupal\intercept_event\Form\EventRecurrenceForm",
 *       "add" = "Drupal\intercept_event\Form\EventRecurrenceForm",
 *       "edit" = "Drupal\intercept_event\Form\EventRecurrenceForm",
 *       "delete" = "Drupal\intercept_event\Form\EventRecurrenceDeleteForm",
 *     },
 *     "access" = "Drupal\intercept_event\EventRecurrenceAccessControlHandler",
 *     "route_provider" = {
 *       "html" = "Drupal\intercept_event\EventRecurrenceHtmlRouteProvider",
 *     },
 *   },
 *   base_table = "event_recurrence",
 *   revision_table = "event_recurrence_revision",
 *   revision_data_table = "event_recurrence_field_revision",
 *   admin_permission = "administer event recurrence entities",
 *   entity_keys = {
 *     "id" = "id",
 *     "revision" = "vid",
 *     "uuid" = "uuid",
 *     "uid" = "user_id",
 *     "langcode" = "langcode",
 *   },
 *   links = {
 *     "canonical" = "/event-recurrence/{event_recurrence}",
 *     "add-form" = "/event-recurrence/add",
 *     "edit-form" = "/event-recurrence/{event_recurrence}/edit",
 *     "delete-form" = "/event-recurrence/{event_recurrence}/delete",
 *     "version-history" = "/admin/structure/intercept/event_recurrence/{event_recurrence}/revisions",
 *     "revision" = "/admin/structure/intercept/event_recurrence/{event_recurrence}/revisions/{event_recurrence_revision}/view",
 *     "revision_revert" = "/admin/structure/intercept/event_recurrence/{event_recurrence}/revisions/{event_recurrence_revision}/revert",
 *     "revision_delete" = "/admin/structure/intercept/event_recurrence/{event_recurrence}/revisions/{event_recurrence_revision}/delete",
 *     "collection" = "/admin/content/event_recurrence",
 *   },
 *   field_ui_base_route = "event_recurrence.settings"
 * )
 */
class EventRecurrence extends RevisionableContentEntityBase implements EventRecurrenceInterface {

  use EntityChangedTrait;

  /**
   * {@inheritdoc}
   */
  public static function preCreate(EntityStorageInterface $storage_controller, array &$values) {
    parent::preCreate($storage_controller, $values);
    $values += [
      'user_id' => \Drupal::currentUser()->id(),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function label() {
    $label = t('Event Recurrence: %label', [
      '%label' => $this->id(),
    ]);
    return $label;
  }

  /**
   * {@inheritdoc}
   */
  protected function urlRouteParameters($rel) {
    $uri_route_parameters = parent::urlRouteParameters($rel);

    if ($rel === 'revision_revert' && $this instanceof RevisionableInterface) {
      $uri_route_parameters[$this->getEntityTypeId() . '_revision'] = $this->getRevisionId();
    }
    elseif ($rel === 'revision_delete' && $this instanceof RevisionableInterface) {
      $uri_route_parameters[$this->getEntityTypeId() . '_revision'] = $this->getRevisionId();
    }

    return $uri_route_parameters;
  }

  /**
   * {@inheritdoc}
   */
  public function preSave(EntityStorageInterface $storage) {
    parent::preSave($storage);

    foreach (array_keys($this->getTranslationLanguages()) as $langcode) {
      $translation = $this->getTranslation($langcode);

      // If no owner has been set explicitly, make the anonymous user the owner.
      if (!$translation->getOwner()) {
        $translation->setOwnerId(0);
      }
    }

    // If no revision author has been set explicitly, make the event_recurrence owner the
    // revision author.
    if (!$this->getRevisionUser()) {
      $this->setRevisionUserId($this->getOwnerId());
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getCreatedTime() {
    return $this->get('created')->value;
  }

  /**
   * {@inheritdoc}
   */
  public function setCreatedTime($timestamp) {
    $this->set('created', $timestamp);
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public function getOwner() {
    return $this->get('user_id')->entity;
  }

  /**
   * {@inheritdoc}
   */
  public function getOwnerId() {
    return $this->get('user_id')->target_id;
  }

  /**
   * {@inheritdoc}
   */
  public function setOwnerId($uid) {
    $this->set('user_id', $uid);
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public function setOwner(UserInterface $account) {
    $this->set('user_id', $account->id());
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type) {
    $fields = parent::baseFieldDefinitions($entity_type);

    $fields['user_id'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Authored by'))
      ->setDescription(t('The user ID of author of the Event Recurrence entity.'))
      ->setRevisionable(TRUE)
      ->setSetting('target_type', 'user')
      ->setSetting('handler', 'default')
      ->setTranslatable(TRUE)
      ->setDisplayOptions('view', [
        'label' => 'hidden',
        'type' => 'author',
        'weight' => 0,
      ])
      ->setDisplayOptions('form', [
        'type' => 'entity_reference_autocomplete',
        'weight' => 5,
        'settings' => [
          'match_operator' => 'CONTAINS',
          'size' => '60',
          'autocomplete_type' => 'tags',
          'placeholder' => '',
        ],
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel(t('Created'))
      ->setDescription(t('The time that the entity was created.'));

    $fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(t('Changed'))
      ->setDescription(t('The time that the entity was last edited.'));

    return $fields;
  }

}
