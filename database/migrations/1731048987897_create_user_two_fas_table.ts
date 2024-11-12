import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_2fas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('users.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .integer('two_fa_id')
        .unsigned()
        .notNullable()
        .references('2fas.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
