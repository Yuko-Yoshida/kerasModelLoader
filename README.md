# kerasModelLoader
Load keras model in Node.js

## requirements
* python3
* tensorflow

## example
```javascript
const kerasModelLoader = require('../dist/index.js').default
const tf = require('@tensorflow/tfjs-node')


// create an instance with keras model
const model = new kerasModelLoader({ model: './example/model.h5' })

// spawn model
model.open()
const resizedTensor = tf.zeros([1, 224, 224, 3])

// predict
model.predict(resizedTensor).then((res) => {

  res.print()

  // kill model
  model.close()
}).catch((err) => {
  throw err
})
```
