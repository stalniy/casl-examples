import type { AppAbility } from './modules/auth/abilities.ts';
import type UserModel from './modules/users/model.ts';

declare global {
  namespace Express {
    interface Request {
      ability: AppAbility;
    }

    interface User extends InstanceType<typeof UserModel> {}
  }
}
