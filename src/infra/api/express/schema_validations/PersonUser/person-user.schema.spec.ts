import { runValidate } from '@/packages/clients/class-validator';
import { EditPersonUserValidationDTO } from './person-user.schema';

describe('Person User Schema', () => {
  it('should be validate the attributes of the EditPersonUserValidationDTO withou errors.', async () => {
    return runValidate<EditPersonUserValidationDTO>(
      EditPersonUserValidationDTO,
      {
        id: '1991',
        email: 'jonh.doe@gmail.com',
        userId: '1999',
        firstName: 'Jonh',
        lastName: 'Doe',
      },
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });
});
