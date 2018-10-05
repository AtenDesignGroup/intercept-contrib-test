<?php

namespace Drupal\intercept_room_reservation\Controller;

use Drupal\intercept_core\Controller\ManagementControllerBase;
use Drupal\intercept_room_reservation\Form\RoomReservationSettingsForm;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\HttpFoundation\Request;

class ManagementController extends ManagementControllerBase {

  public function alter(array &$build, $page_name) {
    if ($page_name == 'system_configuration') {
      $build['links']['room_reservations'] = $this->getManagementButton('Room Reservations', 'room_reservation_configuration');
    }
    if ($page_name == 'default') {
      $build['links']['room'] = $this->getButton('Reserve a room', 'intercept_room_reservation.reserve_room');
    }
  }

  public function viewRoomReservations(AccountInterface $user, Request $request) {
    return [
      '#type' => 'view',
      '#name' => 'intercept_room_reservations',
      '#display_id' => 'embed', 
    ];
  }

  public function viewRoomReservationConfiguration(AccountInterface $user, Request $request) {
    // This can also be moved into a separate function, for example:
    // 'reservation_canceled' - viewRoomReservationConfigurationReservationCanceled()
    if ($form_key = $request->query->get('view')) {
      $form_object = $this->classResolver
        ->getInstanceFromDefinition(RoomReservationSettingsForm::class)
        ->addAlter(self::class . '::alterEmailReservationSettingsForm');
      $form_state = new \Drupal\Core\Form\FormState();
      $form_state->set('show_form_key', $form_key);
      $form = $this->formBuilder()->buildForm($form_object, $form_state);
      return $form;
    }

    $build = [
      'title' => $this->title('Room Reservations'),
      'taxonomies' => $this->getTaxonomyVocabularyTable(['meeting_purpose']),
    ];

    $build['settings'] = [
      'title' => $this->h2('Settings'),
    ];

    $table = $this->table();
    $emails = \Drupal\intercept_core\ReservationManager::emails();
    foreach ($emails as $key => $name) {
      $table->row($this->getButtonSubpage($key, $name), '');
    }

    $build['settings']['emails'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Reservation emails'),
    ];

    $build['settings']['emails']['table'] = $table->toRenderable();

    $table = $this->table();
    $table->row($this->getButtonSubpage('reservation_limit', 'Number of Customer Reservations'), '');

    $build['settings']['general'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('General settings'),
    ];

    $build['settings']['general']['table'] = $table->toRenderable();
    return $build;
  }

  public static function alterEmailReservationSettingsForm(array &$form, FormStateInterface $form_state) {
    $show = $form_state->get('show_form_key');
    $children = \Drupal\Core\Render\Element::children($form);
    $skip = ['actions', 'email'];

    $form['email']['#type'] = 'container';
    foreach ($children as $name) {
      if (in_array($name, $skip)) {
        continue;
      }
      if ($name == $show) {
        $form[$name]['#open'] = TRUE;
        continue;
      }
      $form[$name]['#access'] = FALSE;
    }
  }
}
