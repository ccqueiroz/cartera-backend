import { MergeSortGateway } from '@/domain/Auth/helpers/merge-sort.gateway';

export class MargeSortHelper implements MergeSortGateway {
  private merge<T>(left: Array<T>, right: Array<T>, key: keyof T) {
    return function (ascending: boolean) {
      const result: Array<T> = [];

      let leftIndex = 0,
        rightIndex = 0;

      while (leftIndex < left.length && rightIndex < right.length) {
        if (
          ascending
            ? left[leftIndex][key] < right[rightIndex][key]
            : left[leftIndex][key] > right[rightIndex][key]
        ) {
          result.push(left[leftIndex]);
          leftIndex++;
        } else {
          result.push(right[rightIndex]);
          rightIndex++;
        }
      }

      return result
        .concat(left.slice(leftIndex))
        .concat(right.slice(rightIndex));
    };
  }

  execute<T>(arr: Array<T>, key: keyof T, ascending = true): Array<T> {
    if (arr.length <= 1) return arr;

    const middle = Math.floor(arr.length / 2);
    const left = this.execute(arr.slice(0, middle), key, ascending);
    const right = this.execute(arr.slice(middle), key, ascending);

    return this.merge(left, right, key)(ascending);
  }
}
