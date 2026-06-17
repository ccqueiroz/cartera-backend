import {
  Transfer,
  TransferOutput,
} from '@/features/transfer/domain/transfer.entity';
import { TransferMovement } from '@/features/transfer/domain/transfer-movement';
import { TransferRepository } from '@/features/transfer/domain/ports/transfer.repository.port';
import { WalletGateway } from '@/features/transfer/domain/ports/wallet.gateway.port';
import { PaymentMethodGateway } from '@/features/transfer/domain/ports/payment-method.gateway.port';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import {
  BalanceWarning,
  collectBalanceWarnings,
} from '@/shared/kernel/value-objects/balance-warnings';
import {
  BusinessRuleViolationError,
  EntityNotFoundError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

interface CreateTransferInput {
  userId: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  paymentMethodDescriptionEnum: string;
  transferDate?: string;
}

export interface TransferWalletView {
  id: string;
  balance: number;
}

export interface CreateTransferResult {
  transfer: TransferOutput;
  fromWallet: TransferWalletView;
  toWallet: TransferWalletView;
  warnings: BalanceWarning[];
}

export class CreateTransferUseCase {
  private constructor(
    private readonly repository: TransferRepository,
    private readonly walletGateway: WalletGateway,
    private readonly paymentMethodGateway: PaymentMethodGateway,
    private readonly generateId: () => string,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: TransferRepository,
    walletGateway: WalletGateway,
    paymentMethodGateway: PaymentMethodGateway,
    generateId: () => string,
    now: () => string,
  ): CreateTransferUseCase {
    return new CreateTransferUseCase(
      repository,
      walletGateway,
      paymentMethodGateway,
      generateId,
      now,
    );
  }

  public async execute(
    input: CreateTransferInput,
  ): Promise<CreateTransferResult> {
    const createdAt = this.now();
    const today = createdAt.slice(0, 10);
    const transferDate = input.transferDate ?? today;

    this.assertEdges(input, transferDate, today);

    const fromWallet = await this.walletGateway.findActiveById(
      input.fromWalletId,
      input.userId,
    );
    const toWallet = await this.walletGateway.findActiveById(
      input.toWalletId,
      input.userId,
    );
    if (!fromWallet || !toWallet)
      throw new EntityNotFoundError(ErrorCode.WALLET_NOT_FOUND);

    const method = await this.paymentMethodGateway.findActiveByEnum(
      input.paymentMethodDescriptionEnum,
    );
    if (!method || !method.isActive)
      throw new BusinessRuleViolationError(
        ErrorCode.TRANSFER_PAYMENT_METHOD_INACTIVE,
      );

    const amount = Money.create(input.amount);
    const transfer = Transfer.create({
      id: this.generateId(),
      userId: input.userId,
      fromWalletId: input.fromWalletId,
      toWalletId: input.toWalletId,
      amount,
      paymentMethodDescriptionEnum: input.paymentMethodDescriptionEnum,
      transferDate,
      createdAt,
    });

    fromWallet.debit(amount, transferDate);
    toWallet.credit(amount);

    const movements: TransferMovement[] = [
      {
        id: this.generateId(),
        userId: input.userId,
        walletId: input.fromWalletId,
        direction: 'DEBIT',
        amount: amount.value,
        refType: 'TRANSFER',
        refId: transfer.id,
        occurredAt: transferDate,
        createdAt,
      },
      {
        id: this.generateId(),
        userId: input.userId,
        walletId: input.toWalletId,
        direction: 'CREDIT',
        amount: amount.value,
        refType: 'TRANSFER',
        refId: transfer.id,
        occurredAt: transferDate,
        createdAt,
      },
    ];

    await this.repository.saveTransfer(
      fromWallet,
      toWallet,
      movements,
      transfer,
    );

    return {
      transfer: transfer.toOutput(),
      fromWallet: {
        id: input.fromWalletId,
        balance: fromWallet.balance.value,
      },
      toWallet: { id: input.toWalletId, balance: toWallet.balance.value },
      warnings: collectBalanceWarnings({
        isNegative: fromWallet.balance.isNegative(),
        exceedsLimit: fromWallet.exceedsOverdraftLimit(),
      }),
    };
  }

  private assertEdges(
    input: CreateTransferInput,
    transferDate: string,
    today: string,
  ): void {
    if (input.fromWalletId === input.toWalletId)
      throw new ValidationError(ErrorCode.TRANSFER_SAME_WALLET);
    if (input.amount <= 0)
      throw new ValidationError(ErrorCode.TRANSFER_AMOUNT_NOT_POSITIVE);
    if (transferDate > today)
      throw new ValidationError(ErrorCode.TRANSFER_DATE_IN_FUTURE);
  }
}
