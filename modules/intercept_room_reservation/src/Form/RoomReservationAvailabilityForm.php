<?php

namespace Drupal\intercept_room_reservation\Form;


use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\DateTime\DrupalDateTime;
// TODO: Replace this with the interface once it is fully developed.
use Drupal\intercept_core\ReservationManager;
use Drupal\intercept_core\Utility\Dates;
use Symfony\Component\DependencyInjection\ContainerInterface;

class RoomReservationAvailabilityForm extends FormBase {

  /**
   * @var ReservationManager
   */
  protected $reservationManager;

  /**
   * @var Dates
   */
  protected $dateUtility;

  /**
   * RoomReservationAvailabilityForm constructor.
   *
   * @param ReservationManager $reservation_manager
   */
  public function __construct(ReservationManager $reservation_manager, Dates $date_utility) {
    $this->reservationManager = $reservation_manager;
    $this->dateUtility = $date_utility;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('intercept_core.reservation.manager'),
      $container->get('intercept_core.utility.dates')
    );
  }

  public function getFormId() {
    return 'room_reservation_availability_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state) {
    $input = $form_state->getUserInput();

    $form['#attributes']['class'][] = 'clearfix row';

    $form['controls'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['col', 'm5']],
    ];

    $form['controls']['start_date'] = [
      '#type' => 'datetime',
      '#title' => $this->t('Start datetime'),
      '#date_timezone' => 'UTC',
      '#default_value' => new DrupalDateTime('today 09:00', 'UTC'),
    ];
    $form['controls']['end_date'] = [
      '#type' => 'datetime',
      '#title' => $this->t('End datetime'),
      '#date_timezone' => 'UTC',
      '#default_value' => new DrupalDateTime('today 16:00', 'UTC'),
    ];
    $form['controls']['duration'] = [
      '#type' => 'number',
      '#title' => $this->t('Duration'),
      '#description' => $this->t('In minutes'),
      '#default_value' => 60,
    ];
    $form['controls']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Submit'),
    ];

    if (!empty($input) && $form_state->get('availability')) {
      $this->buildResultsForm($form, $form_state);
    }

    return $form;
  }

  protected function buildResultsForm(array &$form, FormStateInterface $form_state) {
    $node = $form_state->get('node');
    $results = $form_state->get('availability')[$node->uuid()];
    $debug = $results['debug'];
    $hours = $debug['hours'];
    $param_info = $debug['param_info'];
    $duration = (int) $form_state->getValue('duration');

    $start_date = $this->dateUtility->getDate($param_info['start']['storage_timezone']);
    $form['result'] = [
      '#title' => $this->t('Results for @day', [
        '@day' => $start_date->format('l'),
      ]),
      '#type' => 'details',
      '#open' => TRUE,
      '#attributes' => ['class' => ['col', 'm7']],
    ];

    $form['result']['api'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('API'),
      'has_reservation_conflict' => [
        '#type' => 'item',
        '#title' => $this->t('Has reservation conflict?'),
        '#markup' => $results['has_reservation_conflict'] ? 'Yes' : 'No',
      ],
      'has_open_hours_conflict' => [
        '#type' => 'item',
        '#title' => $this->t('Has open hours conflict?'),
        '#markup' => $results['has_open_hours_conflict'] ? 'Yes' : 'No',
      ],
    ];

    $form['result']['params'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Parameters'),
      'hours' => [
        '#title' => $this->t('Hours'),
        '#type' => 'table',
        '#rows' => [],
        '#header' => ['Timezone',
          'Start time',
          'Location',
          'End time',
          'Location'
        ],
      ],
    ];

    foreach (['default', 'storage'] as $tz) {
      $method = 'get' . ucwords($tz) . 'Timezone';

      $param_start    = $this->rf($param_info['start'][$tz . '_timezone'], $tz);
      $location_start = $hours ? $this->rf($hours['start'][$tz . '_timezone'], $tz) : 'Closed';
      $param_end      = $this->rf($param_info['end'][$tz . '_timezone'], $tz);
      $location_end   = $hours ? $this->rf($hours['end'][$tz . '_timezone'], $tz) : 'Closed';
      $column = [
        $this->dateUtility->{$method}()->getName(),
        $param_start,
        $location_start,
        $param_end,
        $location_end,
      ];
      $form['result']['params']['hours']['#rows'][] = $column;
    }

    foreach (['start', 'end'] as $type) {
      $label = ucwords($type);
      $values = $results['debug']['param_info'][$type];
      $column = [
        "$label param",
        $values['default_timezone'],
        $values['storage_timezone'],
      ];
      $form['result']['hours']['#rows'][] = $column;
    }

    $form['result']['schedule'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Schedule'),
      'dates' => [
        '#title' => $this->t('Dates and times'),
        '#type' => 'table',
        '#header' => [
          'Start',
          'End',
          '',
          //'Location',
          'Duration',
        ],
        '#rows' => [],
      ],
    ];

    $form['result']['schedule_open_hours'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Schedule - open hours'),
      'dates' => [
        '#title' => $this->t('Dates and times'),
        '#type' => 'table',
        '#header' => [
          'Start',
          'End',
          '',
          //'Location',
          'Duration',
        ],
        '#rows' => [],
      ],
    ];

    $this->scheduleTable($debug['schedule'], $form['result']['schedule']['dates']['#rows'], $duration);
    $this->scheduleTable($debug['schedule_by_open_hours'], $form['result']['schedule_open_hours']['dates']['#rows'], $duration);
  }

  /**
   * Reformat date string for simpler display.
   *
   * @return string
   */
  private function rf($string, $tz) {
    $new = $this->dateUtility->getDate($string, $tz);
    return $new->format('m/d - G:i');
  }

  private function format() {
    return \Drupal\intercept_core\ReservationManager::FORMAT;
  }

  private function scheduleTable(array $openings , array &$rows, $duration) {
    foreach ($openings as $dates) {
      // This should change to be more consistent.
      // @see ReservationManager::getOpenings()
      if (is_string($dates)) {
        $this->scheduleTableRow($dates, $rows);
        continue;
      }

      if (!empty($dates['preceding_reservations'])) {
        foreach ($dates['preceding_reservations'] as $id) {
          $this->scheduleTableRow($id, $rows);
        }
      }
      $column = [
        $dates['start'],
        $dates['end'],
        "Open slot",
        [
          'data' => $dates['duration'],
          'class' => $dates['duration'] >= $duration ? 'color-success' : 'color-error',
        ],
      ];
      $rows[] = $column;
      if (!empty($dates['following_reservation'])) {
        $this->scheduleTableRow($dates['following_reservation'], $rows);
      }
    }
  }
  private function scheduleTableRow($id, &$rows) {
    $reservation = \Drupal\intercept_room_reservation\Entity\RoomReservation::load($id);
    $int = $reservation->getInterval();
    $other = [];
    foreach (['h' => 'hours', 'd' => 'days', 'm' => 'months'] as $prop => $label) {
      if ($int->{$prop} > 0) {
        $v = $int->{$prop};
        $other[] = "$v $label";
      }
    }
    $duration = $this->t('@minutes min@other', [
      '@minutes' => $reservation->getDuration(),
      '@other' => !empty($other) ? ' (' . join(', ', $other) . ')' : '',
    ]);
    $column = [
      $reservation->getStartDate()->format($this->format()),
      $reservation->getEndDate()->format($this->format()),
      $reservation->link('Reservation'),
      $duration,
    ];

    $rows[] = $column;
  }

  public function submitForm(array &$form, FormStateInterface $form_state) {
    $form_state->setRebuild(TRUE);
    $values = $form_state->getValues();
    $format = \Drupal\intercept_core\ReservationManager::FORMAT;
    $availability = \Drupal::service('intercept_core.reservation.manager')->availability([
      'debug' => TRUE,
      'start' => $values['start_date']->format($format),
      'end' => $values['end_date']->format($format),
      'duration' => $values['duration'],
      'rooms' => [
        $form_state->get('node')->id(),
      ],
    ]);
    $form_state->set('availability', $availability);
  }

}
