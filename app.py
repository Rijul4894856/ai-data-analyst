from flask_cors import CORS
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO

from flask import send_file
from flask import Flask, render_template, request, jsonify
import os
import pandas as pd

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index2.html')

# global df cache
data_cache = {}

@app.route('/upload', methods=['POST'])
def upload():
    try:
        file = request.files['file']
        filename = file.filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Load file without cleaning
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        elif filename.endswith('.xlsx') or filename.endswith('.xls'):
            df = pd.read_excel(filepath)
        elif filename.endswith('.json'):
            df = pd.read_json(filepath)
        else:
            return jsonify({'error': 'Unsupported file type'}), 400

        # Cache the raw DataFrame in memory for future cleaning
        data_cache['raw'] = df.copy()

        # Summary of raw data
        summary = df.describe(include='all').fillna('').to_dict()

        return jsonify({
            'summary': summary,
            'columns': list(df.columns),
            'rows': len(df),
            'status': 'raw'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/clean', methods=['POST'])
def clean():
    try:
        options = request.json  # Get cleaning choices from frontend
        df = data_cache.get('raw')

        if df is None:
            return jsonify({'error': 'No data uploaded yet'}), 400

        # Apply options
        if options.get('drop_duplicates'):
            df.drop_duplicates(inplace=True)
        if options.get('strip_column_names'):
            df.columns = df.columns.str.strip()
        if options.get('lowercase_columns'):
            df.columns = df.columns.str.lower().str.replace(" ", "_")
        if options.get('fillna') == "na":
            df.fillna("N/A", inplace=True)
        elif options.get('fillna') == "zero":
            df.fillna(0, inplace=True)

        summary = df.describe(include='all').fillna('').to_dict()

        return jsonify({
            'summary': summary,
            'status': 'cleaned'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


from flask import send_file

@app.route('/download', methods=['GET'])
def download_cleaned():
    try:
        df = data_cache.get('raw')  # cleaned version is in-place updated
        if df is None:
            return jsonify({'error': 'No cleaned data found'}), 400

        cleaned_path = os.path.join(app.config['UPLOAD_FOLDER'], 'cleaned_data.csv')
        df.to_csv(cleaned_path, index=False)
        return send_file(cleaned_path, as_attachment=True)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/columns', methods=['GET'])
def get_columns():
    df = data_cache.get('raw')
    if df is None:
        return jsonify({'error': 'No data found'}), 400
    return jsonify({'columns': df.columns.tolist()})


@app.route('/plot', methods=['POST'])
def generate_plot():
    try:
        df = data_cache.get('raw')
        if df is None:
            return jsonify({'error': 'No data available'}), 400

        settings = request.json
        chart_type = settings.get('chart_type')
        x = settings.get('x')
        y = settings.get('y')  # might be None for histogram

        if not x or (chart_type != 'hist' and not y):
            return jsonify({'error': 'Missing axis columns'}), 400

        if x not in df.columns or (y and y not in df.columns):
            return jsonify({'error': 'Selected columns not found'}), 400

        plt.figure(figsize=(8, 6))
        sns.set(style="darkgrid")

        if chart_type == 'bar':
            sns.barplot(x=df[x], y=df[y])
        elif chart_type == 'scatter':
            sns.scatterplot(x=df[x], y=df[y])
        elif chart_type == 'hist':
            sns.histplot(df[x], bins=10)
        else:
            return jsonify({'error': 'Unsupported chart type'}), 400

        buf = BytesIO()
        plt.tight_layout()
        plt.savefig(buf, format='png')
        buf.seek(0)
        plt.close()
        return send_file(buf, mimetype='image/png')

    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
