<?php

namespace Drupal\intercept_event\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityFormBuilderInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Url;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class EventRegistrationController.
 */
class EventRegistrationController extends ControllerBase {

  /**
   * @var EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * @var EntityFormBuilderInterface
   */
  protected $entityFormBuilder;
  /**
   * EventsController constructor.
   *
   * @param EntityTypeManagerInterface $entity_type_manager
   * @param EntityFormBuilderInterface $entity_form_builder
   */

  public function __construct(EntityTypeManagerInterface $entity_type_manager, EntityFormBuilderInterface $entity_form_builder) {
    $this->entityTypeManager = $entity_type_manager;
    $this->entityFormBuilder = $entity_form_builder;
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
   * Event registration form.
   */
  public function register(NodeInterface $node) {
    $access_handler = $this->entityTypeManager()->getAccessControlHandler('event_registration');
    if (!$access_handler->createAccess('event_registration')) {
      return $this->redirect('user.login', [
        'destination' => Url::fromRoute('<current>')->toString(),
      ]);
    }
    return [];
  }

  public function overview() {

  }
}
