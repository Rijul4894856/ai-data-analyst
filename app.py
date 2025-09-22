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
        options = request.json
        df = data_cache.get('raw')

        if df is None:
            return jsonify({'error': 'No data uploaded yet'}), 400

        # Apply options
        if options.get('drop_duplicate_rows'):
            df.drop_duplicates(inplace=True)
            
        if options.get('drop_duplicate_columns'):
            # Get the base column names without the .1, .2 suffixes
            base_columns = [col.split('.')[0] for col in df.columns]
            
            # Find duplicates in base column names
            seen = set()
            duplicates = set()
            for col in base_columns:
                if col in seen:
                    duplicates.add(col)
                else:
                    seen.add(col)
            
            # Keep only the first occurrence of each duplicate column
            columns_to_keep = []
            kept_columns = set()
            
            for col in df.columns:
                base_col = col.split('.')[0]
                if base_col not in duplicates or base_col not in kept_columns:
                    columns_to_keep.append(col)
                    kept_columns.add(base_col)
            
            df = df[columns_to_keep]
                
        if options.get('strip_column_names'):
            df.columns = df.columns.str.strip()
            
        if options.get('lowercase_columns'):
            df.columns = df.columns.str.lower().str.replace(" ", "_")
            
        if options.get('fillna') == "na":
            df.fillna("N/A", inplace=True)
        elif options.get('fillna') == "zero":
            df.fillna(0, inplace=True)

        data_cache['raw'] = df

        summary = df.describe(include='all').fillna('').to_dict()

        return jsonify({
            'summary': summary,
            'status': 'cleaned'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_columns')
def get_columns_for_duplicates():
    df = data_cache.get('raw')
    if df is not None:
        return jsonify({'columns': df.columns.tolist()})
    else:
        return jsonify({'columns': []})


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
def get_columns_for_dropdowns():
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




# from flask import Flask, request, jsonify
from sqlalchemy import create_engine, inspect
# import pandas as pd



# Store active connections
# Store active connections
connections = {}

@app.route('/connect-mysql', methods=['POST'])
def connect_mysql():
    """
    Connect to MySQL using provided credentials
    """
    try:
        data = request.json
        host = data.get("host")
        database = data.get("database")
        user = data.get("user")
        password = data.get("password")

        if not all([host, database, user, password]):
            return jsonify({"error": "Missing required fields"}), 400

        # Connection string for MySQL
        conn_str = f"mysql+pymysql://{user}:{password}@{host}/{database}"

        # Create SQLAlchemy engine
        engine = create_engine(conn_str)

        # Check tables available
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        # Save connection for later use
        connections[database] = engine

        return jsonify({
            "message": "Connected successfully",
            "tables": tables
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/get-mysql-table', methods=['POST'])
def get_mysql_table():
    """
    Fetch a table from the connected MySQL DB
    """
    try:
        data = request.json
        database = data.get("database")
        table_name = data.get("table")

        engine = connections.get(database)
        if engine is None:
            return jsonify({"error": "No active connection"}), 400

        # Load table into Pandas
        df = pd.read_sql(f"SELECT * FROM {table_name} LIMIT 100", engine)

        return jsonify({
            "columns": df.columns.tolist(),
            "rows": df.head(10).to_dict(orient="records")  # preview
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

from supabase import create_client

@app.route('/connect-supabase', methods=['POST'])
def connect_supabase():
    """
    Connect to Supabase using provided URL + Key
    """
    try:
        data = request.json
        supabase_url = data.get("supabase_url")
        supabase_key = data.get("supabase_key")

        if not supabase_url or not supabase_key:
            return jsonify({"error": "Missing Supabase URL or Key"}), 400

        # Create Supabase client
        client = create_client(supabase_url, supabase_key)

        # Try listing tables from Postgres catalog
        response = client.table("pg_tables").select("tablename").execute()

        if not response.data:
            return jsonify({"error": "Could not fetch tables (check permissions/key)"}), 400

        tables = [row["tablename"] for row in response.data]

        return jsonify({
            "message": "Connected successfully",
            "tables": tables
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
