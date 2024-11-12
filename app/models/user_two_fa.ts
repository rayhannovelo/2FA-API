import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import User from '#models/user'
import TwoFa from '#models/two_fa'

export default class UserTwoFa extends BaseModel {
  static table = 'user_2fas'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare twoFaId: number

  @column.dateTime({
    autoCreate: true,
    serialize: (value: DateTime | null) => {
      return value ? value.toFormat('yyyy-MM-dd HH:mm:ss') : value
    },
  })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    serialize: (value: DateTime | null) => {
      return value ? value.toFormat('yyyy-MM-dd HH:mm:ss') : value
    },
  })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => TwoFa)
  declare twoFa: BelongsTo<typeof TwoFa>
}
