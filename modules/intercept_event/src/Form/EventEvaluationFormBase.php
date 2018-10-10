<?php

namespace Drupal\intercept_event\Form;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\intercept_event\EventEvaluationManager;
use Drupal\user\UserInterface;
use Drupal\user\UserStorage;
use Symfony\Component\DependencyInjection\ContainerInterface;

abstract class EventEvaluationFormBase extends FormBase {

  protected $entity;

  protected $eventEvaluationManager;

  public function __construct(EventEvaluationManager $event_evaluation_manager) {
    $this->eventEvaluationManager = $event_evaluation_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('intercept_event.evaluation_manager')
    );
  }

  public function setEntity(\Drupal\Core\Entity\EntityInterface $entity) {
    $this->entity = $entity;
    return $this;
  }

}
