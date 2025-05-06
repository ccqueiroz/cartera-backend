import * as admin from 'firebase-admin';
import { ReceivableRepositoryGateway } from '@/domain/Receivable/gateway/receivable.repository.gateway';
import {
  CreateReceivableInputDTO,
  CreateReceivableOutputDTO,
  DeleteReceivableInputDTO,
  EditReceivableInputDTO,
  GetReceivableByIdInputDTO,
  GetReceivablesInputDTO,
  OrderByGetReceivablesInputDTO,
  ReceivableDTO,
  SearchByDateGetReceivablesInputDTO,
  SortByStatusReceivablesInputDTO,
} from '@/domain/Receivable/dtos/receivable.dto';
import { ReceivableEntitie } from '@/domain/Receivable/entitie/receivable.entitie';
import { ErrorsFirebase } from '../../database/firebase/errorHandling';
import { SortOrder } from '@/domain/dtos/listParamsDto.dto';
import { MergeSortGateway } from '@/domain/Helpers/gateway/merge-sort.gateway';
import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { MaskAmountMaskService } from '../../masks/mask-amount.mask';
import { ApplyPaginationGateway } from '@/domain/Helpers/gateway/apply-pagination.gateway';
import { HandleCanProgressToWriteOperationGateway } from '../../database/firebase/core/gateway/handleCanProgressToWriteOperation.gateway';

