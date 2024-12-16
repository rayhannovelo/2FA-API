import type { HttpContext } from '@adonisjs/core/http'
import BaseController from '#controllers/base_controller'
import vine from '@vinejs/vine'
import { authenticator } from '@otplib/preset-default'
import { generateQRCode } from '#helpers/main'
import TwoFa from '#models/two_fa'
import { existsRule } from '#rules/exists'
import { DateTime } from 'luxon'
import TwoFaLog from '#models/two_fa_log'

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

    this.response('2FA QrCode created successfully', {
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
}
