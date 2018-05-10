<?php

namespace Drupal\intercept_event\Entity;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\intercept_room_reservation\Field\Computed\MethodItemList;
use Drupal\user\UserInterface;

/**
 * Defines the Event Registration entity.
 *
 * @ingroup intercept_event
 *
 * @ContentEntityType(
 *   id = "event_registration",
 *   label = @Translation("Event Registration"),
 *   handlers = {
 *     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *     "list_builder" = "Drupal\intercept_event\EventRegistrationListBuilder",
 *     "views_data" = "Drupal\intercept_event\Entity\EventRegistrationViewsData",
 *
 *     "form" = {
 *       "default" = "Drupal\intercept_event\Form\EventRegistrationForm",
 *       "add" = "Drupal\intercept_event\Form\EventRegistrationForm",
 *       "edit" = "Drupal\intercept_event\Form\EventRegistrationForm",
 *       "delete" = "Drupal\intercept_event\Form\EventRegistrationDeleteForm",
 *     },
 *     "access" = "Drupal\intercept_event\EventRegistrationAccessControlHandler",
 *     "route_provider" = {
 *       "html" = "Drupal\intercept_event\EventRegistrationHtmlRouteProvider",
 *     },
 *   },
 *   base_table = "event_registration",
 *   admin_permission = "administer event registration entities",
 *   entity_keys = {
 *     "id" = "id",
 *     "uuid" = "uuid",
 *     "uid" = "author",
 *     "langcode" = "langcode",
 *     "status" = "status",
 *   },
 *   links = {
 *     "canonical" = "/event-registration/{event_registration}",
 *     "add-form" = "/event-registration/add",
 *     "edit-form" = "/event-registration/{event_registration}/edit",
 *     "delete-form" = "/event-registration/{event_registration}/delete",
 *     "collection" = "/admin/content/event-registration",
 *   },
 *   field_ui_base_route = "event_registration.settings"
 * )
 */
class EventRegistration extends ContentEntityBase implements EventRegistrationInterface {

  use EntityChangedTrait;

  public function title() {
    // TODO: Make this dynamic.
    return 'Event registration';
  }

  /**
   * {@inheritdoc}
   */
  public static function preCreate(EntityStorageInterface $storage_controller, array &$values) {
    parent::preCreate($storage_controller, $values);
    $values += [
      'author' => \Drupal::currentUser()->id(),
    ];
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
    return $this->get('author')->entity;
  }

  /**
   * {@inheritdoc}
   */
  public function getOwnerId() {
    return $this->get('author')->target_id;
  }

  /**
   * {@inheritdoc}
   */
  public function setOwnerId($uid) {
    $this->set('author', $uid);
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public function setOwner(UserInterface $account) {
    $this->set('author', $account->id());
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type) {
    $fields = parent::baseFieldDefinitions($entity_type);

    $fields['title'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Title'))
      ->setComputed(TRUE)
      ->setClass(MethodItemList::class)
      ->setSetting('method', 'label')
      ->setReadOnly(TRUE);

    $fields['author'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Authored by'))
      ->setDescription(t('The user ID of author of the Event Registration entity.'))
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

    $fields['status'] = BaseFieldDefinition::create('list_string')
      ->setLabel(t('Status'))
      ->setDescription(t('A boolean indicating whether the Event Registration is published.'))
      ->setDefaultValue('active')
      ->setCardinality(1)
      ->setSetting('allowed_values', [
        'canceled' => 'Canceled',
        'active' => 'Active',
        'waitlist' => 'Waitlist'
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
