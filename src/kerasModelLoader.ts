const { spawn } = require('child_process')
const streams = require('memory-streams')
import * as tf from '@tensorflow/tfjs-node'
const path = require('path')


class Model {
  private model: any
  private modelPath: string

  constructor(args: { model: string }) {
    this.modelPath = args.model
  }

  open() {
    this.model = spawn('python3', [path.join(__dirname, 'model.py'), this.modelPath])
  }

  close() {
    this.model.kill('SIGHUP')
  }

  async predict(tensor: tf.Tensor) {
    const tensorJsArray = tensor.arraySync()
    const sendMsg = {
      command: 'predict',
      data: tensorJsArray
    }
    const res: any = await this.send(JSON.stringify(sendMsg))
    return tf.tensor(res.data)
  }

  private async send(message: string) {
    return new Promise<JSON>((resolve: any, reject: any) => {
      const msgStream = new streams.ReadableStream(message+'\n')
      msgStream.pipe(this.model.stdin)
      let buffer: Buffer

      this.model.stdout.on('data', (data: Buffer) => {
        const startFlag = data.toString().match('s-')
        const endFlag = data.toString().match('-e')

        if (startFlag && endFlag) { // if getted all date at one chunk.
          const bufferString = data.toString().replace('s-', '').replace('-e', '')
          resolve(JSON.parse(bufferString))
        }
        else if (startFlag) {
          buffer = data
        }
        else if (endFlag) {
          buffer = Buffer.concat([buffer, data])
          const bufferString = buffer.toString().replace('s-', '').replace('-e', '')
          resolve(JSON.parse(bufferString))
        }
        else {
          buffer = Buffer.concat([buffer, data])
        }
      })

      this.model.on('error', (err: Error) => {
        reject(err)
      })

      this.model.on('exit', (code: Buffer, signal: string) => {
        if (signal !== 'SIGHUP') {
          reject(new Error('exit with code: '+code.toString()))
        }
      })
    })
  }
}

export default Model
