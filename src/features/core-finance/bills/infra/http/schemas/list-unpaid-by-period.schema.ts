import { IsOptional, IsString, Matches } from 'class-validator';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Borda mínima de UC-B11: só a janela de datas + paginação opcional. */
export class ListUnpaidByPeriodSchema {
  @Matches(DATE, {
    message: 'start_date deve estar no formato YYYY-MM-DD.',
  })
  start_date!: string;

  @Matches(DATE, {
    message: 'end_date deve estar no formato YYYY-MM-DD.',
  })
  end_date!: string;

  @IsOptional()
  @IsString({ message: 'page deve ser um texto numérico.' })
  page?: string;

  @IsOptional()
  @IsString({ message: 'size deve ser um texto numérico.' })
  size?: string;

  @IsOptional()
  @IsString({ message: 'ordering deve ser um texto.' })
  ordering?: string;

  @IsOptional()
  @IsString({ message: 'direction_order deve ser um texto.' })
  direction_order?: string;

  @IsOptional()
  @IsString({ message: 'sort deve ser um texto.' })
  sort?: string;

  @IsOptional()
  @IsString({ message: 'sort_value deve ser um texto.' })
  sort_value?: string;

  @IsOptional()
  @IsString({ message: 'search_by_date deve ser um texto.' })
  search_by_date?: string;

  @IsOptional()
  @IsString({ message: 'search_by_date_value deve ser um texto.' })
  search_by_date_value?: string;
}
