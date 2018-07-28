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
      $build = $this->{$method}($user, $request);
      return $this->doAlter($build);
    }
    return [
      '#type' => 'markup',
      '#markup' => $this->t('Controller not found.'),
    ];
  }

  protected function doAlter(array $build) {
    $definitions = \Drupal::service('plugin.manager.intercept_management')->getDefinitions();
    $machine_name = $this->getMachineName();
    foreach ($definitions as $module => $definition) {
      list($callable, $method) = \Drupal::service('controller_resolver')->getControllerFromDefinition($definition['controller']);
      $callable->alter($build, $machine_name);
    }
    return $build;
  }

  protected function getMachineName() {
    if ($name = $this->routeMatch->getRouteObject()->getOption('_page_name')) {
      return $name;
    }
    return FALSE;
  }

  public function alter(array &$build, $page_name) {}

  /**
   * @return bool|null|string|string[]
   */
  protected function getMethodName() {
    $method = '';
    if ($name = $this->routeMatch->getRouteObject()->getOption('_page_name')) {
      $method = $this->convertToSnakeCase('view_' . $name);
    }
    return method_exists($this, $method) ? $method : FALSE;
  }

  protected function convertToSnakeCase($name) {
    $converter = new CamelCaseToSnakeCaseNameConverter();
    return $converter->denormalize($name);
  }

  protected function getModuleName() {
    return explode('\\', get_class($this))[1];
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
          '#markup' => $vocabulary->link(NULL, 'overview-form')->__toString()
        ],
        'description' => [
          '#markup' => $vocabulary->get('description')
        ],
      ];
    }
    return $output;
  }

  protected function getManagementButton($title, $name, $params = []) {
    $route = "{$this->getModuleName()}.management.$name";
    return $this->getButton($title, $route, [
      'user' => $this->currentUser()->id(),
    ]);
  }

  protected function getButton($title, $route, $params = []) {
    $button = \Drupal\Core\Link::createFromRoute($title, $route, $params)->toRenderable();
    $button['#attributes']['class'][] = 'btn-block';
    $button['#access'] = $button['#url']->access($this->currentUser());
    return $button;
  }

  protected function getList($class, $entity_type = 'node') {
    $entity_type = $this->entityTypeManager()->getDefinition($entity_type);
    return $this->entityTypeManager()
      ->createHandlerInstance($class, $entity_type)
      ->render();
  }

  protected function table() {
    return new class {
      private $table = [
        '#type' => 'table',
        '#rows' => [],
      ];
      public function row($link, $description) {
        $row = [];
        $row[] = [
          'data' => $link,
        ];
        $row[] = [
          'data' => $description,
        ];
        $this->table['#rows'][] = $row;
      }
      public function toArray() {
        return $this->table;
      }
    };
  }

  protected function hideElements(&$form, $keep = []) {
    $keep = array_merge([
      'actions',
      'form_build_id',
      'form_token',
      'form_id',
    ], $keep);
    $children = \Drupal\Core\Render\Element::children($form);
    foreach ($children as $name) {
      if (in_array($name, $keep)) {
        continue;
      }
      $form[$name]['#access'] = FALSE;
    }
  }

  protected function title($text, $replacements = []) {
    return [
      '#type' => 'html_tag',
      '#tag' => 'h1',
      '#value' => $this->t($text, $replacements),
      '#attributes' => ['class' => ['title']],
    ];
  }

  protected function h2($text, $replacements = []) {
    return [
      '#type' => 'html_tag',
      '#tag' => 'h2',
      '#value' => $this->t($text, $replacements),
    ];
  }
}
