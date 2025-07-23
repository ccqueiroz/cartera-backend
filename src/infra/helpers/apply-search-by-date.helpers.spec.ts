import { BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { ApplySearchByDateHelper } from './apply-search-by-date.helpers';
import { ReceivableDTO } from '@/domain/Receivable/dtos/receivable.dto';

describe('ApplySearchByDateHelper', () => {
  let helper: ApplySearchByDateHelper;
  let listToIncludeSearchItems: Array<(item: any) => boolean>;

  beforeEach(() => {
    helper = new ApplySearchByDateHelper();
    listToIncludeSearchItems = [];
  });

  const normalizeDate = (dateString: string) =>
    new Date(dateString).setHours(0, 0, 0, 0);

  const createBill = (key: keyof BillDTO, timestamp: number): BillDTO =>
    ({
      id: '1',
      [key]: timestamp,
    } as unknown as BillDTO);

  const createReceivable = (
    key: keyof ReceivableDTO,
    timestamp: number,
  ): ReceivableDTO =>
    ({
      id: '1',
      [key]: timestamp,
    } as unknown as ReceivableDTO);

  it('does nothing if searchByDate is empty', () => {
    helper.execute({
      listToIncludeSearchItems,
      searchByDate: { typeDTO: {}, invoiceType: 'bill' },
    });
    expect(listToIncludeSearchItems).toHaveLength(0);
  });

  it('filters bill with exactlyDate', () => {
    const targetDate = normalizeDate('2024-02-29');

    helper.execute({
      listToIncludeSearchItems,
      searchByDate: {
        typeDTO: { billDate: { exactlyDate: targetDate } },
        invoiceType: 'bill',
      },
    });

    expect(listToIncludeSearchItems).toHaveLength(1);

    const matching = createBill('billDate', targetDate);
    const notMatching = createBill('billDate', normalizeDate('2024-03-01'));

    expect(listToIncludeSearchItems[0](matching)).toBe(true);
    expect(listToIncludeSearchItems[0](notMatching)).toBe(false);
  });

  it('filters receivable with exactlyDate', () => {
    const targetDate = normalizeDate('2023-12-31');

    helper.execute({
      listToIncludeSearchItems,
      searchByDate: {
        typeDTO: { receivableDate: { exactlyDate: targetDate } },
        invoiceType: 'receivable',
      },
    });

    expect(listToIncludeSearchItems).toHaveLength(1);

    const matching = createReceivable('receivableDate', targetDate);
    const notMatching = createReceivable(
      'receivableDate',
      normalizeDate('2024-01-01'),
    );

    expect(listToIncludeSearchItems[0](matching)).toBe(true);
    expect(listToIncludeSearchItems[0](notMatching)).toBe(false);
  });

  it('filters bill with interval initialDate and finalDate', () => {
    const initial = normalizeDate('2023-12-30');
    const final = normalizeDate('2024-01-02');

    helper.execute({
      listToIncludeSearchItems,
      searchByDate: {
        typeDTO: { payDate: { initialDate: initial, finalDate: final } },
        invoiceType: 'bill',
      },
    });

    expect(listToIncludeSearchItems).toHaveLength(1);

    const inside = createBill('payDate', normalizeDate('2024-01-01'));
    const before = createBill('payDate', normalizeDate('2023-12-29'));
    const after = createBill('payDate', normalizeDate('2024-01-03'));

    expect(listToIncludeSearchItems[0](inside)).toBe(true);
    expect(listToIncludeSearchItems[0](before)).toBe(false);
    expect(listToIncludeSearchItems[0](after)).toBe(false);
  });

  it('filters receivable with only initialDate', () => {
    const initial = normalizeDate('2024-01-01');

    helper.execute({
      listToIncludeSearchItems,
      searchByDate: {
        typeDTO: { receivalDate: { initialDate: initial } },
        invoiceType: 'receivable',
      },
    });

    expect(listToIncludeSearchItems).toHaveLength(1);

    const after = createReceivable('receivalDate', normalizeDate('2024-02-01'));
    const before = createReceivable(
      'receivalDate',
      normalizeDate('2023-12-31'),
    );

    expect(listToIncludeSearchItems[0](after)).toBe(true);
    expect(listToIncludeSearchItems[0](before)).toBe(false);
  });

  it('filters receivable with only finalDate', () => {
    const final = normalizeDate('2024-01-31');

    helper.execute({
      listToIncludeSearchItems,
      searchByDate: {
        typeDTO: { receivableDate: { finalDate: final } },
        invoiceType: 'receivable',
      },
    });

    expect(listToIncludeSearchItems).toHaveLength(1);

    const before = createReceivable(
      'receivableDate',
      normalizeDate('2024-01-15'),
    );
    const after = createReceivable(
      'receivableDate',
      normalizeDate('2024-02-01'),
    );

    expect(listToIncludeSearchItems[0](before)).toBe(true);
    expect(listToIncludeSearchItems[0](after)).toBe(false);
  });

  it('handles leap year date correctly', () => {
    const leapDate = normalizeDate('2020-02-29');

    helper.execute({
      listToIncludeSearchItems,
      searchByDate: {
        typeDTO: { billDate: { exactlyDate: leapDate } },
        invoiceType: 'bill',
      },
    });

    expect(listToIncludeSearchItems).toHaveLength(1);

    const matching = createBill('billDate', leapDate);
    const notMatching = createBill('billDate', normalizeDate('2019-02-28'));

    expect(listToIncludeSearchItems[0](matching)).toBe(true);
    expect(listToIncludeSearchItems[0](notMatching)).toBe(false);
  });

  it('handles year change interval correctly', () => {
    const start = normalizeDate('2023-12-31');
    const end = normalizeDate('2024-01-01');

    helper.execute({
      listToIncludeSearchItems,
      searchByDate: {
        typeDTO: { billDate: { initialDate: start, finalDate: end } },
        invoiceType: 'bill',
      },
    });

    expect(listToIncludeSearchItems).toHaveLength(1);

    const inside1 = createBill('billDate', start);
    const inside2 = createBill('billDate', end);
    const outside = createBill('billDate', normalizeDate('2022-12-31'));

    expect(listToIncludeSearchItems[0](inside1)).toBe(true);
    expect(listToIncludeSearchItems[0](inside2)).toBe(true);
    expect(listToIncludeSearchItems[0](outside)).toBe(false);
  });
});
