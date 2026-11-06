import { numberOrUndefined } from '@/shared/http/request-input';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { SortOrder, type PaginationParams } from '@/shared/query/page';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_RANGE = /^\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}$/;

function invalid(details: string): ValidationError {
  return new ValidationError(ErrorCode.VALIDATION_FAILED, { details });
}

export function readPaginationParams(
  query: Record<string, unknown>,
  accepted: {
    ordering: readonly string[];
    sort: readonly string[];
    searchByDate: readonly string[];
  },
): PaginationParams {
  const params: PaginationParams = {
    page: numberOrUndefined(query.page),
    size: numberOrUndefined(query.size),
  };

  const { ordering, direction_order, sort, sort_value } = query;
  const { search_by_date, search_by_date_value } = query;

  if (ordering && direction_order) {
    if (!accepted.ordering.includes(String(ordering))) {
      throw invalid(
        errorCatalog[ErrorCode.PARAMETER_DOES_NOT_ACCEPT_FIELD]({
          attribute: 'ordering',
          value: String(ordering),
        }),
      );
    }
    if (!Object.values<unknown>(SortOrder).includes(direction_order)) {
      throw invalid(
        errorCatalog[ErrorCode.PARAMETER_MUST_BE_ASC_OR_DESC]({
          attribute: 'direction_order',
        }),
      );
    }
    params.ordering = {
      [String(ordering)]: direction_order as SortOrder,
    };
  }

  if (sort && sort_value) {
    if (!accepted.sort.includes(String(sort))) {
      throw invalid(
        errorCatalog[ErrorCode.PARAMETER_DOES_NOT_ACCEPT_FIELD]({
          attribute: 'sort',
          value: String(sort),
        }),
      );
    }
    params.sort = { field: String(sort), value: String(sort_value) };
  }

  if (search_by_date && search_by_date_value) {
    if (!accepted.searchByDate.includes(String(search_by_date))) {
      throw invalid(
        errorCatalog[ErrorCode.PARAMETER_DOES_NOT_ACCEPT_FIELD]({
          attribute: 'search_by_date',
          value: String(search_by_date),
        }),
      );
    }
    const field = String(search_by_date);
    const value = String(search_by_date_value);
    if (DATE.test(value)) {
      params.searchByDate = { field, exactlyDate: value };
    } else if (DATE_RANGE.test(value)) {
      const initialDate = value.slice(0, 10);
      const finalDate = value.slice(11);
      if (initialDate > finalDate) {
        throw invalid(
          errorCatalog[ErrorCode.PARAMETER_START_DATE_AFTER_END_DATE]({
            attribute: 'search_by_date_value',
          }),
        );
      }
      params.searchByDate = { field, initialDate, finalDate };
    } else {
      throw invalid(
        errorCatalog[ErrorCode.PARAMETER_MUST_BE_DATE_OR_DATE_RANGE]({
          attribute: 'search_by_date_value',
        }),
      );
    }
  }

  return params;
}
