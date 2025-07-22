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
  ReceivablesByMonthInputDTO,
  SearchByDateGetReceivablesInputDTO,
  SortByReceivableTypeInputDTO,
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
import { ApplySortStatusGateway } from '@/domain/Helpers/gateway/apply-sort-status.gateway';

export class ReceivablesRepositoryFirebase
  implements ReceivableRepositoryGateway
{
  private static instance: ReceivablesRepositoryFirebase;
  private dbCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
  private collection = 'Receivable';
  private mapOrderingKeysToBillAttribute = {
    paymentStatus: 'paymentStatus',
    category: 'categoryDescriptionEnum',
    categoryGroup: 'categoryGroup',
    paymentMethod: 'paymentMethodDescriptionEnum',
  } as const;

  private constructor(
    private readonly db: admin.firestore.Firestore,
    private mergeSortHelper: MergeSortGateway,
    private applyPaginationHelpers: ApplyPaginationGateway,
    private handleCanProgressToWritteOperation: HandleCanProgressToWriteOperationGateway,
    private applySortStatusHelper: ApplySortStatusGateway,
  ) {
    this.dbCollection = this.db.collection(this.collection);
    ReceivableEntitie.setMaskAmountGateway(new MaskAmountMaskService());
  }

  public static create(
    db: admin.firestore.Firestore,
    mergeSortHelper: MergeSortGateway,
    applyPaginationHelpers: ApplyPaginationGateway,
    handleCanProgressToWritteOperation: HandleCanProgressToWriteOperationGateway,
    applySortStatusHelper: ApplySortStatusGateway,
  ) {
    if (!ReceivablesRepositoryFirebase.instance) {
      ReceivablesRepositoryFirebase.instance =
        new ReceivablesRepositoryFirebase(
          db,
          mergeSortHelper,
          applyPaginationHelpers,
          handleCanProgressToWritteOperation,
          applySortStatusHelper,
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
      this.applySortStatusHelper.execute({
        listToIncludeSortItems: applyFiltersInData,
        sortByStatus,
        invoiceType: 'receivable',
      });
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

    if (searchByDate) {
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

  private mapOrderingKey(key: keyof OrderByGetReceivablesInputDTO | undefined) {
    const map = this.mapOrderingKeysToBillAttribute;

    return key && key in map
      ? (map[key as keyof typeof map] as keyof ReceivableDTO)
      : (key as keyof ReceivableDTO | undefined);
  }

  private applyOrderingReceivables(
    input: GetReceivablesInputDTO,
    data: Array<ReceivableDTO>,
  ) {
    const { ordering } = input;

    const orderingKey = ordering
      ? (Object.keys(ordering)[0] as keyof OrderByGetReceivablesInputDTO)
      : undefined;

    const mapOrderingKey = this.mapOrderingKey(orderingKey);

    if (
      !ordering ||
      !orderingKey ||
      !mapOrderingKey ||
      orderingKey === 'createdAt'
    )
      return data;

    const orderingDirection =
      orderingKey !== undefined
        ? ordering[orderingKey] === SortOrder.ASC
        : true;

    const dataOrdering = this.mergeSortHelper.execute<ReceivableDTO>(
      data,
      mapOrderingKey,
      orderingDirection,
    );

    return dataOrdering;
  }

  private createInstanceReceivableEntitie(receivable: ReceivableDTO) {
    const receivableEntitie = ReceivableEntitie.with(receivable);

    return {
      id: receivableEntitie.id,
      personUserId: receivableEntitie.personUserId,
      userId: receivableEntitie.userId,
      descriptionReceivable: receivableEntitie.descriptionReceivable,
      fixedReceivable: receivableEntitie.fixedReceivable,
      receivableDate: receivableEntitie.receivableDate,
      receivalDate: receivableEntitie.receivalDate,
      receival: receivableEntitie.receival,
      icon: receivableEntitie.icon,
      amount: receivableEntitie.amount,
      paymentStatus: receivableEntitie.paymentStatus,
      categoryId: receivableEntitie.categoryId,
      categoryDescription: receivableEntitie.categoryDescription,
      categoryDescriptionEnum: receivableEntitie.categoryDescriptionEnum,
      categoryGroup: receivableEntitie.categoryGroup,
      paymentMethodId: receivableEntitie.paymentMethodId,
      paymentMethodDescription: receivableEntitie.paymentMethodDescription,
      paymentMethodDescriptionEnum:
        receivableEntitie.paymentMethodDescriptionEnum,
      createdAt: receivableEntitie.createdAt,
      updatedAt: receivableEntitie.updatedAt,
    };
  }

  private async handleQueryReceivables({
    userId,
    direction,
  }: {
    userId: string;
    direction: SortOrder;
  }) {
    const query: admin.firestore.Query<admin.firestore.DocumentData> =
      this.dbCollection;

    const data = await query
      .where('userId', '==', userId)
      .orderBy('createdAt', direction)
      .get()
      .then((response) =>
        response.docs?.map((item) =>
          this.createInstanceReceivableEntitie({
            id: item.id,
            ...item.data(),
          } as ReceivableDTO),
        ),
      )
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    return data as Array<ReceivableDTO>;
  }

  private async handleBuildSearchReceivables(
    input: GetReceivablesInputDTO,
  ): Promise<ResponseListDTO<ReceivableDTO>> {
    const { ordering, userId } = input;

    const direction = (
      ordering && Object.prototype.hasOwnProperty.call(ordering, 'createdAt')
        ? ordering['createdAt']
        : SortOrder.ASC
    ) as SortOrder;

    let data = await this.handleQueryReceivables({ userId, direction });

    data = this.applyFilterReceivables(input, data as Array<ReceivableDTO>);

    data = this.applyOrderingReceivables(input, data as Array<ReceivableDTO>);

    return this.applyPaginationHelpers.execute<
      GetReceivablesInputDTO,
      OrderByGetReceivablesInputDTO,
      ReceivableDTO
    >(input, data as Array<ReceivableDTO>);
  }

  public async getReceivables(
    input: GetReceivablesInputDTO,
  ): Promise<ResponseListDTO<ReceivableDTO>> {
    const data = await this.handleBuildSearchReceivables(input);

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
          return this.createInstanceReceivableEntitie({
            id: response.id,
            ...(response.data() as ReceivableDTO),
          });
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
        receivalDate: newReceivable.receivalDate,
        receival: newReceivable.receival,
        icon: newReceivable.icon,
        amount: newReceivable.amount,
        paymentStatus: newReceivable.paymentStatus,
        categoryId: newReceivable.categoryId,
        categoryDescription: newReceivable.categoryDescription,
        categoryDescriptionEnum: newReceivable.categoryDescriptionEnum,
        categoryGroup: newReceivable.categoryGroup,
        paymentMethodId: newReceivable.paymentMethodId,
        paymentMethodDescription: newReceivable.paymentMethodDescription,
        paymentMethodDescriptionEnum:
          newReceivable.paymentMethodDescriptionEnum,
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
        receival: receivable.receival,
        icon: receivable.icon,
        amount: receivable.amount,
        paymentStatus: receivable.paymentStatus,
        categoryId: receivable.categoryId,
        categoryDescription: receivable.categoryDescription,
        categoryDescriptionEnum: receivable.categoryDescriptionEnum,
        categoryGroup: receivable.categoryGroup,
        paymentMethodId: receivable.paymentMethodId,
        paymentMethodDescription: receivable.paymentMethodDescription,
        paymentMethodDescriptionEnum: receivable.paymentMethodDescriptionEnum,
        createdAt: receivable.createdAt,
        updatedAt: receivable.updatedAt,
      })
      .then((response) => response)
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    return {
      id: receivable.id,
      personUserId: receivable.personUserId,
      userId: receivable.userId,
      descriptionReceivable: receivable.descriptionReceivable,
      fixedReceivable: receivable.fixedReceivable,
      receivableDate: receivable.receivableDate,
      receivalDate: receivable.receivalDate,
      receival: receivable.receival,
      icon: receivable.icon,
      amount: receivable.amount,
      paymentStatus: receivable.paymentStatus,
      categoryId: receivable.categoryId,
      categoryDescription: receivable.categoryDescription,
      categoryDescriptionEnum: receivable.categoryDescriptionEnum,
      categoryGroup: receivable.categoryGroup,
      paymentMethodId: receivable.paymentMethodId,
      paymentMethodDescription: receivable.paymentMethodDescription,
      paymentMethodDescriptionEnum: receivable.paymentMethodDescriptionEnum,
      createdAt: receivable.createdAt,
      updatedAt: receivable.updatedAt,
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

  public async receivablesByMonth({
    period,
    userId,
    page,
    size,
  }: ReceivablesByMonthInputDTO): Promise<ResponseListDTO<ReceivableDTO>> {
    if (!userId) throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);

    if (
      !period ||
      !period?.initialDate ||
      !period?.finalDate ||
      isNaN(period.initialDate) ||
      isNaN(period.finalDate)
    ) {
      throw new ApiError(ERROR_MESSAGES.INVALID_PERIOD, 400);
    }

    let data = await this.handleQueryReceivables({
      userId,
      direction: SortOrder.ASC,
    });

    const searchByDate: SearchByDateGetReceivablesInputDTO = {
      receivableDate: period,
    };

    const sortByReceivables: SortByReceivableTypeInputDTO = {
      receival: false,
    };

    const ordering: OrderByGetReceivablesInputDTO = {
      receivableDate: SortOrder.ASC,
    };

    data = this.applyFilterReceivables(
      {
        userId,
        sortByReceivables,
        searchByDate,
        ordering,
      } as GetReceivablesInputDTO,
      data as Array<ReceivableDTO>,
    );

    data = this.applyOrderingReceivables(
      {
        userId,
        sortByReceivables,
        searchByDate,
        ordering,
      } as GetReceivablesInputDTO,
      data as Array<ReceivableDTO>,
    );

    return this.applyPaginationHelpers.execute<
      GetReceivablesInputDTO,
      OrderByGetReceivablesInputDTO,
      ReceivableDTO
    >({ page, size }, data as Array<ReceivableDTO>);
  }
}
