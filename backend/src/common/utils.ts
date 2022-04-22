import { hashSync, genSaltSync, compareSync } from 'bcryptjs'
import * as csv from 'csv-parser'
import { Readable } from 'stream'

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

/**
 * read keywords from csv file
 * @param {string} buffer
 * @returns {Promise<string[]>}
 */
export const readCsvAsync = (buffer): Promise<string[]> => new Promise((resolve) => {
  const rows = []
  Readable.from(buffer)
    .pipe(
      csv({ headers: false })
    )
    .on('data', (row) => {
      rows.push(row[0])
    })
    .on('end', () => {
      resolve(rows)
      // console.table(rows)
    })
})

/**
 * return a standard queue job id
 * @param {string} keywordId
 * @returns {string}
 */
export const standardizeQueuedJobId = (keywordId: string): string => `${keywordId}-${new Date().getTime()}`
