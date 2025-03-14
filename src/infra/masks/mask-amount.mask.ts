import { MaskAmountGateway } from '@/domain/Masks/MaskNumbers/gateway/mask-amount.gateway';
import { maskPackage } from '@/packages/masks';

export class MaskAmountMaskService implements MaskAmountGateway {
  mask(value?: null | string | number): { value: string; unmask: string } {
    value = value ? value : '';

    return maskPackage.maskNumber({
      value,
      decimalPlaces: 2,
      allowNegative: true,
    });
  }
}
