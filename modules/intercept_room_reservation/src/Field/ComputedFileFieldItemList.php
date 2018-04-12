<?php

namespace Drupal\intercept_room_reservation\Field;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\TypedData\ComputedItemListTrait;
use Drupal\file\Plugin\Field\FieldType\FileFieldItemList;

class ComputedFileFieldItemList extends FileFieldItemList {

  use ComputedItemListTrait;
  use ComputedItemTraverseTrait;

}
