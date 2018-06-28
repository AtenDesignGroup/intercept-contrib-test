<?php

namespace Drupal\intercept_equipment\Field\Computed;

use Drupal\Core\Field\EntityReferenceFieldItemList as CoreEntityReferenceFieldItemList;
use Drupal\Core\TypedData\ComputedItemListTrait;

class EntityReferenceFieldItemList extends CoreEntityReferenceFieldItemList {

  use ComputedItemListTrait;
  use ItemTraverseTrait;

}
