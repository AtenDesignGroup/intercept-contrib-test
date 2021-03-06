<?php

namespace Drupal\intercept_room_reservation\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\intercept_core\AlterableFormTrait;

/**
 * Class RoomReservationSettingsForm.
 *
 * @ingroup intercept_room_reservation
 */
class RoomReservationSettingsForm extends ConfigFormBase {

  use AlterableFormTrait;

  protected const CONFIG_NAME = 'intercept_room_reservation.settings';

  protected $entityTypeManager;

  protected $roleStorage;

  protected $roomReservationStorage;

  /**
   * Constructs a \Drupal\system\ConfigFormBase object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   */
  public function __construct(ConfigFactoryInterface $config_factory, EntityTypeManagerInterface $entity_type_manager) {
    parent::__construct($config_factory);
    $this->entityTypeManager = $entity_type_manager;
    $this->roleStorage = $this->entityTypeManager->getStorage('user_role');
    $this->roomReservationStorage = $this->entityTypeManager->getStorage('room_reservation');
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('entity_type.manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [self::CONFIG_NAME];
  }

  /**
   * Returns a unique string identifying the form.
   *
   * @return string
   *   The unique string identifying the form.
   */
  public function getFormId() {
    return 'room_reservation_settings';
  }

  /**
   * Defines the settings form for Room reservation entities.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   *
   * @return array
   *   Form definition array.
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildForm($form, $form_state);
    $config = $this->config(self::CONFIG_NAME);

    $form['agreement_text'] = [
      '#title' => $this->t('Terms and conditions agreement'),
      '#type' => 'text_format',
      '#default_value' => $this->getTextFormat('agreement_text', 'value'),
      '#format' => $this->getTextFormat('agreement_text', 'format'),
    ];

    $form['reservation_limit'] = [
      '#title' => $this->t('Room reservation limit'),
      '#type' => 'number',
      '#default_value' => $this->getReservationLimit(),
    ];

    $form['reservation_limit_text'] = [
      '#title' => $this->t('Room reservation limit user message'),
      '#type' => 'text_format',
      '#default_value' => $this->getTextFormat('reservation_limit_text', 'value'),
      '#format' => $this->getTextFormat('reservation_limit_text', 'format'),
    ];

    $form['email'] = [
      '#type' => 'vertical_tabs',
      '#title' => $this->t('Emails'),
      '#description' => $this->t('These emails are triggered when the status of a reservation is changed.'),
      '#tree' => TRUE,
    ];

    $emails = \Drupal\intercept_core\ReservationManager::emails();

    $room_reservation = \Drupal\intercept_room_reservation\Entity\RoomReservation::create([]);
    $status_options = \Drupal::service('entity_field.manager')
      ->getFieldStorageDefinitions('room_reservation')['field_status']
      ->getOptionsProvider('value', $room_reservation)
      ->getSettableOptions($this->currentUser());

    $options = ['any' => $this->t('Any'), 'empty' => $this->t('Empty (new reservation)')] + $status_options;

    foreach ($emails as $key => $title) {
      $form[$key] = [
        '#type' => 'details',
        '#title' => $title,
        '#group' => 'email',
        '#tree' => TRUE,
      ];
      $form[$key]['subject'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Subject'),
        '#default_value' => $this->getConfigValue($key, 'subject'),
        '#maxlength' => 180,
      ];
      $form[$key]['body'] = [
        '#type' => 'textarea',
        '#title' => $this->t('Body'),
        '#default_value' => $this->getConfigValue($key, 'body'),
        '#rows' => 15,
      ];
      $form[$key]['status_original'] = [
        '#title' => $this->t('Original status'),
        '#type' => 'select',
        '#multiple' => TRUE,
        '#options' => $options,
        '#description' => $this->t('The previous status of the reservation. If no value is selected, the email will be inactive.'),
        '#default_value' => $this->getConfigValue($key, 'status_original'),
      ];
      $form[$key]['status_new'] = [
        '#title' => $this->t('New status'),
        '#type' => 'select',
        '#multiple' => TRUE,
        '#options' => $options,
        '#description' => $this->t('The new status of the reservation. If no value is selected, the email will be inactive.'),
        '#default_value' => $this->getConfigValue($key, 'status_new'),
      ];

      $form[$key]['user'] = [
        '#title' => $this->t('User'),
        '#type' => 'select',
        '#options' => [
          'reservation_user' => $this->t('User the reservation is for'),
          'reservation_author' => $this->t('Reservation author user'),
          'user_role' => $this->t('User with a specified role'),
        ],
        '#empty_option' => $this->t('- Any user -'),
        '#description' => $this->t('Send email for a specific logged in user.'),
        '#default_value' => $this->getConfigValue($key, 'user'),
      ];

      $form[$key]['user_role'] = [
        '#title' => $this->t('User role'),
        '#type' => 'select',
        '#options' => $this->userRoleOptions(),
        '#multiple' => TRUE,
        '#default_value' => $this->getConfigValue($key, 'user_role'),
        '#states' => [
          'visible' => [
            ':input[name="' . $key . '[user]"]' => ['value' => 'user_role'],
          ],
        ],
      ];
    }

    $this->alterForm($form, $form_state);
    return $form;
  }

  private function userRoleOptions() {
    $intercept_roles = \Drupal\intercept_core\Form\UserPermissionsForm::roles();

    $options = array_map(function(\Drupal\user\RoleInterface $role) {
      return $role->label();
    }, $this->roleStorage->loadMultiple($intercept_roles));
    return $options;
  }

  private function getTextFormat($config_name, $subfield) {
    $config = $this->config(self::CONFIG_NAME)->get($config_name);
    $default_value = $subfield == 'value' ? '' : 'basic_html';
    return !empty($config) && !empty($config[$subfield]) ? $config[$subfield] : $default_value;
  }

  /**
   * Helper function to get reservation limit or a default 0.
   */
  private function getReservationLimit() {
    $config = $this->config(self::CONFIG_NAME);
    $reservation_limit = $config->get('reservation_limit');
    return isset($reservation_limit) ? $reservation_limit : 0;
  }

  /**
   * Helper function to traverse into the email config values.
   *
   * @return mixed
   */
  private function getConfigValue($key, $key1 = NULL, $key2 = NULL, $default = '') {
    $value = $default;
    if (!$config = $this->config(self::CONFIG_NAME)->get("email.$key")) {
      return $value;
    }
    if ($key1 && isset($config[$key1])) {
      $value = $config[$key1];
    }
    if ($key2 && isset($value[$key2])) {
      $value = $value[$key2];
    }
    return $value;
  }

  /**
   * Form submission handler.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config(self::CONFIG_NAME);
    $values = $form_state->cleanValues()->getValues();
    foreach ($values as $key => $info) {
      if (!empty($info["{$key}__active_tab"])) {
        continue;
      }
      $key = !empty($form[$key]['#group']) ? $form[$key]['#group'] . ".{$key}" : $key;
      $config->set($key, $info);
    }
    $config->save();
    parent::submitForm($form, $form_state);
  }

}
