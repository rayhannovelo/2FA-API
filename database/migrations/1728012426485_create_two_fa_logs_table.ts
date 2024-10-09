import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = '2fa_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('two_fa_id')
        .unsigned()
        .notNullable()
        .references('2fas.id')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE')
      table.boolean('is_valid').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
