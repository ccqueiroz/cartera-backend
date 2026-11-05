export const TRANSACTION_LIST_FIELDS = {
  ordering: ['dueDate', 'paymentDate', 'amount', 'paidAmount'],
  sort: [
    'categoryDescriptionEnum',
    'paymentMethodDescriptionEnum',
    'paymentStatus',
  ],
  searchByDate: ['dueDate', 'paymentDate'],
} as const;
