export interface MaskAmountGateway {
  mask(value?: null | string | number): { value: string; unmask: string };
}
