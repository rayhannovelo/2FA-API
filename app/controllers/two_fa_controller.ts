import type { HttpContext } from '@adonisjs/core/http'
import BaseController from '#controllers/base_controller'
import vine from '@vinejs/vine'
import { authenticator } from '@otplib/preset-default'
import { generateQRCode } from '#helpers/main'
import TwoFa from '#models/two_fa'
import { existsRule } from '#rules/exists'

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

    // set otp & qrcode
    const otpauth = authenticator.keyuri(user, service, secret)
    const qrCode = await generateQRCode(otpauth)

    // generate token
    const token = authenticator.generate(secret)

    // save
    const data = await TwoFa.create({ userAppId: userApp.id, user, service, secret, token })
    console.log(data.referenceId)

    this.response('User role created successfully', {
      referenceId: data.referenceId,
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

    const data = await TwoFa.findByOrFail('reference_id', output.referenceId)

    // verify token
    const isValid = authenticator.verify({ token: output.token, secret: data!.secret })

    this.response('Token verified successfully', { isValid })
  }
}
