<?php

namespace Drupal\intercept_core\Utility;

use Drupal\Component\Datetime\DateTimePlus;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;

class Dates {

  /**
   * @var ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * Constructs a new ReservationManager object.
   */
  public function __construct(ConfigFactoryInterface $config_factory) {
    $this->configFactory = $config_factory;
  }

  /**
   * Calculate the duration in minutes between two dates.
   *
   * @return int
   */
  public static function duration(DateTimePlus $date1, DateTimePlus $date2) {
    if ($date1 > $date2) {
      return FALSE;
    }
    $int = $date1->diff($date2);
    $total = $int->h * 60 + $int->i;
    return $total;
  }

  /**
   * Get a timezone object.
   *
   * @param string $name
   *   PHP Timezone name.
   *
   * @return \DateTimeZone
   */
  protected function getTimezone($name = 'UTC') {
    if ($name == 'default') {
      $config = $this->configFactory->get('system.date');
      $name = $config->get('timezone.default');
    }
    if ($name == 'storage') {
      $name = DateTimeItemInterface::STORAGE_TIMEZONE;
    }
    return new \DateTimeZone($name);
  }

  /**
   * @return \DateTimeZone
   */
  public function getUtcTimezone() {
    return $this->getTimezone();
  }

  /**
   * Date field storage timezone.
   *
   * @return \DateTimeZone
   */
  public function getStorageTimezone() {
    return $this->getTimezone('storage');
  }

  /**
   * Default site timezone.
   *
   * @return \DateTimeZone
   */
  public function getDefaultTimezone() {
    return $this->getTimezone('default');
  }

  /**
   * @param $string
   * @param string $timezone
   * @return \DateTime
   */
  public function getDate($string, $timezone = 'storage') {
    return new \DateTime($string, $this->getTimezone($timezone));
  }

  /**
   * @param $string
   * @param string $timezone
   * @return DrupalDateTime
   */
  public function getDrupalDate($string, $timezone = 'storage') {
    return DrupalDateTime::createFromDateTime($this->getDate($string, $timezone));
  }

  public function convertTimezone($date, $new_timezone = 'UTC') {
    $new_date = clone $date;
    $new_date->setTimezone($this->getTimezone($new_timezone));
    return $new_date;
  }

  /**
   * $from_default
   *   TRUE if converting from default to UTC, FALSE if opposite.
   */
  public function convertDate($string, $from_default = TRUE) {
    $from = $from_default ? $this->getDefaultTimezone() : $this->getUtcTimezone();
    $to = $from_default ? $this->getUtcTimezone() : $this->getDefaultTimezone();
    $date = new DrupalDateTime($string, $from);
    $date->setTimezone($to);
    return $date;
  }

}
