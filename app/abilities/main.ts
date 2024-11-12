/*
|--------------------------------------------------------------------------
| Bouncer abilities
|--------------------------------------------------------------------------
|
| You may export multiple abilities from this file and pre-register them
| when creating the Bouncer instance.
|
| Pre-registered policies and abilities can be referenced as a string by their
| name. Also they are must if want to perform authorization inside Edge
| templates.
|
*/

import { Bouncer, AuthorizationResponse } from '@adonisjs/bouncer'
import User from '#models/user'
import { ADMIN, TWO_FA_APP, AUTHENTICATOR } from '#constants/user_role_constants'

export const manageUser = Bouncer.ability((user: User) => {
  const allowUserRole = [ADMIN]

  if (allowUserRole.includes(user.userRoleId)) {
    return true
  }

  return AuthorizationResponse.deny('Unauthorized action', 403)
})

export const manage2FA = Bouncer.ability((user: User) => {
  const allowUserRole = [ADMIN, TWO_FA_APP]

  if (allowUserRole.includes(user.userRoleId)) {
    return true
  }

  return AuthorizationResponse.deny('Unauthorized action', 403)
})

export const manageUser2FA = Bouncer.ability((user: User) => {
  const allowUserRole = [ADMIN, TWO_FA_APP, AUTHENTICATOR]

  if (allowUserRole.includes(user.userRoleId)) {
    return true
  }

  return AuthorizationResponse.deny('Unauthorized action', 403)
})
