export class UserEntity {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  roleId: string;
  role?: {
    id: string;
    name: string;
    description?: string | null;
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
    delete (this as any).password;
  }
}
