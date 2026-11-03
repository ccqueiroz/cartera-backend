import { numberOrUndefined } from '@/shared/http/request-input';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
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
      throw invalid(`O parâmetro ordering não aceita o campo ${ordering}.`);
    }
    if (!Object.values<unknown>(SortOrder).includes(direction_order)) {
      throw invalid('O parâmetro direction_order deve ser asc ou desc.');
    }
    params.ordering = {
      [String(ordering)]: direction_order as SortOrder,
    };
  }

  if (sort && sort_value) {
    if (!accepted.sort.includes(String(sort))) {
      throw invalid(`O parâmetro sort não aceita o campo ${sort}.`);
    }
    params.sort = { field: String(sort), value: String(sort_value) };
  }

  if (search_by_date && search_by_date_value) {
    if (!accepted.searchByDate.includes(String(search_by_date))) {
      throw invalid(
        `O parâmetro search_by_date não aceita o campo ${search_by_date}.`,
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
          'O parâmetro search_by_date_value tem a data inicial depois da final.',
        );
      }
      params.searchByDate = { field, initialDate, finalDate };
    } else {
      throw invalid(
        'O parâmetro search_by_date_value deve ser YYYY-MM-DD ou YYYY-MM-DD-YYYY-MM-DD.',
      );
    }
  }

  return params;
}
