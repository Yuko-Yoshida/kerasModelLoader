import * as tf from '@tensorflow/tfjs-node';
declare class Model {
    private model;
    private modelPath;
    constructor(args: {
        model: string;
    });
    open(): void;
    close(): void;
    predict(tensor: tf.Tensor): Promise<tf.Tensor<tf.Rank>>;
    private send;
}
export default Model;
