<?php

namespace Drupal\intercept_room_reservation\Entity;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\RevisionableContentEntityBase;
use Drupal\Core\Entity\RevisionableInterface;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\intercept_room_reservation\Field\ComputedEntityReferenceFieldItemList;
use Drupal\intercept_room_reservation\Field\ComputedFileFieldItemList;
use Drupal\user\UserInterface;

/**
 * Defines the Room reservation entity.
 *
 * @ingroup intercept_room_reservation
 *
 * @ContentEntityType(
 *   id = "room_reservation",
 *   label = @Translation("Room reservation"),
 *   handlers = {
 *     "storage" = "Drupal\intercept_room_reservation\RoomReservationStorage",
 *     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *     "list_builder" = "Drupal\intercept_room_reservation\RoomReservationListBuilder",
 *     "views_data" = "Drupal\intercept_room_reservation\Entity\RoomReservationViewsData",
 *     "translation" = "Drupal\intercept_room_reservation\RoomReservationTranslationHandler",
 *
 *     "form" = {
 *       "default" = "Drupal\intercept_room_reservation\Form\RoomReservationForm",
 *       "add" = "Drupal\intercept_room_reservation\Form\RoomReservationForm",
 *       "edit" = "Drupal\intercept_room_reservation\Form\RoomReservationForm",
 *       "delete" = "Drupal\intercept_room_reservation\Form\RoomReservationDeleteForm",
 *     },
 *     "access" = "Drupal\intercept_room_reservation\RoomReservationAccessControlHandler",
 *     "permission_provider" = "Drupal\entity\EntityPermissionProvider",
 *     "route_provider" = {
 *       "html" = "Drupal\intercept_room_reservation\RoomReservationHtmlRouteProvider",
 *     },
 *   },
 *   base_table = "room_reservation",
 *   data_table = "room_reservation_field_data",
 *   revision_table = "room_reservation_revision",
 *   revision_data_table = "room_reservation_field_revision",
 *   translatable = TRUE,
 *   admin_permission = "administer room reservation entities",
 *   entity_keys = {
 *     "id" = "id",
 *     "revision" = "vid",
 *     "uuid" = "uuid",
 *     "uid" = "user_id",
 *     "langcode" = "langcode",
 *     "status" = "status",
 *   },
 *   links = {
 *     "canonical" = "/room-reservation/{room_reservation}",
 *     "add-form" = "/room-reservation/add",
 *     "edit-form" = "/room-reservation/{room_reservation}/edit",
 *     "delete-form" = "/room-reservation/{room_reservation}/delete",
 *     "version-history" = "/admin/structure/room_reservation/{room_reservation}/revisions",
 *     "revision" = "/admin/structure/room_reservation/{room_reservation}/revisions/{room_reservation_revision}/view",
 *     "revision_revert" = "/admin/structure/room_reservation/{room_reservation}/revisions/{room_reservation_revision}/revert",
 *     "revision_delete" = "/admin/structure/room_reservation/{room_reservation}/revisions/{room_reservation_revision}/delete",
 *     "translation_revert" = "/admin/structure/room_reservation/{room_reservation}/revisions/{room_reservation_revision}/revert/{langcode}",
 *     "collection" = "/admin/content/room_reservations",
 *   },
 *   field_ui_base_route = "room_reservation.settings"
 * )
 */
class RoomReservation extends RevisionableContentEntityBase implements RoomReservationInterface {

  use EntityChangedTrait;

  use StringTranslationTrait;

  public function label() {
    $dates = $this->get('field_dates')->first();
    if (!$dates || !$dates->get('value') || !$dates->get('end_value')) {
      return '';
    }
    $values = [];
    if ($from_date = $dates->get('value')->getDateTime()) {
      $values['@date'] = $from_date->format('F n, Y');
      $values['@time_start'] = $from_date->format('H:i A');
    }
    if ($to_date = $dates->get('end_value')->getDateTime()) {
      $values['@time_end'] = $to_date->format('H:i A');
    }
    return !empty($values) ? $this->t('@date from @time_start to @time_end', $values) : '';
  }

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

    // If no revision author has been set explicitly, make the room_reservation owner the
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
  public function isPublished() {
    return (bool) $this->getEntityKey('status');
  }

  /**
   * {@inheritdoc}
   */
  public function setPublished($published) {
    $this->set('status', $published ? TRUE : FALSE);
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type) {
    $fields = parent::baseFieldDefinitions($entity_type);

    $fields['user_id'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Authored by'))
      ->setDescription(t('The user ID of author of the Room reservation entity.'))
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

    $fields['image'] = BaseFieldDefinition::create('image')
      ->setLabel(t('Image'))
      ->setDescription(t('The related room entity\'s image.'))
      ->setComputed(TRUE)
      ->setClass(ComputedFileFieldItemList::class)
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE)
      ->setSetting('target_fields', ['field_room', 'image_primary', 'field_media_image'])
      ->setReadOnly(TRUE);

    $fields['location'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Location'))
      ->setDescription(t('The related room\'s location entity.'))
      ->setComputed(TRUE)
      ->setClass(ComputedEntityReferenceFieldItemList::class)
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE)
      ->setTargetEntityTypeId('node')->setTargetBundle('location')
      ->setSetting('target_fields', ['field_room', 'field_location'])
      ->setReadOnly(TRUE);

    $fields['status'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Publishing status'))
      ->setDescription(t('A boolean indicating whether the Room reservation is published.'))
      ->setRevisionable(TRUE)
      ->setDefaultValue(TRUE);

    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel(t('Created'))
      ->setDescription(t('The time that the entity was created.'));

    $fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(t('Changed'))
      ->setDescription(t('The time that the entity was last edited.'));

    $fields['revision_translation_affected'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Revision translation affected'))
      ->setDescription(t('Indicates if the last edit of a translation belongs to current revision.'))
      ->setReadOnly(TRUE)
      ->setRevisionable(TRUE)
      ->setTranslatable(TRUE);

    return $fields;
  }

}
