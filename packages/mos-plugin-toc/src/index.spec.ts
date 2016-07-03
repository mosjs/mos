import {expect} from 'chai'
import path from 'path'
import fs from 'fs'
const ROOT = path.resolve(__dirname, '../../test/fixtures')
const fixtures = fs.readdirSync(ROOT).filter(filepath => filepath.indexOf('.') !== 0)

import mos, {Processor} from 'mos-processor'
import toc from './index'

describe('mos-plugin-toc', () => {
  fixtures.forEach((fixture: string) => {
    const filepath = path.join(ROOT, fixture)
    const output = fs.readFileSync(path.join(filepath, 'output.md'), 'utf-8')
    const input = fs.readFileSync(path.join(filepath, 'input.md'), 'utf-8')
    const configPath = path.join(filepath, 'config.json')
    const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf-8')) : {}

    it('should pass fixture in dir ' + filepath, done => {
      mos({ content: input }, [{ register: toc, options: config }])
        .then((processor: Processor) => processor.process())
        .then((result: string) => {
          expect(result).to.eq(output)
          done()
        })
        .catch(done)
    })
  })
})
