/**
 * @swagger
 * components:
 *   schemas:
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
 *         - IN_PROGRESS
 *       example: PAID
 */
export {};
