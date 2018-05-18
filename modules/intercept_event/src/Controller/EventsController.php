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
   * @var EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * @var EntityFormBuilderInterface
   */
  protected $entityFormBuilder;

  /**
   * @var FormBuilderInterface
   */
  protected $formBuilder;

  /**
   * EventsController constructor.
   *
   * @param EntityTypeManagerInterface $entity_type_manager
   * @param EntityFormBuilderInterface $entity_form_builder
   * @param FormBuilderInterface $form_builder
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, EntityFormBuilderInterface $entity_form_builder, FormBuilderInterface $form_builder) {
    $this->entityTypeManager = $entity_type_manager;
    $this->entityFormBuilder = $entity_form_builder;
    $this->formBuilder = $form_builder;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager'),
      $container->get('entity.form_builder'),
      $container->get('form_builder')
    );
  }

  /**
   * List.
   *
   * @return string
   *   Return a render array containing the events list block.
   */
  public function list() {
    $build = [];
    $build['#attached']['library'][] = 'intercept_event/eventList';
    $build['#markup'] = '';
    $build['intercept_event_list']['#markup'] = '<div id="eventListRoot" />';

    return $build;
  }

  /**
   * Event registration form.
   */
  public function register(\Drupal\node\NodeInterface $node) {
    $access_handler = $this->entityTypeManager()->getAccessControlHandler('event_registration');
    if (!$access_handler->createAccess('event_registration')) {
      return $this->redirect('user.login', [
        'destination' => Url::fromRoute('<current>')->toString(),
      ]);
    }

    $build = [];
    $build['#attached']['library'][] = 'intercept_event/eventRegister';
    $build['#markup'] = '';
    $build['intercept_event_register']['#markup'] = '<div id="eventRegisterRoot" data-uuid="' . $node->uuid() . '" />';

    return $build;
  }

  /**
   * Check bundle access and permissions.
   */
  public function registrationsAccess(NodeInterface $node) {
    return AccessResult::allowedIf($node->bundle() == 'event');
  }

  /**
   * Check bundle access and permissions.
   */
  public function attendanceAccess(NodeInterface $node) {
    return $this->registrationsAccess($node);
  }

  protected function getListBuilder($entity_type_id, NodeInterface $node = NULL) {
    $list_builder = \Drupal::service('entity_type.manager')->getHandler($entity_type_id, 'list_builder');
    if ($node) {
      $list_builder->setEvent($node);
    }
    return $list_builder;
  }

  public function registrations(NodeInterface $node) {
    $build = [
      'details' => [],
    ];
    $properties = $node->registration->getItemDefinition()->getSetting('properties');
    $field = $node->registration;
    foreach ($properties as $name => $property) {
      $build['details'][$name] = [
        '#type' => 'item',
        '#title' => $property->getLabel(),
        '#markup' => $field->{$name},
      ];
    }
    $build['list'] = $this->getListBuilder('event_registration', $node)->render();
    return $build;
  }

  public function attendance(NodeInterface $node) {
    $build = [];
    $build['list'] = $this->getListBuilder('event_attendance', $node)->render();
    return $build;
  }

}
