<?php

namespace Drupal\intercept_event\Controller;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityFormBuilderInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormBuilderInterface;
use Drupal\Core\Url;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class EventsController.
 */
class EventsController extends ControllerBase {

  /**
   * List.
   *
   * @return string
   *   Return a render array containing the events list block.
   */
  public function list() {
    $build = [];
    $build['#attached']['library'][] = 'intercept_event/eventList';
    $build['intercept_event_list']['#markup'] = '<div id="eventListRoot" ></div>';

    return $build;
  }

  /**
   * Check bundle access and permissions.
   */
  public function registrationsAccess(NodeInterface $node) {
    $has_permission = $this->currentUser()->hasPermission('access event registrations tab');
    return AccessResult::allowedIf($this->isEventBundle($node) && $has_permission);
  }

  /**
   * Check bundle access and permissions.
   */
  public function attendanceAccess(NodeInterface $node) {
    $has_permission = $this->currentUser()->hasPermission('access event attendance tab');
    return AccessResult::allowedIf($this->isEventBundle($node) && $has_permission);
  }

  private function isEventBundle(NodeInterface $node) {
    return $node->bundle() == 'event';
  }

  protected function getListBuilder($entity_type_id, NodeInterface $node = NULL) {
    $list_builder = $this->entityTypeManager()->getListBuilder($entity_type_id);
    if ($node) {
      $list_builder->setEvent($node);
    }
    return $list_builder;
  }

  public function registrations(NodeInterface $node) {
    $build = [
      '#theme' => 'node_event_registrations',
      '#content' => [],
    ];
    $content = &$build['#content'];
    $content['add'] = [
      '#title' => 'Add event registration',
      '#type' => 'link',
      '#url' => Url::fromRoute('entity.event_registration.event_form', [
        'node' => $node->id(),
        'destination' => Url::fromRoute('<current>')->toString(),
      ]),
      '#attributes' => [
        'class' => ['button button-action']
      ],
    ];
    $properties = $node->registration->getItemDefinition()->getSetting('properties');
    $field = $node->registration;
    foreach ($properties as $name => $property) {
      // This property doesn't need to be seen by staff when viewing Registrations tab.
      if ($name == 'status_user' || $name == 'status') {
        continue;
      }
      $content['details'][$name] = [
        '#type' => 'item',
        '#title' => $property->getLabel(),
        '#markup' => $field->{$name},
      ];
    }
    $content['list'] = $this->getListBuilder('event_registration', $node)->render();
    return $build;
  }

  public function attendance(NodeInterface $node) {
    $build = [];
    $build['list'] = $this->getListBuilder('event_attendance', $node)->render();
    return $build;
  }

  private function title($text) {
    return [
      '#type' => 'html_tag',
      '#tag' => 'h2',
      '#value' => $this->t($text),
    ];
  }

  /**
   * Node analysis task callback.
   */
  public function analysis(NodeInterface $node) {
    $event_uuid = $node->uuid();
    $event_nid = $node->id();
    $view_builder = \Drupal::entityTypeManager()->getViewBuilder('node');

    return [
      '#theme' => 'node_event_analysis',
      '#content' => [    // Add Event Header
        'header' => $build['header'] = $view_builder->view($node, 'header'),
        'attendance' => [
          'title' => $this->t('Number of Attendees'),
          'form' => \Drupal::service('entity.form_builder')->getForm($node, 'attendance'),
        ],
        'staff_evaluation' => [
          'title' => $this->t('Evaluate Your Event'),
          'form' => \Drupal::service('intercept_event.evaluation_manager')->getStaffForm($node),
        ],
        'attendance_list' => [
          '#markup' => '<div id="eventAttendanceListRoot" data-event-uuid="' . $event_uuid . '" data-event-nid="' . $event_nid . '"></div>',
          '#attached' => [
            'library' => ['intercept_event/eventAttendanceList']
          ],
        ],
        'customer_evaluations' => [
          '#markup' => '<div class="js-event-evaluations--attendee" data-event-uuid="' . $event_uuid . '" data-event-nid="' . $event_nid . '"></div>',
          '#attached' => [
            'library' => ['intercept_event/eventCustomerEvaluations']
          ],
        ],
      ],
    ];
  }
}
