/**
 * @swagger
 * components:
 *   schemas:
 *     ReceivableDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: e8305798-ccc3-4cb1-8de0-5df4c987a71b
 *         personUserId:
 *           type: string
 *           example: diWBib6eEDK490GGMngi
 *         userId:
 *           type: string
 *           example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *         descriptionReceivable:
 *           type: string
 *           example: Salário
 *         fixedReceivable:
 *           type: boolean
 *           example: true
 *         receivableDate:
 *           type: number
 *           nullable: true
 *           example: 1739751148154
 *         receivalDate:
 *           type: number
 *           nullable: true
 *           example: 1739751148154
 *         receival:
 *           type: boolean
 *           example: true
 *         icon:
 *           type: string
 *           nullable: true
 *           example: https://example.com/icon.jpg
 *         amount:
 *           type: number
 *           example: 1200.76
 *         paymentStatus:
 *           $ref: '#/components/schemas/PaymentStatusDescriptionEnum'
 *         categoryId:
 *           type: string
 *           example: c2ecc075-82d2-406b-88cd-491c686654eb
 *         categoryDescription:
 *           type: string
 *           example: Uber
 *         categoryDescriptionEnum:
 *           $ref: '#/components/schemas/CategoryDescriptionEnum'
 *         categoryGroup:
 *           $ref: '#/components/schemas/CategoryGroupEnum'
 *         paymentMethodId:
 *           type: string
 *           example: c4dcb140-1c3e-411c-b6e1-f3cdb55b3c54
 *         paymentMethodDescription:
 *           type: string
 *           example: Pix
 *         paymentMethodDescriptionEnum:
 *           $ref: '#/components/schemas/PaymentMethodDescriptionEnum'
 *         createdAt:
 *           type: number
 *           nullable: true
 *           example: 1704067200000
 *         updatedAt:
 *           type: number
 *           nullable: true
 *           example: 1704067200000
 *
 *     BillDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: e8305798-ccc3-4cb1-8de0-5df4c987a71b
 *         personUserId:
 *           type: string
 *           example: diWBib6eEDK490GGMngi
 *         userId:
 *           type: string
 *           example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *         descriptionBill:
 *           type: string
 *           example: Faculdade
 *         fixedBill:
 *           type: boolean
 *           example: true
 *         billDate:
 *           type: number
 *           nullable: true
 *           example: 1739751148154
 *         payDate:
 *           type: number
 *           nullable: true
 *           example: 1739751148154
 *         payOut:
 *           type: boolean
 *           example: true
 *         icon:
 *           type: string
 *           nullable: true
 *           example: https://example.com/icon.jpg
 *         amount:
 *           type: number
 *           example: 1200.76
 *         paymentStatus:
 *           $ref: '#/components/schemas/PaymentStatusDescriptionEnum'
 *         categoryId:
 *           type: string
 *           example: c2ecc075-82d2-406b-88cd-491c686654eb
 *         categoryDescription:
 *           type: string
 *           example: Uber
 *         categoryDescriptionEnum:
 *           $ref: '#/components/schemas/CategoryDescriptionEnum'
 *         categoryGroup:
 *           $ref: '#/components/schemas/CategoryGroupEnum'
 *         paymentMethodId:
 *           type: string
 *           example: c4dcb140-1c3e-411c-b6e1-f3cdb55b3c54
 *         paymentMethodDescription:
 *           type: string
 *           example: Pix
 *         paymentMethodDescriptionEnum:
 *           $ref: '#/components/schemas/PaymentMethodDescriptionEnum'
 *         isPaymentCardBill:
 *           type: boolean
 *           example: true
 *         invoiceCarData:
 *           $ref: '#/components/schemas/InvoiceCardData'
 *         isShoppingListBill:
 *           type: boolean
 *           example: false
 *         shoppingListData:
 *           $ref: '#/components/schemas/ShoppingListData'
 *         createdAt:
 *           type: number
 *           nullable: true
 *           example: 1704067200000
 *         updatedAt:
 *           type: number
 *           nullable: true
 *           example: 1704067200000
 *
 *     CreateBillInputDTO:
 *       type: object
 *       properties:
 *         personUserId:
 *           type: string
 *           example: diWBib6eEDK490GGMngi
 *         userId:
 *           type: string
 *           example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *         descriptionBill:
 *           type: string
 *           example: Faculdade
 *         fixedBill:
 *           type: boolean
 *           example: true
 *         billDate:
 *           type: number
 *           nullable: true
 *           example: 1739751148154
 *         payDate:
 *           type: number
 *           nullable: true
 *           example: 1739751148154
 *         payOut:
 *           type: boolean
 *           example: true
 *         icon:
 *           type: string
 *           nullable: true
 *           example: https://example.com/icon.jpg
 *         amount:
 *           type: number
 *           example: 1200.76
 *         categoryId:
 *           type: string
 *           example: c2ecc075-82d2-406b-88cd-491c686654eb
 *         categoryDescription:
 *           type: string
 *           example: Uber
 *         categoryDescriptionEnum:
 *           $ref: '#/components/schemas/CategoryDescriptionEnum'
 *         categoryGroup:
 *           $ref: '#/components/schemas/CategoryGroupEnum'
 *         paymentMethodId:
 *           type: string
 *           example: c4dcb140-1c3e-411c-b6e1-f3cdb55b3c54
 *         paymentMethodDescription:
 *           type: string
 *           example: Pix
 *         paymentMethodDescriptionEnum:
 *           $ref: '#/components/schemas/PaymentMethodDescriptionEnum'
 *         isPaymentCardBill:
 *           type: boolean
 *           example: true
 *         invoiceCarData:
 *           $ref: '#/components/schemas/InvoiceCardData'
 *         isShoppingListBill:
 *           type: boolean
 *           example: false
 *         shoppingListData:
 *           $ref: '#/components/schemas/ShoppingListData'
 *
 *     CreateReceivableInputDTO:
 *       type: object
 *       properties:
 *         personUserId:
 *           type: string
 *           example: diWBib6eEDK490GGMngi
 *         userId:
 *           type: string
 *           example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *         descriptionReceivable:
 *           type: string
 *           example: Salário
 *         fixedReceivable:
 *           type: boolean
 *           example: true
 *         receivableDate:
 *           type: number
 *           nullable: true
 *           example: 1739751148154
 *         receivalDate:
 *           type: number
 *           nullable: true
 *           example: 1739751148154
 *         receival:
 *           type: boolean
 *           example: true
 *         icon:
 *           type: string
 *           nullable: true
 *           example: https://example.com/icon.jpg
 *         amount:
 *           type: number
 *           example: 1200.76
 *         categoryId:
 *           type: string
 *           example: c2ecc075-82d2-406b-88cd-491c686654eb
 *         categoryDescription:
 *           type: string
 *           example: Uber
 *         categoryDescriptionEnum:
 *           $ref: '#/components/schemas/CategoryDescriptionEnum'
 *         categoryGroup:
 *           $ref: '#/components/schemas/CategoryGroupEnum'
 *         paymentMethodId:
 *           type: string
 *           example: c4dcb140-1c3e-411c-b6e1-f3cdb55b3c54
 *         paymentMethodDescription:
 *           type: string
 *           example: Pix
 *         paymentMethodDescriptionEnum:
 *           $ref: '#/components/schemas/PaymentMethodDescriptionEnum'
 *
 *     UpdateBillInputDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: e8305798-ccc3-4cb1-8de0-5df4c987a71b
 *         personUserId:
 *           type: string
 *           example: diWBib6eEDK490GGMngi
 *         userId:
 *           type: string
 *           example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *         descriptionBill:
 *           type: string
 *           example: Faculdade
 *         fixedBill:
 *           type: boolean
 *           example: true
 *         billDate:
 *           type: number
 *           nullable: true
 *           example: 1739751148154
 *         payDate:
 *           type: number
 *           nullable: true
 *           example: 1739751148154
 *         payOut:
 *           type: boolean
 *           example: true
 *         icon:
 *           type: string
 *           nullable: true
 *           example: https://example.com/icon.jpg
 *         amount:
 *           type: number
 *           example: 1200.76
 *         categoryId:
 *           type: string
 *           example: c2ecc075-82d2-406b-88cd-491c686654eb
 *         categoryDescription:
 *           type: string
 *           example: Uber
 *         categoryDescriptionEnum:
 *           $ref: '#/components/schemas/CategoryDescriptionEnum'
 *         paymentMethodId:
 *           type: string
 *           example: c4dcb140-1c3e-411c-b6e1-f3cdb55b3c54
 *         paymentMethodDescription:
 *           type: string
 *           example: Pix
 *         paymentMethodDescriptionEnum:
 *           $ref: '#/components/schemas/PaymentMethodDescriptionEnum'
 *         isPaymentCardBill:
 *           type: boolean
 *           example: true
 *         invoiceCarData:
 *           $ref: '#/components/schemas/InvoiceCardData'
 *         isShoppingListBill:
 *           type: boolean
 *           example: false
 *         shoppingListData:
 *           $ref: '#/components/schemas/ShoppingListData'
 *         createdAt:
 *           type: number
 *           nullable: true
 *           example: 1704067200000
 *
 *     UpdateReceivableInputDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: e8305798-ccc3-4cb1-8de0-5df4c987a71b
 *         personUserId:
 *           type: string
 *           example: diWBib6eEDK490GGMngi
 *         userId:
 *           type: string
 *           example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *         descriptionReceivable:
 *           type: string
 *           example: Salário
 *         fixedReceivable:
 *           type: boolean
 *           example: true
 *         receivableDate:
 *           type: number
 *           nullable: true
 *           example: 1739751148154
 *         receivalDate:
 *           type: number
 *           nullable: true
 *           example: 1739751148154
 *         receival:
 *           type: boolean
 *           example: true
 *         icon:
 *           type: string
 *           nullable: true
 *           example: https://example.com/icon.jpg
 *         amount:
 *           type: number
 *           example: 1200.76
 *         categoryId:
 *           type: string
 *           example: c2ecc075-82d2-406b-88cd-491c686654eb
 *         categoryDescription:
 *           type: string
 *           example: Uber
 *         categoryDescriptionEnum:
 *           $ref: '#/components/schemas/CategoryDescriptionEnum'
 *         paymentMethodId:
 *           type: string
 *           example: c4dcb140-1c3e-411c-b6e1-f3cdb55b3c54
 *         paymentMethodDescription:
 *           type: string
 *           example: Pix
 *         paymentMethodDescriptionEnum:
 *           $ref: '#/components/schemas/PaymentMethodDescriptionEnum'
 *         createdAt:
 *           type: number
 *           nullable: true
 *           example: 1704067200000
 *
 *     UpdateBillByPayableMonthDTO:
 *       type: object
 *       properties:
 *         payDate:
 *           type: number
 *           nullable: true
 *           example: 1739751148154
 *         payOut:
 *           type: boolean
 *           example: true
 *         paymentMethodId:
 *           type: string
 *           example: c4dcb140-1c3e-411c-b6e1-f3cdb55b3c54
 *         paymentMethodDescription:
 *           type: string
 *           example: Pix
 *         paymentMethodDescriptionEnum:
 *           $ref: '#/components/schemas/PaymentMethodDescriptionEnum'
 *
 *     UpdateReceivableByMonthDTO:
 *       type: object
 *       properties:
 *         receivalDate:
 *           type: number
 *           nullable: true
 *           example: 1739751148154
 *         receival:
 *           type: boolean
 *           example: true
 *         paymentMethodId:
 *           type: string
 *           example: c4dcb140-1c3e-411c-b6e1-f3cdb55b3c54
 *         paymentMethodDescription:
 *           type: string
 *           example: Pix
 *         paymentMethodDescriptionEnum:
 *           $ref: '#/components/schemas/PaymentMethodDescriptionEnum'
 *
 *     AuthDTO:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: usuario@example.com
 *         userId:
 *           type: string
 *           example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *         accessToken:
 *           type: string
 *           example: eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ0MjY5YTE3MzBlNTA3MTllNmIxNjA2ZTQyYzNhYjMyYjEyODA0NDkiLCJ0eXAiOiJKV1QifQ...
 *         refreshToken:
 *           type: string
 *           example: AMf-vBzHWb5CVzqi280Ai5zLoOyVzK-8QiQSsvfBBZ8Sp1yuiOr5ioekiz5y27v_H1rI8KgM7jWY7um7kFrjjme3jkFx6pWlReWS...
 *         expirationTime:
 *           type: number
 *           example: 1724148470215
 *         lastLoginAt:
 *           type: number
 *           example: 1724144869975
 *
 *     CategoryDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID da categoria.
 *           example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *         description:
 *           type: string
 *           description: Descrição da categoria.
 *           example: Uber
 *         descriptionEnum:
 *           $ref: '#/components/schemas/CategoryDescriptionEnum'
 *         group:
 *           $ref: '#/components/schemas/CategoryGroupEnum'
 *         createdAt:
 *           type: number
 *           example: 1724144869975
 *         updatedAt:
 *           type: number
 *           example: 1724144869975
 *
 *     PaymentMethodDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *         description:
 *           type: string
 *           example: Cartão de Crédito
 *         descriptionEnum:
 *           $ref: '#/components/schemas/PaymentMethodDescriptionEnum'
 *         createdAt:
 *           type: number
 *           example: 1724144869975
 *         updatedAt:
 *           type: number
 *           example: 1724144869975
 *
 *     PaymentStatusDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 0e8f775d-07c1-4ca1-abea-57157ff173b0
 *         description:
 *           type: string
 *           example: Pago
 *         descriptionEnum:
 *           $ref: '#/components/schemas/PaymentStatusDescriptionEnum'
 *         createdAt:
 *           type: number
 *           example: 1724144869975
 *         updatedAt:
 *           type: number
 *           example: 1724144869975
 *
 *     PersonUserDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *         userId:
 *           type: string
 *           example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           example: usuario@example.com
 *         fullName:
 *           type: string
 *           example: John Doe
 *         image:
 *           type: string
 *           example: https://example.com/profile.jpg
 *         createdAt:
 *           type: number
 *           example: 1724144869975
 *         updatedAt:
 *           type: number
 *           example: 1724144869975
 *
 *     BillsPayableMonthOutPutDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *         descriptionBill:
 *           type: string
 *           example: Compras do Supermercado
 *         amount:
 *           type: number
 *           example: 1200.00
 *         billDate:
 *           type: number
 *           example: 1743390000000
 *         categoryId:
 *           type: string
 *           example: 7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e
 *         categoryDescription:
 *           type: string
 *           example: Uber
 *         categoryDescriptionEnum:
 *           $ref: '#/components/schemas/CategoryDescriptionEnum'
 *         status:
 *           type: string
 *           enum:
 *             - PENDING
 *             - DUE_SOON
 *             - DUE_DAY
 *             - OVERDUE
 *             - PAID
 *           example: DUE_SOON
 *
 *     OrderByAmount:
 *       type: object
 *       properties:
 *         amount:
 *           type: string
 *           enum: [asc, desc]
 *           example: asc
 *
 *     OrderByReceivableDate:
 *       type: object
 *       properties:
 *         receivableDate:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *
 *     OrderByReceivalDate:
 *       type: object
 *       properties:
 *         receivalDate:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *
 *     OrderByBillDate:
 *       type: object
 *       properties:
 *         billDate:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *
 *     OrderByPayDate:
 *       type: object
 *       properties:
 *         payDate:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *
 *     OrderByCategory:
 *       type: object
 *       properties:
 *         categoryId:
 *           type: string
 *           enum: [asc, desc]
 *           example: asc
 *
 *     OrderByPaymentMethod:
 *       type: object
 *       properties:
 *         paymentMethodId:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *
 *     OrderByPaymentStatus:
 *       type: object
 *       properties:
 *         paymentStatusId:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *
 *     OrderByCreated:
 *       type: object
 *       properties:
 *         createdAt:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *
 *     OrderByUpdated:
 *       type: object
 *       properties:
 *         updatedAt:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *
 *     InvoiceCardData:
 *       type: object
 *       properties:
 *         paymentCardId:
 *           type: string
 *           example: d2ecc072-82d2-406b-88cd-491c686654ez
 *         invoiceCardId:
 *           type: string
 *           example: se2e2075-82d2-406b-88cd-491c686654ez
 *
 *     ShoppingListData:
 *       type: object
 *       properties:
 *         shoppingListId:
 *           type: string
 *           example: d2kpc982-62z2-436b-88cd-491c68665ui8
 *
 *     CashFlowDTO:
 *       type: object
 *       properties:
 *         year:
 *           type: number
 *           example: 2025
 *         month:
 *           type: string
 *           enum:
 *             - JAN
 *             - FEV
 *             - MAR
 *             - ABR
 *             - MAI
 *             - JUN
 *             - JUL
 *             - AGO
 *             - SET
 *             - OUT
 *             - NOV
 *             - DEZ
 *           example: ABR
 *         generalIncomes:
 *           type: number
 *           example: 1000.0
 *         paidIncomes:
 *           type: number
 *           example: 900.0
 *         generalExpenses:
 *           type: number
 *           example: 500.0
 *         paidExpenses:
 *           type: number
 *           example: 500.0
 *         generalProfit:
 *           type: number
 *           example: 100.0
 *         paidProfit:
 *           type: number
 *           example: 400.0
 *
 *     CashFlowDTOListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CashFlowDTO'
 *           example:
 *             - year: 2025
 *               month: JAN
 *               generalIncomes: 3000.0
 *               generalExpenses: 1200.0
 *               generalProfit: 1800.0
 *               paidIncomes: 3000.0
 *               paidExpenses: 1200.0
 *               paidProfit: 1800.0
 *             - year: 2025
 *               month: FEV
 *               generalIncomes: 2500.0
 *               generalExpenses: 1500.0
 *               generalProfit: 1000.0
 *               paidIncomes: 2500.0
 *               paidExpenses: 1500.0
 *               paidProfit: 1000.0
 *             - year: 2025
 *               month: MAR
 *               generalIncomes: 2800.0
 *               generalExpenses: 1600.0
 *               generalProfit: 1200.0
 *               paidIncomes: 2800.0
 *               paidExpenses: 1600.0
 *               paidProfit: 1200.0
 *             - year: 2025
 *               month: ABR
 *               generalIncomes: 2600.0
 *               generalExpenses: 1300.0
 *               generalProfit: 1300.0
 *               paidIncomes: 2600.0
 *               paidExpenses: 1300.0
 *               paidProfit: 1300.0
 *             - year: 2025
 *               month: MAI
 *               generalIncomes: 3200.0
 *               generalExpenses: 2000.0
 *               generalProfit: 1200.0
 *               paidIncomes: 3200.0
 *               paidExpenses: 2000.0
 *               paidProfit: 1200.0
 *             - year: 2025
 *               month: JUN
 *               generalIncomes: 3100.0
 *               generalExpenses: 1500.0
 *               generalProfit: 1600.0
 *               paidIncomes: 3100.0
 *               paidExpenses: 1500.0
 *               paidProfit: 1600.0
 *             - year: 2025
 *               month: JUL
 *               generalIncomes: 3300.0
 *               generalExpenses: 1800.0
 *               generalProfit: 1500.0
 *               paidIncomes: 3300.0
 *               paidExpenses: 1800.0
 *               paidProfit: 1500.0
 *             - year: 2025
 *               month: AGO
 *               generalIncomes: 2900.0
 *               generalExpenses: 1200.0
 *               generalProfit: 1700.0
 *               paidIncomes: 2900.0
 *               paidExpenses: 1200.0
 *               paidProfit: 1700.0
 *             - year: 2025
 *               month: SET
 *               generalIncomes: 3000.0
 *               generalExpenses: 1100.0
 *               generalProfit: 1900.0
 *               paidIncomes: 3000.0
 *               paidExpenses: 1100.0
 *               paidProfit: 1900.0
 *             - year: 2025
 *               month: OUT
 *               generalIncomes: 2700.0
 *               generalExpenses: 1400.0
 *               generalProfit: 1300.0
 *               paidIncomes: 2700.0
 *               paidExpenses: 1400.0
 *               paidProfit: 1300.0
 *             - year: 2025
 *               month: NOV
 *               generalIncomes: 2600.0
 *               generalExpenses: 1500.0
 *               generalProfit: 1100.0
 *               paidIncomes: 2600.0
 *               paidExpenses: 1500.0
 *               paidProfit: 1100.0
 *             - year: 2025
 *               month: DEZ
 *               generalIncomes: 3500.0
 *               generalExpenses: 2000.0
 *               generalProfit: 1500.0
 *               paidIncomes: 3500.0
 *               paidExpenses: 2000.0
 *               paidProfit: 1500.0
 *
 *     CategoryDescriptionEnum:
 *       type: string
 *       description: Enumeração da descrição da categoria.
 *       enum:
 *         - UBER
 *         - NINY_NINE
 *         - BLABLACAR
 *         - LYFT
 *         - CABIFY
 *         - '99POP'
 *         - BUS
 *         - SUBWAY
 *         - TRAIN
 *         - AIRPLANE
 *         - FUEL
 *         - VEHICLE_MAINTENANCE
 *         - TOLLS_PARKING
 *         - IFOOD
 *         - UBER_EATS
 *         - RAPPI
 *         - JAMES_DELIVERY
 *         - NINY_NINE_FOOD
 *         - ZE_DELIVERY
 *         - ONLINE_FOOD_ORDERS
 *         - RESTAURANT
 *         - FAST_FOOD
 *         - CAFE_BISTRO
 *         - PHARMACY
 *         - GYM
 *         - BEAUTY
 *         - SUPPLEMENTS
 *         - RENT
 *         - CONDOMINIUM_FEE
 *         - ENERGY
 *         - WATER
 *         - GAS
 *         - INTERNET_TV
 *         - PHONE
 *         - CLEANING_LAUNDRY
 *         - REPAIR_MAINTENANCE
 *         - VEHICLE_FINANCING
 *         - PROPERTY_FINANCING
 *         - VEHICLE_CREDIT_LINE
 *         - PROPERTY_CREDIT_LINE
 *         - AUTO_INSURANCE
 *         - HEALTH_INSURANCE
 *         - LIFE_INSURANCE
 *         - HOME_INSURANCE
 *         - CLOTHING_ACCESSORIES
 *         - FLIGHT_TICKETS
 *         - ACCOMMODATION
 *         - TOURS
 *         - CAR_RENTAL
 *         - GIFTS_DONATIONS
 *         - TAXES
 *         - PET_FOOD
 *         - PET_VETERINARY
 *         - PET_SHOP
 *         - DEPENDENTS_CARE
 *         - CLEANING_LAUNDRY_SERVICE
 *         - OFFICE_SUPPLIES
 *         - COWORKING
 *         - BUSINESS_SOFTWARE
 *         - HARDWARE
 *         - SOFTWARE_APPS
 *         - SOFTWARE_SUBSCRIPTIONS
 *         - ACCOUNTANT
 *         - CONSULTING
 *         - TECHNICAL_MAINTENANCE
 *         - SPORTS_HOBBIES
 *         - CREDIT_CARD_PAYMENT
 *         - OTHER_EXPENSES
 *         - SALARY
 *         - PROFIT_WITHDRAWAL
 *         - RENT_INCOME
 *         - INVESTMENT_INCOME
 *         - REIMBURSEMENTS
 *         - COMMISSIONS_BONUSES
 *         - DONATIONS_INHERITANCE
 *         - CAPITAL_CONTRIBUTIONS
 *         - PARTNERSHIP_SPONSOR_INCOME
 *         - PENSIONS
 *         - CASHBACK_REWARDS
 *         - OTHER_INCOME
 *       example: UBER
 *
 *     CategoryGroupEnum:
 *       type: string
 *       description: Grupo da categoria.
 *       enum:
 *         - MOBILITY_BY_APP
 *         - TRANSPORT
 *         - FOOD_DELIVERY
 *         - FOOD
 *         - HEALTH_AND_WELL_BEING
 *         - HOUSING
 *         - FINANCING
 *         - INSURANCE
 *         - SHOPPING
 *         - TRAVEL_AND_TOURISM
 *         - PET_CARE
 *         - CARE
 *         - SERVICES
 *         - PROFESSIONAL_SERVICES
 *         - BUSINESS
 *         - TECHNOLOGY
 *         - LEISURE
 *         - REVENUES
 *         - TAXES
 *         - OTHERS
 *       example: MOBILITY_BY_APP
 *
 *     PaymentMethodDescriptionEnum:
 *       type: string
 *       description: Enumeração das descrições dos métodos de pagamento.
 *       enum:
 *         - DEBIT_CARD
 *         - CREDIT_CARD
 *         - BANK_SLIP
 *         - BANK_DEPOSIT
 *         - BANK_TRANSFER
 *         - AUTOMATIC_DEBIT
 *         - BOOKLET
 *         - CASH
 *         - CHECK
 *         - PROMISSORY
 *         - FINANCING
 *         - MEAL_VOUCHER
 *         - FOOD_VOUCHER
 *         - PIX
 *         - CRYPTOCURRENCY
 *       example: CREDIT_CARD
 *
 *     PaymentStatusDescriptionEnum:
 *       type: string
 *       description: Enumeração das descrições dos status de pagamento.
 *       enum:
 *         - PAID
 *         - RECEIVED
 *         - TO_PAY
 *         - TO_RECEIVE
 *         - DUE_SOON
 *         - DUE_DAY
 *         - OVERDUE
 *       example: PAID
 */
