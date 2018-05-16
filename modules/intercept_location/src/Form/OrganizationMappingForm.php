<?php

namespace Drupal\intercept_location\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Entity\EntityTypeManager;
use Drupal\Core\Entity\EntityFormBuilder;
use Drupal\polaris\Client;

/**
 * Class OrganizationMappingForm.
 */
class OrganizationMappingForm extends FormBase {

  /**
   * Drupal\polaris\Client definition.
   *
   * @var \Drupal\polaris\Client
   */
  protected $client;

  /**
   * Drupal\Core\Entity\EntityTypeManager definition.
   *
   * @var \Drupal\Core\Entity\EntityTypeManager
   */
  protected $entityTypeManager;

  /**
   * Drupal\Core\Entity\EntityFormBuilder definition.
   *
   * @var \Drupal\Core\Entity\EntityFormBuilder
   */
  protected $entityFormBuilder;

  /**
   * Constructs a new OrganizationMappingForm object.
   */
  public function __construct(Client $client,EntityTypeManager $entity_type_manager, EntityFormBuilder $entity_form_builder) {
    $this->client = $client;
    $this->entityTypeManager = $entity_type_manager;
    $this->entityFormBuilder = $entity_form_builder;
  }

  /**
   * Create a new OrganizationMappingForm instance.
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('polaris.client'),
      $container->get('entity_type.manager'),
      $container->get('entity.form_builder')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'organization_mapping_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $node = $this->getNode();
    $form['name'] = [
      '#type' => 'item',
      '#title' => $this->t('Title'),
      '#markup' => $node->label(),
    ];

    $form['drupal_id'] = [
      '#type' => 'item',
      '#title' => $this->t('ID'),
      '#markup' => $node->id(),
    ];

    $form['ils_id'] = [
      '#type' => 'textfield',
      '#title' => $this->t('ILS ID'),
      '#maxlength' => 64,
      '#size' => 64,
    ];
    
    $form['ils_id'] = [
      '#type' => 'select',
      '#empty_option' => $this->t(' - No mapping - '),
      '#title' => $this->t('Organizations'),
      '#options' => $this->getOptions(),
      '#default_value' => $node->get('field_polaris_id')->getString(),
    ];

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Submit'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $node = $this->getNode();
    $node->field_polaris_id->setValue($form_state->getValue('ils_id'));
    $node->save();
  }

  private function getOptions() {
    $organizations = $this->client->organization->getAll();
    $options = [];
    array_walk($organizations, function($item, $key) use (&$options) {
      $options[$item->OrganizationID] = $item->Name;
    });
    return $options; 
  }

  private function getNode() {
    $id = \Drupal::service('current_route_match')->getParameter('node');
    return $id ? \Drupal\node\Entity\Node::load($id) : FALSE; 
  }

}
