import { hashSync, genSaltSync, compareSync } from 'bcryptjs'

/**
 * generate hash from password or string
 * @param {string} password
 * @returns {string}
 */
export const generateHash = (password: string) => hashSync(password, genSaltSync())

/**
 * compare text with hash
 * @param {string} pass
 * @param {string} hash
 * @returns {boolean}
 */
export const comparePwd = (pass: string, hash: string) => compareSync(pass, hash)
