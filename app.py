from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'hi this is the kiki chatbot'
