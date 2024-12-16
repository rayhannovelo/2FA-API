import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import BaseController from '#controllers/base_controller'
import vine from '@vinejs/vine'
import TwoFa from '#models/two_fa'
import { existsRule } from '#rules/exists'
import UserTwoFa from '#models/user_two_fa'

export default class UserTwoFaController extends BaseController {
  /**
   * Display a list of resource
   */
  async index({ auth }: HttpContext) {
    const user = await auth.authenticate()
    const data = await db
      .from('user_2fas')
      .join('2fas', '2fas.id', '=', 'user_2fas.two_fa_id')
      .where('user_2fas.user_id', user.id)
      .select(
        'user_2fas.id',
        '2fas.reference_id',
        '2fas.user as account',
        '2fas.service as issuer',
        '2fas.secret',
        '2fas.created_at'
      )

    this.response('Tokens retrieved successfully', data)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ auth, request }: HttpContext) {
    const user = await auth.authenticate()
    const payload = request.body()
    const validator = vine.compile(
      vine.object({
        referenceId: vine
          .string()
          .uuid({ version: [4] })
          .use(existsRule({ table: '2fas', column: 'reference_id' })),
      })
    )
    const output = await validator.validate(payload)

    // get 2fas
    const twoFas = await TwoFa.query()
      .select('id')
      .where('reference_id', output.referenceId)
      .firstOrFail()

    // save token
    await UserTwoFa.create({
      userId: user.id,
      twoFaId: twoFas.id,
    })

    this.response('Token created successfully')
  }

  /**
   * Sync 2fas when user log in
   */
  async sync({ auth, request }: HttpContext) {
    const user = await auth.authenticate()
    const payload = request.body()
    const validator = vine.compile(
      vine.object({
        referenceId: vine.array(
          vine
            .string()
            .uuid({ version: [4] })
            .use(existsRule({ table: '2fas', column: 'reference_id' }))
        ),
      })
    )
    const output = await validator.validate(payload)

    // get 2fas
    const twoFas = await TwoFa.query().select('id').whereIn('reference_id', output.referenceId)

    // sync token
    twoFas.forEach(async (value) => {
      const userTwoFa = await UserTwoFa.query()
        .where('user_id', user.id)
        .where('two_fa_id', value.id)

      // save if not exist
      if (!userTwoFa.length) {
        await UserTwoFa.create({
          userId: user.id,
          twoFaId: value.id,
        })
      }
    })

    this.response('Token synced successfully')
  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    const data = await UserTwoFa.findOrFail(params.id)
    await data?.delete()

    this.response('Token deleted successfully')
  }
}
