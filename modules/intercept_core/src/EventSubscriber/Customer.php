<?php

namespace Drupal\intercept_core\EventSubscriber;

use Drupal\Core\Routing\RouteBuildEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\EventDispatcher\Event;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\polaris\ClientInterface;

/**
 * Class RoomReservationController.
 */
class Customer implements EventSubscriberInterface {

  /**
   * Drupal\Core\Session\AccountProxyInterface definition.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;
  /**
   * Drupal\Core\Entity\EntityTypeManagerInterface definition.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;
  /**
   * Drupal\polaris\ClientInterface definition.
   *
   * @var \Drupal\polaris\ClientInterface
   */
  protected $polarisClient;

  /**
   * Constructs a new RoomReservationController object.
   */
  public function __construct(AccountProxyInterface $current_user, EntityTypeManagerInterface $entity_type_manager, ClientInterface $polaris_client) {
    $this->currentUser = $current_user;
    $this->entityTypeManager = $entity_type_manager;
    $this->polarisClient = $polaris_client;
  }

  /**
   * {@inheritdoc}
   */
  static function getSubscribedEvents() {
    $events['routing.route_alter'] = ['routeAlter'];

    return $events;
  }

  /**
   * This method is called whenever the routing.route_alter event is
   * dispatched.
   *
   * @param RouteBuildEvent $event
   */
  public function routeAlter(RouteBuildEvent $event) {
    $collection = $event->getRouteCollection();
    if ($profile_route = $collection->get('entity.profile.type.user_profile_form')) {
      $profile_route
        ->setDefault('_controller', '\Drupal\intercept_core\Controller\ProfileController::userProfileForm')
        ->setDefault('_title_callback', '\Drupal\intercept_core\Controller\ProfileController::addPageTitle')
        ->setPath('/user/{user}/settings')
      ->setDefault('profile_type', 'customer');
    }
  }

}
