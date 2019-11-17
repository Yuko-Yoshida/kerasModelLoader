from tensorflow.keras.models import load_model
import sys
import json
import numpy as np


model = load_model(sys.argv[1])


def send(msg):
    print("s-"+msg+"-e")    

def predict(data):
    data = np.array(data)
    predict = model.predict(data)
    return_json = {
        'msg': 'predict',
        'data': predict.tolist(),
        'shape': str(predict.shape)
    }
    return json.dumps(return_json)


while True:
    msg = input()
    msg = json.loads(msg)
    command = msg['command']
    data = msg['data']

    if command == 'predict':
        send(predict(data))
    else:
        print("s-"+msg+"-e")
