import * as admin from 'firebase-admin';
import { BillRepositoryGateway } from '@/domain/Bill/gateway/bill.repository.gateway';
import { MergeSortGateway } from '@/domain/Helpers/gateway/merge-sort.gateway';
import { BillEntitie } from '@/domain/Bill/entitie/bill.entitie';
import { MaskAmountMaskService } from '../../masks/mask-amount.mask';
import {
  BillDTO,
  BillsPayableMonthInputDTO,
  CreateBillInputDTO,
  CreateBillOutputDTO,
  DeleteBillInputDTO,
  EditBillInputDTO,
  GetBillByIdInputDTO,
  GetBillsInputDTO,
  OrderByGetBillsInputDTO,
  SortByBillTypeInputDTO,
} from '@/domain/Bill/dtos/bill.dto';
import { SortOrder } from '@/domain/dtos/listParamsDto.dto';
import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';
import { ApplyPaginationGateway } from '@/domain/Helpers/gateway/apply-pagination.gateway';
import { ErrorsFirebase } from '../../database/firebase/errorHandling';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { HandleCanProgressToWriteOperationGateway } from '../../database/firebase/core/gateway/handleCanProgressToWriteOperation.gateway';
import { ApplySortStatusGateway } from '@/domain/Helpers/gateway/apply-sort-status.gateway';
import { ApplySearchByDateGateway } from '@/domain/Helpers/gateway/apply-search-by-date.gateway';
import { BillSearchByDateDTO } from '@/domain/Helpers/dtos/search-by-date-input.dto';

