import { MaskAmountGateway } from '@/domain/Masks/MaskNumbers/gateway/mask-amount.gateway';
import { maskPackage } from '@/packages/masks';

export class MaskAmountMaskService implements MaskAmountGateway {
  mask(value?: null | string | number): { value: string; unmask: string } {
    value = value || value === 0 || value === '0' ? value : '';
    let formatValue: string | number;

    const matchWithNumbersOutsideCurrency = /^(-?\d+)([.,](\d{0,1}))?$/;
    const matchWithRegex = value
      ?.toString()
      .match(matchWithNumbersOutsideCurrency);

    if (!matchWithRegex) {
      formatValue = value;
    } else {
      const integerPart = matchWithRegex[1];
      const decimalSeparator = matchWithRegex[2]?.charAt(0) || '.';
      let decimalPart = matchWithRegex[3] || '';

      while (decimalPart.length < 2) {
        decimalPart += '0';
      }

      formatValue = `${integerPart}${decimalSeparator}${decimalPart}`;
    }

    const mask = maskPackage.maskNumber({
      value: formatValue,
      decimalPlaces: 2,
      allowNegative: true,
      locale: 'pt-BR',
    });

    return {
      value: mask.value,
      unmask: `${
        !mask.unmask && mask.unmask !== '0' ? '' : Number(mask.unmask)
      }`,
    };
  }
}
