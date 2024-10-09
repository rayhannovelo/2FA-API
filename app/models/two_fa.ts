import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import User from '#models/user'

export default class TwoFa extends BaseModel {
  static table = '2fas'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare referenceId: string

  @column()
  declare userAppId: number

  @column()
  declare user: string

  @column()
  declare service: string

  @column()
  declare secret: string

  @column.dateTime({
    serialize: (value: DateTime | null) => {
      return value ? value.toFormat('yyyy-MM-dd HH:mm:ss') : value
    },
  })
  declare lastVerifiedAt: DateTime | null

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

  @beforeCreate()
  static assignUuid(twoFa: TwoFa) {
    twoFa.referenceId = randomUUID()
  }

  @belongsTo(() => User)
  declare userApp: BelongsTo<typeof User>
}