export class ReceivablesRepositoryFirebase
  implements ReceivableRepositoryGateway
{
  private static instance: ReceivablesRepositoryFirebase;
  private dbCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
  private collection = 'Receivable';

  private constructor(
    private readonly db: admin.firestore.Firestore,
    private mergeSortHelper: MergeSortGateway,
    private applayPaginationHelpers: ApplyPaginationGateway,
    private handleCanProgressToWritteOperation: HandleCanProgressToWriteOperationGateway,
  ) {
    this.dbCollection = this.db.collection(this.collection);
    ReceivableEntitie.setMaskAmountGateway(new MaskAmountMaskService());
  }

  public static create(
    db: admin.firestore.Firestore,
    mergeSortHelper: MergeSortGateway,
    applayPaginationHelpers: ApplyPaginationGateway,
    handleCanProgressToWritteOperation: HandleCanProgressToWriteOperationGateway,
  ) {
    if (!ReceivablesRepositoryFirebase.instance) {
      ReceivablesRepositoryFirebase.instance =
        new ReceivablesRepositoryFirebase(
          db,
          mergeSortHelper,
          applayPaginationHelpers,
          handleCanProgressToWritteOperation,
        );
    }
    return ReceivablesRepositoryFirebase.instance;
  }

  private applyFilterReceivables(
    input: GetReceivablesInputDTO,
    data: Array<ReceivableDTO>,
  ) {
    const { sort: sortByStatus, sortByReceivables, searchByDate } = input;

    if (!sortByStatus && !sortByReceivables && !searchByDate) return data;

    const applyFiltersInData: Array<(item: ReceivableDTO) => boolean> = [];

    if (sortByStatus) {
      const key = Object.keys(sortByStatus).find(
        (k) =>
          sortByStatus[k as keyof SortByStatusReceivablesInputDTO] !==
          undefined,
      ) as keyof SortByStatusReceivablesInputDTO;

      const statusId = sortByStatus[key];
      applyFiltersInData.push((item) => item[key] === statusId);
    }

    if (sortByReceivables) {
      if (sortByReceivables.fixedReceivable !== undefined) {
        const value = sortByReceivables.fixedReceivable;
        applyFiltersInData.push((item) => item.fixedReceivable === value);
      }
      if (sortByReceivables.receival !== undefined) {
        const value = sortByReceivables.receival;
        applyFiltersInData.push((item) => item.receival === value);
      }
      if (sortByReceivables.amount !== undefined) {
        const value = sortByReceivables.amount;
        applyFiltersInData.push((item) => item.amount >= value);
      }
    }

    if (searchByDate?.receivableDate) {
      const key = Object.keys(searchByDate).find(
        (k) =>
          searchByDate[k as keyof SearchByDateGetReceivablesInputDTO] !==
          undefined,
      ) as keyof SearchByDateGetReceivablesInputDTO;
      const dateFilter = searchByDate[key];

      if (dateFilter) {
        if ('exactlyDate' in dateFilter) {
          const exactDate = Number(dateFilter.exactlyDate);
          applyFiltersInData.push((item) => Number(item[key]) === exactDate);
        } else {
          const initial = dateFilter.initialDate
            ? Number(dateFilter.initialDate)
            : -Infinity;
          const final = dateFilter.finalDate
            ? Number(dateFilter.finalDate)
            : Infinity;
          applyFiltersInData.push((item) => {
            const date = Number(item[key]);
            return date >= initial && date <= final;
          });
        }
      }
    }

    return applyFiltersInData.length === 0
      ? data
      : data.filter((item) =>
          applyFiltersInData.every((predicate) => predicate(item)),
        );
  }

  private applyOrderingReceivables(
    input: GetReceivablesInputDTO,
    data: Array<ReceivableDTO>,
  ) {
    const { ordering } = input;

    const orderingKey = ordering
      ? (Object.keys(ordering)[0] as keyof OrderByGetReceivablesInputDTO)
      : undefined;

    if (!ordering || !orderingKey || orderingKey === 'createdAt') return data;

    const orderingDirection =
      orderingKey !== undefined
        ? ordering[orderingKey] === SortOrder.ASC
        : true;

    const dataOrdering = this.mergeSortHelper.execute<ReceivableDTO>(
      data,
      orderingKey,
      orderingDirection,
    );

    return dataOrdering;
  }

  private async handleSearchReceivables(
    input: GetReceivablesInputDTO,
  ): Promise<ResponseListDTO<ReceivableDTO>> {
    const { ordering, userId } = input;

    const query: admin.firestore.Query<admin.firestore.DocumentData> =
      this.dbCollection;

    const direction =
      ordering && Object.prototype.hasOwnProperty.call(ordering, 'createdAt')
        ? ordering['createdAt']
        : SortOrder.ASC;

    let data = await query
      .where('userId', '==', userId)
      .orderBy('createdAt', direction)
      .get()
      .then((response) =>
        response.docs?.map(
          (item) => ({ id: item.id, ...item.data() } as ReceivableDTO),
        ),
      )
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    data = this.applyFilterReceivables(input, data as Array<ReceivableDTO>);

    data = this.applyOrderingReceivables(input, data as Array<ReceivableDTO>);

    return this.applayPaginationHelpers.execute<
      GetReceivablesInputDTO,
      OrderByGetReceivablesInputDTO,
      ReceivableDTO
    >(input, data as Array<ReceivableDTO>);
  }

  public async getReceivables(
    input: GetReceivablesInputDTO,
  ): Promise<ResponseListDTO<ReceivableDTO>> {
    const data = await this.handleSearchReceivables(input);

    return data;
  }

  public async getReceivableById({
    id,
    userId,
  }: GetReceivableByIdInputDTO): Promise<ReceivableDTO | null> {
    const receivable = await this.dbCollection
      .doc(id)
      .get()
      .then((response) => {
        if (response.exists) {
          if (response.data()?.userId !== userId) {
            throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
          }
          return { id: response.id, ...(response.data() as ReceivableDTO) };
        } else {
          return null;
        }
      })
      .catch((error) => {
        if (error instanceof ApiError) {
          const err = JSON.parse(JSON.stringify(error));
          throw new ApiError(err.message, err.statusCode);
        } else ErrorsFirebase.presenterError(error);
      });

    return receivable ? receivable : null;
  }

  public async createReceivable({
    receivableData,
    userId,
  }: Omit<
    CreateReceivableInputDTO,
    'createdAt'
  >): Promise<CreateReceivableOutputDTO | null> {
    const createdAt = new Date().getTime();

    if (receivableData.userId !== userId)
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);

    const newReceivable = ReceivableEntitie.create({
      ...receivableData,
      createdAt,
    });

    const data = await this.dbCollection
      .add({
        personUserId: newReceivable.personUserId,
        userId: newReceivable.userId,
        descriptionReceivable: newReceivable.descriptionReceivable,
        fixedReceivable: newReceivable.fixedReceivable,
        receivableDate: newReceivable.receivableDate,
        icon: newReceivable.icon,
        amount: newReceivable.amount,
        paymentStatusId: newReceivable.paymentStatusId,
        paymentStatusDescription: newReceivable.paymentStatusDescription,
        categoryId: newReceivable.categoryId,
        categoryDescription: newReceivable.categoryDescription,
        paymentMethodId: newReceivable.paymentMethodId,
        paymentMethodDescription: newReceivable.paymentMethodDescription,
        createdAt: newReceivable.createdAt,
      })
      .then((response) => response)
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    return {
      id: data?.id,
    };
  }

  public async updateReceivable({
    receivableId,
    receivableData,
    userId,
  }: EditReceivableInputDTO): Promise<ReceivableDTO> {
    const updatedAt = new Date().getTime();

    await this.handleCanProgressToWritteOperation.execute(
      this.dbCollection,
      receivableId,
      userId,
    );

    const receivable = ReceivableEntitie.with({
      ...receivableData,
      updatedAt,
    });

    await this.dbCollection
      .doc(receivableId)
      .update({
        id: receivable.id,
        personUserId: receivable.personUserId,
        userId: receivable.userId,
        descriptionReceivable: receivable.descriptionReceivable,
        fixedReceivable: receivable.fixedReceivable,
        receivableDate: receivable.receivableDate,
        receivalDate: receivable.receivalDate,
        icon: receivable.icon,
        amount: receivable.amount,
        paymentStatusId: receivable.paymentStatusId,
        paymentStatusDescription: receivable.paymentStatusDescription,
        categoryId: receivable.categoryId,
        categoryDescription: receivable.categoryDescription,
        paymentMethodId: receivable.paymentMethodId,
        paymentMethodDescription: receivable.paymentMethodDescription,
        createdAt: receivable.createdAt,
        updatedAt: receivable.updatedAt,
      })
      .then((response) => response)
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    return {
      id: receivableId,
      ...receivableData,
      updatedAt,
    };
  }

  public async deleteReceivable({
    id,
    userId,
  }: DeleteReceivableInputDTO): Promise<void> {
    await this.handleCanProgressToWritteOperation.execute(
      this.dbCollection,
      id,
      userId,
    );

    await this.dbCollection
      .doc(id)
      .delete()
      .then((response) => response)
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });
  }
}
