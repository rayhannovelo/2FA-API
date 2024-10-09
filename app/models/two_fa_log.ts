import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import TwoFa from '#models/two_fa'

export default class TwoFaLog extends BaseModel {
  static table = '2fa_logs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare twoFaId: number

  @column()
  declare isValid: boolean

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

  @belongsTo(() => TwoFa)
  declare twoFa: BelongsTo<typeof TwoFa>
}
