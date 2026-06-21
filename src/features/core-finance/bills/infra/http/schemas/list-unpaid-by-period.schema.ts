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
}
