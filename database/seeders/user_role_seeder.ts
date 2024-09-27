import { BaseSeeder } from '@adonisjs/lucid/seeders'
import UserRole from '#models/user_role'

export default class extends BaseSeeder {
  static environment = ['development', 'testing', 'production']

  async run() {
    await UserRole.updateOrCreateMany('id', [
      {
        id: 1,
        userRoleName: 'Superadmin',
        userRoleDescription: 'All features',
      },
      {
        id: 2,
        userRoleName: '2FA App',
        userRoleDescription: '2FA App features',
      },
      {
        id: 3,
        userRoleName: 'Authenticator',
        userRoleDescription: 'Authenticator features',
      },
    ])
  }
}
