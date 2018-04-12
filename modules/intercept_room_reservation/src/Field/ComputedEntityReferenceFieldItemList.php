<?php

namespace Drupal\intercept_room_reservation\Field;

use Drupal\Core\Field\EntityReferenceFieldItemList;
use Drupal\Core\TypedData\ComputedItemListTrait;

class ComputedEntityReferenceFieldItemList extends EntityReferenceFieldItemList {

  use ComputedItemListTrait;
  use ComputedItemTraverseTrait;

}
