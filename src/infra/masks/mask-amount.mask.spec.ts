import { MaskAmountMaskService } from './mask-amount.mask';

describe('Mask Amount Mask', () => {
  let maskAmountMaskService: MaskAmountMaskService;

  beforeEach(() => {
    maskAmountMaskService = new MaskAmountMaskService();
  });

  it('should be create a instance of the MaskAmountMaskService class when it is instantiated.', () => {
    expect(maskAmountMaskService).toBeInstanceOf(MaskAmountMaskService);
  });

  it('should return value and unmask to empty when call mask method when it provide value to be undefined.', async () => {
    const result = maskAmountMaskService.mask(undefined);

    expect(result).toEqual({ value: '', unmask: '' });
  });

  it('should return value and unmask to empty when call mask method when it provide value to be null.', async () => {
    const result = maskAmountMaskService.mask(null);

    expect(result).toEqual({ value: '', unmask: '' });
  });

  it('should return value and unmask to empty when call mask method when it provide value to be empty string.', async () => {
    const result = maskAmountMaskService.mask('');

    expect(result).toEqual({ value: '', unmask: '' });
  });

  it('should return value and unmask to empty when call mask method when providing value to be string that is not related to string that represents monetary value of two decimal places.', async () => {
    const result = maskAmountMaskService.mask('abhs h');

    expect(result).toEqual({ value: '', unmask: '' });
  });

  it('should return value and unmask to be valid when call mask method when providing value to be string that is related to string that represents monetary value of two decimal places.', async () => {
    const resultWithComma = maskAmountMaskService.mask('R$ 1250,90');

    expect(resultWithComma).toEqual({ value: '1.250,90', unmask: '1250.90' });

    const resultWithDot = maskAmountMaskService.mask('R$ 1250.90');

    expect(resultWithDot).toEqual({ value: '1.250,90', unmask: '1250.90' });
  });

  it('should return value and unmask to be valid when call mask method when providing value to be number.', async () => {
    const result = maskAmountMaskService.mask(1456.87);

    expect(result).toEqual({ value: '1.456,87', unmask: '1456.87' });

    const result2 = maskAmountMaskService.mask(8654790.12);

    expect(result2).toEqual({ value: '8.654.790,12', unmask: '8654790.12' });
  });
});
