import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { WalletMovement } from '@/features/wallet/domain/wallet-movement.entity';
import { WalletMovementDirectionEnum } from '@/features/wallet/domain/enums/wallet-movement.enums';
import {
  accruedInterestFromOutstanding,
  addDays,
  listDays,
} from '@/features/wallet/domain/overdraft.service';

function signedDelta(movement: WalletMovement): number {
  const sign =
    movement.direction === WalletMovementDirectionEnum.CREDIT ? 1 : -1;
  return sign * movement.amount.value;
}

/**
 * Juros do cheque acumulados em read-time (W14): reconstrói a série diária do
 * saldo devedor desde `overdraftSince` pelo replay dos movimentos e aplica o
 * fator composto. O IOF diário vem do indicador ativo (injetado). Sem episódio
 * aberto ⇒ 0.
 */
export function computeAccruedInterest(input: {
  wallet: Wallet;
  movements: WalletMovement[];
  today: string;
  iofDailyRate: number;
}): number {
  const { wallet, movements, today, iofDailyRate } = input;
  const since = wallet.overdraftSince;
  const config = wallet.overdraftConfig;
  if (since === null || config === null) return 0;

  const { monthlyRate, graceDays } = config;
  const firstInterestDay = addDays(since, graceDays + 1);
  if (today < firstInterestDay) return 0;

  const episodeMovements = movements.filter((m) => m.occurredAt >= since);
  const totalEpisodeDelta = episodeMovements.reduce(
    (sum, m) => sum + signedDelta(m),
    0,
  );
  const balanceBeforeEpisode = Number(
    (wallet.balance.value - totalEpisodeDelta).toFixed(2),
  );

  const outstandingByInterestDay = listDays(firstInterestDay, today).map(
    (day) => {
      const cumulative = episodeMovements
        .filter((m) => m.occurredAt <= day)
        .reduce((sum, m) => sum + signedDelta(m), 0);
      const endOfDayBalance = balanceBeforeEpisode + cumulative;
      return Math.max(0, -endOfDayBalance);
    },
  );

  return accruedInterestFromOutstanding(
    outstandingByInterestDay,
    monthlyRate,
    iofDailyRate,
  );
}
