import { CategoryEntitie } from './category.entitie';

describe('Category Entitie', () => {
  it('should be return Category instance with mandatory attributes when call static method with of the CategoryEntitie class', () => {
    const categoryObject = {
      id: 'Ak982jkk118279',
      description: 'Restaurante',
    };

    const category = CategoryEntitie.with(categoryObject);

    expect(category.id).toBe(categoryObject.id);
    expect(category.description).toBe(categoryObject.description);
  });

  it('should be return Category instance with all attributes when call static method with of the CategoryEntitie class', () => {
    const categoryObject = {
      id: 'Ak982jkk118279',
      description: 'Restaurante',
      createdAt: '1724708206117',
      updatedAt: '1724708206118',
    };

    const category = CategoryEntitie.with(categoryObject);

    expect(category.id).toBe(categoryObject.id);
    expect(category.description).toBe(categoryObject.description);
    expect(category.createdAt).toBe(categoryObject.createdAt);
    expect(category.updatedAt).toBe(categoryObject.updatedAt);
  });
});
