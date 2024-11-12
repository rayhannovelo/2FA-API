import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import BaseController from '#controllers/base_controller'
import vine from '@vinejs/vine'
import { authenticator } from '@otplib/preset-default'
import { generateQRCode } from '#helpers/main'
import TwoFa from '#models/two_fa'
import { existsRule } from '#rules/exists'
import { DateTime } from 'luxon'
import TwoFaLog from '#models/two_fa_log'
import UserTwoFa from '#models/user_two_fa'

export default class TwoFaController extends BaseController {
  /**
   * Display a list of resource
   */
  async index({ auth, request }: HttpContext) {
    const validator = vine.compile(
      vine.object({
        user: vine.string(),
      })
    )
    const output = await validator.validate({ user: request.qs().user || null })

    // get user app
    const userApp = await auth.authenticate()

    // set data
    const user = output.user
    const service = `${userApp.name} 2FA`
    const secret = authenticator.generateSecret()

    // set otpauth uri
    const otpauth = authenticator.keyuri(user, service, secret)

    // save to database
    const twoFa = await TwoFa.create({ userAppId: userApp.id, user, service, secret })

    // generate qrcode with additional params
    const qrCode = await generateQRCode(`${otpauth}&referenceId=${twoFa.referenceId}`)

    this.response('User role created successfully', {
      referenceId: twoFa.referenceId,
      qrCode,
    })
  }

  async verifyToken({ request }: HttpContext) {
    const payload = request.body()
    const validator = vine.compile(
      vine.object({
        referenceId: vine
          .string()
          .uuid({ version: [4] })
          .use(existsRule({ table: '2fas', column: 'reference_id' })),
        token: vine.string(),
      })
    )
    const output = await validator.validate(payload)

    // get 2fa
    const twoFa = await TwoFa.findByOrFail('reference_id', output.referenceId)

    // verify token
    const isValid = authenticator.verify({ token: output.token, secret: twoFa!.secret })

    // save verified timestamp
    if (isValid) {
      twoFa.lastVerifiedAt = DateTime.local()

      await twoFa.save()
    }

    // save 2fa logs
    await TwoFaLog.create({ twoFaId: twoFa.id, isValid })

    this.response('Token verified successfully', { isValid })
  }

  async syncTokens({ auth, request }: HttpContext) {
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

  async tokens({ auth }: HttpContext) {
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
}
