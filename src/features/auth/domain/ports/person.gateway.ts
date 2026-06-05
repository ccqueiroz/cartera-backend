export interface CreatedPerson {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface PersonAccountState {
  deletedAt: string | null;
}

export interface PersonGateway {
  create(input: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<CreatedPerson>;
  findByUserIdIncludingDeleted(
    userId: string,
  ): Promise<PersonAccountState | null>;
}
