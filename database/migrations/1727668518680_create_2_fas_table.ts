import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = '2fas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('reference_id')
      table
        .integer('user_app_id')
        .unsigned()
        .notNullable()
        .references('users.id')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE')
      table.string('user').notNullable()
      table.string('service').notNullable()
      table.string('secret').notNullable()
      table.string('token')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  }

  async down() {
    this.schema.dropTable(this.tableName)

    this.schema.raw('DROP EXTENSION IF EXISTS "uuid-ossp"')
  }
}
