import { MargeSortHelper } from './merge-sort.helpers';

const mockData = [
  {
    id: 'e8305798-ccc3-4cb1-8de0-5df4c987a71b',
    amount: 1200.76,
    receivableDate: 1739145600000, // Feb 10, 2024
    descriptionReceivable: 'Salário 2',
    createdAt: 1739751148154, // Mar 17, 2024
  },
  {
    id: 'a90b1b78-aefe-4d20-bec2-d7cef0dbdf9f',
    amount: 1647.76,
    receivableDate: 1741132800000, // Mar 3, 2024
    descriptionReceivable: 'Salário 3',
    createdAt: 1739751148154, // Mar 17, 2024
  },
  {
    id: '061883d6-4115-40e0-a361-4eb7a56f091d',
    amount: 8647.76,
    receivableDate: 1738713600000, // Feb 6, 2024
    descriptionReceivable: 'Salário',
    createdAt: 1739415600000, // Mar 14, 2024
  },
  {
    id: 'fcb143f1-f890-46f3-baeb-0db84bd90b52',
    amount: 18647.76,
    receivableDate: 1739577600000, // Feb 16, 2024
    descriptionReceivable: 'Salário 4',
    createdAt: 1738640130914, // Mar 6, 2024
  },
];

describe('Marge Sort Helper', () => {
  let sorter: MargeSortHelper;

  beforeEach(() => {
    sorter = new MargeSortHelper();
  });

  it('should be an instance of MargeSortHelper', () => {
    expect(sorter).toBeInstanceOf(MargeSortHelper);
  });

  it('should return empty array for empty input', () => {
    expect(sorter.execute([], 'any' as keyof (typeof mockData)[0])).toEqual([]);
  });

  it('should return single-element array unchanged', () => {
    const input = [{ id: 'test', value: 10 }];
    expect(sorter.execute(input, 'value' as keyof (typeof input)[0])).toEqual(
      input,
    );
  });

  it('should sort by numeric key with amount param in ascending order', () => {
    const result = sorter.execute([...mockData], 'amount', true);
    const sortedIds = result.map((item) => item.id);
    expect(sortedIds).toEqual([
      'e8305798-ccc3-4cb1-8de0-5df4c987a71b',
      'a90b1b78-aefe-4d20-bec2-d7cef0dbdf9f',
      '061883d6-4115-40e0-a361-4eb7a56f091d',
      'fcb143f1-f890-46f3-baeb-0db84bd90b52',
    ]);
  });

  it('should sort by numeric key with amount param in descending order', () => {
    const result = sorter.execute([...mockData], 'amount', false);
    const sortedIds = result.map((item) => item.id);
    expect(sortedIds).toEqual([
      'fcb143f1-f890-46f3-baeb-0db84bd90b52',
      '061883d6-4115-40e0-a361-4eb7a56f091d',
      'a90b1b78-aefe-4d20-bec2-d7cef0dbdf9f',
      'e8305798-ccc3-4cb1-8de0-5df4c987a71b',
    ]);
  });

  it('should sort by date key with receivableDate param in ascending order', () => {
    const result = sorter.execute([...mockData], 'receivableDate', true);
    const sortedIds = result.map((item) => item.id);
    expect(sortedIds).toEqual([
      '061883d6-4115-40e0-a361-4eb7a56f091d',
      'e8305798-ccc3-4cb1-8de0-5df4c987a71b',
      'fcb143f1-f890-46f3-baeb-0db84bd90b52',
      'a90b1b78-aefe-4d20-bec2-d7cef0dbdf9f',
    ]);
  });

  it('should sort by date key with receivableDate param in descending order', () => {
    const result = sorter.execute([...mockData], 'receivableDate', false);
    const sortedIds = result.map((item) => item.id);
    expect(sortedIds).toEqual([
      'a90b1b78-aefe-4d20-bec2-d7cef0dbdf9f',
      'fcb143f1-f890-46f3-baeb-0db84bd90b52',
      'e8305798-ccc3-4cb1-8de0-5df4c987a71b',
      '061883d6-4115-40e0-a361-4eb7a56f091d',
    ]);
  });

  it('should sort by string key with descriptionReceivable param in ascending order', () => {
    const result = sorter.execute([...mockData], 'descriptionReceivable', true);
    const sortedDescriptions = result.map((item) => item.descriptionReceivable);
    expect(sortedDescriptions).toEqual([
      'Salário',
      'Salário 2',
      'Salário 3',
      'Salário 4',
    ]);
  });

  it('should sort by string key with descriptionReceivable param in descending order', () => {
    const result = sorter.execute(
      [...mockData],
      'descriptionReceivable',
      false,
    );
    const sortedDescriptions = result.map((item) => item.descriptionReceivable);
    expect(sortedDescriptions).toEqual([
      'Salário 4',
      'Salário 3',
      'Salário 2',
      'Salário',
    ]);
  });

  it('should handle objects with equal keys (non-stable)', () => {
    const input = [
      { id: 'A', value: 5 },
      { id: 'B', value: 5 },
    ];
    const result = sorter.execute(input, 'value', true);

    expect(result[0].id).toBe('B');
    expect(result[1].id).toBe('A');
  });
});
