import { useParams } from 'react-router-dom';
import { WikiItem } from './templates/WikiItem';
import { WikiCharacter } from './templates/WikiCharacter';
import { WikiLocation } from './templates/WikiLocation';
import { WikiNotFound } from './templates/WikiNotFound';
import {
  getEntity,
  itemCategories,
  characterCategories,
  locationCategories,
  type AnyEntity,
  type WikiCategory,
} from '../../data/wiki';

export function WikiEntity() {
  const { category, id } = useParams();
  const lowerCategory = (category?.toLowerCase() || '') as WikiCategory;

  // Get entity from config
  const entity = id ? getEntity(id) : undefined;

  // If we have an entity, use its category; otherwise use URL category
  const effectiveCategory = entity?.category || lowerCategory;

  // Route to appropriate template based on category
  if (itemCategories.includes(effectiveCategory)) {
    return <WikiItem entity={entity} />;
  }

  if (characterCategories.includes(effectiveCategory)) {
    return <WikiCharacter entity={entity} />;
  }

  if (locationCategories.includes(effectiveCategory)) {
    return <WikiLocation entity={entity} />;
  }

  // Show not found for unknown categories/entities
  return <WikiNotFound slug={id} category={category} />;
}
