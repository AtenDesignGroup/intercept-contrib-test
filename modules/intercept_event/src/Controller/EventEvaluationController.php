<?php

namespace Drupal\intercept_event\Controller;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Access\AccessResultForbidden;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityFormBuilderInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Url;
use Drupal\node\NodeInterface;
use Drupal\user\UserInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Class EventEvaluationController.
 */
class EventEvaluationController extends ControllerBase {

  use \Drupal\intercept_core\EntityUuidConverterTrait;

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

  public function evaluate(\Symfony\Component\HttpFoundation\Request $request) {
    $method = $request->getMethod();
    $post = Json::decode($request->getContent());
    $current_user = $this->currentUser();
    if (!$evaluation = $this->getEvaluationFromPost($post)) {
      return JsonResponse::create(['error' => 'Invalid data'], 200);
    } 

    if (!$evaluation->access()->isAllowed()) {
      return JsonResponse::create(['error' => 'Access denied'], 200);
    } 

    if ($method == 'DELETE') {
      $evaluation->delete();
    }
    else {
      $criteria = !empty($post['evaluation_criteria'])
        ? ['taxonomy_term' => $this->convertUuids($post['evaluation_criteria'], 'taxonomy_term')]
        : [];
      $evaluation->evaluate($post['evaluation'], $criteria);
    }
    $result = [
      'message' => 'saved',
    ];
    return JsonResponse::create($result, 200);
  }

  protected function getEvaluationFromPost(array $post) {
    $entity_id = $this->convertUuid($post['event'], 'node');
    $user_id = !empty($post['user']) ? $this->convertUuid($post['user'], 'user') : NULL;
    $evaluation = \Drupal::service('intercept_event.evaluation_manager')->loadByProperties([
      'entity_id' => $entity_id,
      'entity_type' => 'node',
      'user_id' => $user_id,
    ]);
    return $evaluation;
  }

}
