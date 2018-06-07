<?php

namespace Drupal\intercept_core\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Routing\CurrentRouteMatch;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\NameConverter\CamelCaseToSnakeCaseNameConverter;

class ManagementControllerBase extends ControllerBase {

  /**
   * Drupal\Core\Session\AccountProxyInterface definition.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * @var CurrentRouteMatch
   */
  protected $routeMatch;

  /**
   * Constructs a new AdminController object.
   */
  public function __construct(AccountProxyInterface $current_user, CurrentRouteMatch $route_match) {
    $this->currentUser = $current_user;
    $this->routeMatch = $route_match;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('current_user'),
      $container->get('current_route_match')
    );
  }

  /**
   * Defaultpage.
   *
   * @return array 
   *   Rendered array for admin page. 
   */
  public function view(AccountInterface $user, Request $request) {
    if ($method = $this->getMethodName()) {
      return $this->{$method}($user, $request);
    }
    return [
      '#type' => 'markup',
      '#markup' => $this->t('Controller not found.'),
    ];
  }

    /**
     * @return bool|null|string|string[]
     */
  protected function getMethodName() {
    $method = '';
    if ($name = $this->routeMatch->getRouteObject()->getOption('_page_name')) {
      $converter = new CamelCaseToSnakeCaseNameConverter();
      $method = $converter->denormalize('view_' . $name);
    }
    return method_exists($this, $method) ? $method : FALSE;
  }

  protected function getTaxonomyVocabularyTable($ids = [], $title = 'Taxonomies') {
    $taxonomy_storage = $this->entityTypeManager()->getStorage('taxonomy_vocabulary');
    $output = [
      'title' => [
        '#type' => 'html_tag',
        '#tag' => 'h2',
        '#value' => $this->t($title),
      ],
      'table' => [
        '#type' => 'table',
      ],
    ];
    foreach ($ids as $id) {
      $vocabulary = $taxonomy_storage->load($id);
      $output['table'][] = [
        'name' => [
          '#markup' => $vocabulary->link(NULL, 'edit-form')->__toString()
        ],
        'description' => [
          '#markup' => $vocabulary->get('description')
        ],
      ];
    }
    return $output;
  }

  protected function getButton($title, $route, $params = []) {
    $button = \Drupal\Core\Link::createFromRoute($title, $route, $params)->toRenderable();
    $button['#attributes']['class'][] = 'button';
    return $button;

    $add_event_series = \Drupal\Core\Link::createFromRoute('Add Event Series', 'node.add', ['node_type' => 'event_series'])->toRenderable();
    $add_event_series['#attributes']['class'][] = 'button';
  }

  protected function getList($class, $entity_type = 'node') {
    $entity_type = $this->entityTypeManager()->getDefinition($entity_type);
    return $this->entityTypeManager()
      ->createHandlerInstance($class, $entity_type)
      ->render();
  }
  
  protected function h2($text) {
    return [
      '#type' => 'html_tag',
      '#tag' => 'h2',
      '#value' => $this->t($text),
    ];
  }
}
