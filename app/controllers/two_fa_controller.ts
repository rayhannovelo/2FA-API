import type { HttpContext } from '@adonisjs/core/http'
import BaseController from '#controllers/base_controller'
import vine from '@vinejs/vine'
import { authenticator } from '@otplib/preset-default'
import { generateQRCode } from '#helpers/main'
import TwoFa from '#models/two_fa'

export default class TwoFaController extends BaseController {
  /**
   * Display a list of resource
   */
  async index({ auth, request }: HttpContext) {
    // validate
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
    const generateQR = await generateQRCode(otpauth)

    // generate token
    const token = authenticator.generate(secret)

    // save
    await TwoFa.create({ userAppId: userApp.id, user, service, secret, token })

    // verify token
    const isValid = authenticator.verify({ token, secret })

    this.response('User role created successfully', { secret, otpauth, generateQR, token, isValid })
  }

  async verify({}: HttpContext) {}
}
