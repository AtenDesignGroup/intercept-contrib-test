<?php

namespace Drupal\intercept_event;

use Drupal\Core\Form\FormStateInterface;

trait CustomerSearchFormTrait {

  /**
   * Convert form element keys if they differ from the search query.
   *
   * @return array
   */
  protected function mapValues(array $values) {
    $output = [];
    foreach ($this->map() as $key => $value) {
      if (empty($values[$key])) {
        continue;
      }
      $output[$value] = $values[$key];
    }
    return $output;
  }

  /**
   * Search client for first, last and email.
   *
   * @return array
   */
  protected function searchQuery(array $values = []) {
    $query = [];
    if (!empty($values['first_name'])) {
      $query['PATNF'] = $values['first_name'] . '*';
    }
    if (!empty($values['last_name'])) {
      $query['PATNL'] = $values['last_name'] . '*';
    }
    if (!empty($values['email'])) { 
      $query['EM'] = $values['email'];
    }
    $results = $this->client()->patron->searchAnd($query);
    return !empty($results->PatronSearchRows) ? $results->PatronSearchRows : [];
  }

  /**
   * Get ILS Client.
   *
   * @return \Drupal\polaris\Client
   */
  protected function client() {
    return \Drupal::service('polaris.client');
  }

  /**
   * Build form element "tableselect" and populate options.
   *
   * @param array $results
   * @return array
   */
  protected function buildTableElement($results = []) {
    $element = [
      '#type' => 'tableselect',
      '#multiple' => FALSE,
      '#header' => [
        'name' => $this->t('Name'),
        'barcode' => $this->t('Barcode'),
        'email' => $this->t('Email'),
      ],
      '#options' => [],
      '#empty' => $this->t('No results found'),
    ];
    foreach ($results as $result) {
      $patron = $this->client()->patron->get($result->Barcode);
      $element['#options'][$result->Barcode] = [
        'name' => $this->formatName($result->PatronFirstLastName),
        'barcode' => $this->obfuscateBarcode($result->Barcode),
        'email' => $this->obfuscateEmail($patron->data()->EmailAddress),
      ];
    }
    return $element;
  }

  /**
   * Use \Drupal\intercept_core\Utility\Obfuscate
   *
   * @deprecated
   */
  protected function obfuscateEmail($email) {
    if (empty($email)) {
      return '';
    }
    $pos = strpos($email, '@');
    return substr_replace($email, str_repeat('*', $pos - 1), 1, $pos - 1);
  }

  /**
   * Use \Drupal\intercept_core\Utility\Obfuscate
   *
   * @deprecated
   */
  protected function obfuscateBarcode($barcode) {
    if (empty($barcode)) {
      return '';
    }
    $replace = str_repeat('*', strlen($barcode) - 4);
    return substr_replace($barcode, $replace, 0, strlen($barcode) - 4);
  } 

  /**
   * Format Polaris returned name to readable.
   *
   * @deprecated
   */
  protected function formatName($name) {
    if (empty($name)) {
      return '';
    }
    $name = array_reverse(explode(',', $name));
    $name = array_map('trim', $name);
    return implode(' ', $name);
  }
}
