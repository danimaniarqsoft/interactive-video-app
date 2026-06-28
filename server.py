import os
from flask import Flask, send_from_directory

app = Flask(__name__, static_folder='.')

# Serve the main index.html file
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Serve assets from the data folder seamlessly with byte-range support
@app.route('/data/<path:filename>')
def serve_data(filename):
    return send_from_directory('data', filename)

if __name__ == '__main__':
    print("--- Starting Advanced Media Server on http://localhost:8000 ---")
    app.run(host='0.0.0.0', port=8000, debug=True)