export class BillsRepositoryFirebase implements BillRepositoryGateway {
  private static instance: BillsRepositoryFirebase;
  private dbCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
  private collection = 'Bill';
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
    private applySearchByDate: ApplySearchByDateGateway,
  ) {
    this.dbCollection = this.db.collection(this.collection);
    BillEntitie.setMaskAmountGateway(new MaskAmountMaskService());
  }

  public static create(
    db: admin.firestore.Firestore,
    mergeSortHelper: MergeSortGateway,
    applyPaginationHelpers: ApplyPaginationGateway,
    handleCanProgressToWritteOperation: HandleCanProgressToWriteOperationGateway,
    applySortStatusHelper: ApplySortStatusGateway,
    applySearchByDate: ApplySearchByDateGateway,
  ) {
    if (!BillsRepositoryFirebase.instance) {
      BillsRepositoryFirebase.instance = new BillsRepositoryFirebase(
        db,
        mergeSortHelper,
        applyPaginationHelpers,
        handleCanProgressToWritteOperation,
        applySortStatusHelper,
        applySearchByDate,
      );
    }
    return BillsRepositoryFirebase.instance;
  }

  private applyFilterBills(input: GetBillsInputDTO, data: Array<BillDTO>) {
    const { sort: sortByStatus, sortByBills, searchByDate } = input;

    if (!sortByStatus && !sortByBills && !searchByDate) return data;

    const applyFiltersInData: Array<(item: BillDTO) => boolean> = [];

    if (sortByStatus) {
      this.applySortStatusHelper.execute({
        listToIncludeSortItems: applyFiltersInData,
        sortByStatus,
        invoiceType: 'bill',
      });
    }

    if (sortByBills) {
      if (sortByBills.fixedBill !== undefined) {
        const value = sortByBills.fixedBill;
        applyFiltersInData.push((item) => item.fixedBill === value);
      }
      if (sortByBills.payOut !== undefined) {
        const value = sortByBills.payOut;
        applyFiltersInData.push((item) => item.payOut === value);
      }
      if (sortByBills.amount !== undefined) {
        const value = sortByBills.amount;
        applyFiltersInData.push((item) => item.amount >= value);
      }
      if (sortByBills.isPaymentCardBill !== undefined) {
        const value = sortByBills.isPaymentCardBill;
        applyFiltersInData.push((item) => item.isPaymentCardBill === value);
      }
      if (sortByBills.isShoppingListBill !== undefined) {
        const value = sortByBills.isShoppingListBill;
        applyFiltersInData.push((item) => item.isShoppingListBill === value);
      }
    }

    if (searchByDate) {
      this.applySearchByDate.execute({
        listToIncludeSearchItems: applyFiltersInData,
        searchByDate: {
          typeDTO: searchByDate,
          invoiceType: 'bill',
        },
      });
    }

    return applyFiltersInData.length === 0
      ? data
      : data.filter((item) =>
          applyFiltersInData.every((predicate) => predicate(item)),
        );
  }

  private mapOrderingKey(key: keyof OrderByGetBillsInputDTO | undefined) {
    const map = this.mapOrderingKeysToBillAttribute;

    return key && key in map
      ? (map[key as keyof typeof map] as keyof BillDTO)
      : (key as keyof BillDTO | undefined);
  }

  private applyOrderingBills(input: GetBillsInputDTO, data: Array<BillDTO>) {
    const { ordering } = input;

    const orderingKey = ordering
      ? (Object.keys(ordering)[0] as keyof OrderByGetBillsInputDTO)
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

    const dataOrdering = this.mergeSortHelper.execute<BillDTO>(
      data,
      mapOrderingKey,
      orderingDirection,
    );

    return dataOrdering;
  }

  private createInstanceBillEntitie(bill: BillDTO) {
    const billEntitie = BillEntitie.with(bill);

    return {
      id: billEntitie.id,
      personUserId: billEntitie.personUserId,
      userId: billEntitie.userId,
      descriptionBill: billEntitie.descriptionBill,
      fixedBill: billEntitie.fixedBill,
      billDate: billEntitie.billDate,
      payDate: billEntitie.payDate,
      payOut: billEntitie.payOut,
      icon: billEntitie.icon,
      amount: billEntitie.amount,
      paymentStatus: billEntitie.paymentStatus,
      categoryId: billEntitie.categoryId,
      categoryDescription: billEntitie.categoryDescription,
      categoryDescriptionEnum: billEntitie.categoryDescriptionEnum,
      categoryGroup: billEntitie.categoryGroup,
      paymentMethodId: billEntitie.paymentMethodId,
      paymentMethodDescription: billEntitie.paymentMethodDescription,
      paymentMethodDescriptionEnum: billEntitie.paymentMethodDescriptionEnum,
      isPaymentCardBill: billEntitie.isPaymentCardBill,
      isShoppingListBill: billEntitie.isShoppingListBill,
      createdAt: billEntitie.createdAt,
      updatedAt: billEntitie.updatedAt,
    };
  }

  private async handleQueryBills({
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
          this.createInstanceBillEntitie({
            id: item.id,
            ...item.data(),
          } as BillDTO),
        ),
      )
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    return data as Array<BillDTO>;
  }

  private async handleBuildSearchBills(
    input: GetBillsInputDTO,
  ): Promise<ResponseListDTO<BillDTO>> {
    const { ordering, userId } = input;

    const direction = (
      ordering && Object.prototype.hasOwnProperty.call(ordering, 'createdAt')
        ? ordering['createdAt']
        : SortOrder.ASC
    ) as SortOrder;

    let data = await this.handleQueryBills({ userId, direction });

    data = this.applyFilterBills(input, data as Array<BillDTO>);

    data = this.applyOrderingBills(input, data as Array<BillDTO>);

    return this.applyPaginationHelpers.execute<
      GetBillsInputDTO,
      OrderByGetBillsInputDTO,
      BillDTO
    >(input, data as Array<BillDTO>);
  }

  public async getBills(
    input: GetBillsInputDTO,
  ): Promise<ResponseListDTO<BillDTO>> {
    const data = await this.handleBuildSearchBills(input);

    return data;
  }

  public async getBillById({
    id,
    userId,
  }: GetBillByIdInputDTO): Promise<BillDTO | null> {
    const bill = await this.dbCollection
      .doc(id)
      .get()
      .then((response) => {
        if (response.exists) {
          if (response.data()?.userId !== userId) {
            throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
          }
          return this.createInstanceBillEntitie({
            id: response.id,
            ...(response.data() as BillDTO),
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

    return bill ? bill : null;
  }

  public async createBill({
    billData,
    userId,
  }: Omit<
    CreateBillInputDTO,
    'createdAt'
  >): Promise<CreateBillOutputDTO | null> {
    const createdAt = new Date().getTime();

    if (billData.userId !== userId)
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);

    const newBill = BillEntitie.create({
      ...billData,
      createdAt,
    });

    const data = await this.dbCollection
      .add({
        personUserId: newBill.personUserId,
        userId: newBill.userId,
        descriptionBill: newBill.descriptionBill,
        fixedBill: newBill.fixedBill,
        billDate: newBill.billDate,
        payDate: newBill.payDate,
        payOut: newBill.payOut,
        icon: newBill.icon,
        amount: newBill.amount,
        paymentStatus: newBill.paymentStatus,
        categoryId: newBill.categoryId,
        categoryDescription: newBill.categoryDescription,
        categoryDescriptionEnum: newBill.categoryDescriptionEnum,
        categoryGroup: newBill.categoryGroup,
        paymentMethodId: newBill.paymentMethodId,
        paymentMethodDescription: newBill.paymentMethodDescription,
        paymentMethodDescriptionEnum: newBill.paymentMethodDescriptionEnum,
        isPaymentCardBill: newBill.isPaymentCardBill,
        isShoppingListBill: newBill.isShoppingListBill,
        createdAt: newBill.createdAt,
      })
      .then((response) => response)
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    return {
      id: data?.id,
    };
  }

  public async updateBill({
    billId,
    billData,
    userId,
  }: EditBillInputDTO): Promise<BillDTO> {
    const updatedAt = new Date().getTime();

    await this.handleCanProgressToWritteOperation.execute(
      this.dbCollection,
      billId,
      userId,
    );

    const bill = BillEntitie.with({
      ...billData,
      updatedAt,
    });

    await this.dbCollection
      .doc(billId)
      .update({
        id: bill.id,
        personUserId: bill.personUserId,
        userId: bill.userId,
        descriptionBill: bill.descriptionBill,
        fixedBill: bill.fixedBill,
        billDate: bill.billDate,
        payDate: bill.payDate,
        payOut: bill.payOut,
        icon: bill.icon,
        amount: bill.amount,
        paymentStatus: bill.paymentStatus,
        categoryId: bill.categoryId,
        categoryDescription: bill.categoryDescription,
        categoryDescriptionEnum: bill.categoryDescriptionEnum,
        categoryGroup: bill.categoryGroup,
        paymentMethodId: bill.paymentMethodId,
        paymentMethodDescription: bill.paymentMethodDescription,
        paymentMethodDescriptionEnum: bill.paymentMethodDescriptionEnum,
        isPaymentCardBill: bill.isPaymentCardBill,
        isShoppingListBill: bill.isShoppingListBill,
        createdAt: bill.createdAt,
        updatedAt: bill.updatedAt,
      })
      .then((response) => response)
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    return {
      id: bill.id,
      personUserId: bill.personUserId,
      userId: bill.userId,
      descriptionBill: bill.descriptionBill,
      fixedBill: bill.fixedBill,
      billDate: bill.billDate,
      payDate: bill.payDate,
      payOut: bill.payOut,
      icon: bill.icon,
      amount: bill.amount,
      paymentStatus: bill.paymentStatus,
      categoryId: bill.categoryId,
      categoryDescription: bill.categoryDescription,
      categoryDescriptionEnum: bill.categoryDescriptionEnum,
      categoryGroup: bill.categoryGroup,
      paymentMethodId: bill.paymentMethodId,
      paymentMethodDescription: bill.paymentMethodDescription,
      paymentMethodDescriptionEnum: bill.paymentMethodDescriptionEnum,
      isPaymentCardBill: bill.isPaymentCardBill,
      isShoppingListBill: bill.isShoppingListBill,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
    };
  }

  public async deleteBill({ id, userId }: DeleteBillInputDTO): Promise<void> {
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

  public async billsPayableMonth({
    period,
    userId,
    page,
    size,
  }: BillsPayableMonthInputDTO): Promise<ResponseListDTO<BillDTO>> {
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

    let data = await this.handleQueryBills({
      userId,
      direction: SortOrder.ASC,
    });

    const searchByDate: BillSearchByDateDTO = {
      billDate: period,
    };

    const sortByBills: SortByBillTypeInputDTO = {
      payOut: false,
    };

    const ordering: OrderByGetBillsInputDTO = {
      billDate: SortOrder.ASC,
    };

    data = this.applyFilterBills(
      { userId, sortByBills, searchByDate, ordering } as GetBillsInputDTO,
      data as Array<BillDTO>,
    );

    data = this.applyOrderingBills(
      { userId, sortByBills, searchByDate, ordering } as GetBillsInputDTO,
      data as Array<BillDTO>,
    );

    return this.applyPaginationHelpers.execute<
      GetBillsInputDTO,
      OrderByGetBillsInputDTO,
      BillDTO
    >({ page, size }, data as Array<BillDTO>);
  }
}
