import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  static environment = ['development', 'testing', 'production']

  async run() {
    await User.updateOrCreateMany('id', [
      {
        id: 1,
        userRoleId: 1,
        userStatusId: 1,
        username: 'superadmin',
        password: 'superadmin',
        name: 'Superadmin',
        email: 'superadmin@gmail.com',
        emailVerifiedAt: null,
        photo: null,
      },
      {
        id: 2,
        userRoleId: 2,
        userStatusId: 1,
        username: 'mysiska_2fa',
        password: 'd870faadcfef8bfcdbaaeca966f9e42d57825e4622b8e7bb940f90cd99e6b576',
        name: 'MySISKA',
        email: null,
        emailVerifiedAt: null,
        photo: null,
      },
      {
        id: 3,
        userRoleId: 2,
        userStatusId: 1,
        username: 'sinur_2fa',
        password: 'a269205a3bc5c4bd904795c0a668ad20bab1454860a34942d3668a35abf1b54b',
        name: 'SINUR',
        email: null,
        emailVerifiedAt: null,
        photo: null,
      },
    ])
  }
}
