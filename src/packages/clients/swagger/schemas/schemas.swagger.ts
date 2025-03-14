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
 *         paymentStatusId:
 *           type: string
 *           example: 68e47c3b-6d34-4604-bf7c-f9e2da704107
 *         paymentStatusDescription:
 *           type: string
 *           example: A receber
 *         categoryId:
 *           type: string
 *           example: c2ecc075-82d2-406b-88cd-491c686654eb
 *         categoryDescription:
 *           type: string
 *           example: Salário/Pró-labore
 *         paymentMethodId:
 *           type: string
 *           example: c4dcb140-1c3e-411c-b6e1-f3cdb55b3c54
 *         paymentMethodDescription:
 *           type: string
 *           example: Depósito
 *         createdAt:
 *           type: number
 *           nullable: true
 *           example: 1704067200000
 *         updatedAt:
 *           type: number
 *           nullable: true
 *           example: 1704067200000
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
 *           example: App Mobilidade
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
 *           example: Cartão de crédito
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
 */
