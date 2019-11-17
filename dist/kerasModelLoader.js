"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { spawn } = require('child_process');
const streams = require('memory-streams');
const tf = require("@tensorflow/tfjs-node");
const path = require('path');
class Model {
    constructor(args) {
        this.modelPath = args.model;
    }
    open() {
        this.model = spawn('python3', [path.join(__dirname, 'model.py'), this.modelPath]);
    }
    close() {
        this.model.kill('SIGHUP');
    }
    async predict(tensor) {
        const tensorJsArray = tensor.arraySync();
        const sendMsg = {
            command: 'predict',
            data: tensorJsArray
        };
        const res = await this.send(JSON.stringify(sendMsg));
        return tf.tensor(res.data);
    }
    async send(message) {
        return new Promise((resolve, reject) => {
            const msgStream = new streams.ReadableStream(message + '\n');
            msgStream.pipe(this.model.stdin);
            let buffer;
            this.model.stdout.on('data', (data) => {
                const startFlag = data.toString().match('s-');
                const endFlag = data.toString().match('-e');
                if (startFlag && endFlag) { // if getted all date at one chunk.
                    const bufferString = data.toString().replace('s-', '').replace('-e', '');
                    resolve(JSON.parse(bufferString));
                }
                else if (startFlag) {
                    buffer = data;
                }
                else if (endFlag) {
                    buffer = Buffer.concat([buffer, data]);
                    const bufferString = buffer.toString().replace('s-', '').replace('-e', '');
                    resolve(JSON.parse(bufferString));
                }
                else {
                    buffer = Buffer.concat([buffer, data]);
                }
            });
            this.model.on('error', (err) => {
                reject(err);
            });
            this.model.on('exit', (code, signal) => {
                if (signal !== 'SIGHUP') {
                    reject(new Error('exit with code: ' + code.toString()));
                }
            });
        });
    }
}
exports.default = Model;
