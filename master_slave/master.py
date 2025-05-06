import socket
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import pickle
import json
import pandas as pd
from queue import Queue
from threading import Thread
from sklearn.preprocessing import StandardScaler
import time


#Inicialização do flask
app = Flask(__name__)
def start_http_server():
    logging.info("Iniciando servidor HTTP na porta 8000...")
    # CORS(app, resources={r"/slave_data": {"origins": "http://localhost:3000"}})
    CORS(app)
    app.run(host='0.0.0.0', port=8080)
    
# Filas para armazenar os dados dos Slaves
queque_slave1 = Queue()
queque_slave2 = Queue()

# Dados eviados ao frontend
processed_slave_data = {
    "slave_1": None,
    "slave_2": None
}

scaler = StandardScaler()
cols_to_process = ["Air_Temp", "Process_Temp", "Rotational_Speed", "Torque", "Tool_Life"]

# Configuração do logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        # Envia mensagens para o arquivo de log
        logging.FileHandler("master.log"),
        # Escreve as mensagens para o console  
        logging.StreamHandler()  
    ]
)

def create_slave_log(slave_id):
    """Cria um logger específico para cada Slave."""
    logger = logging.getLogger(slave_id)
    handler = logging.FileHandler(f"/home/mario/Python/Mestrado/projeto_monitor/logs/{slave_id}_logs.log")
    handler.setFormatter(logging.Formatter("%(asctime)s - %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger


# Carrega o modelo de predição
with open("failure_prediction_model.pkl", "rb") as file:
    # model = pickle.load(file)
    saved_objects = pickle.load(file)
    model = saved_objects["model"]
    scaler = saved_objects["scaler"]
    

def validate_and_scale(data):
    """Valida os dados recebidos e os escala usando o StandardScaler."""
    try:
        # Garante que os valores são numéricos
        sensor_values = [float(data.get(col, 0.0)) for col in cols_to_process]

        # Escala os dados
        sensor_df = pd.DataFrame([sensor_values], columns=cols_to_process)
        scaled_values = scaler.transform(sensor_df)

        return scaled_values

    except Exception as e:
        raise ValueError(f"Erro ao validar ou escalar os dados: {e}")

def handle_slave(port, queque, identifier):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(("0.0.0.0", port))
    server.listen(1)
    print(f"Master iniciando e esperando conexões na porta {port}...")

    while True:
        conn, addr = server.accept()
        data = conn.recv(1024).decode()
        # slave_logger = create_slave_log(identifier)

        try:
            json_data = json.loads(data)
            queque.put(json_data)
            last_update_time = time.time()

            logging.info(f"Conexão de {identifier}:{addr} com dados: {json_data}")

            # Valida e escala os dados recebidos
            scaled_data = validate_and_scale(json_data)
            # Faz a predição
            prediction = model.predict(scaled_data)
            
            if prediction == 1:
                # slave_logger.info(f"Falha prevista com dados: {json_data}")
                logging.info(f"Resposta enviada para {identifier}: {json_data}")
                logging.warning(f"Falha prevista para {identifier}: {json_data}")
            
            # Atualiza os dados processados globalmente
            json_data["prediction"] = int(prediction)  # Adiciona prediction ao json_data
            processed_slave_data[identifier.lower()] = {
                "raw_data": json_data
            }
                
            response = {
                "identifier": identifier,
                "prediction": int(prediction),
                "alert": processed_slave_data,
            }
            # Resposta de alerta com base na predição
            # response = f"Alerta de falha prevista para {identifier}: ({'Sim' if prediction == 1 else 'Não'})
            conn.send(json.dumps(response).encode())
            # time.sleep(5000)
            
        except json.JSONDecodeError as e:
            err_msg = f"Erro ao decodificar os dados JSON: {e}"
            logging.error(err_msg)
            conn.send(err_msg.encode())
        
        except Exception as e:
            err_msg = f"Erro ao processar os dados: {e}"
            logging.error(err_msg)
            conn.send(err_msg.encode())

        finally:
            conn.close()
            
         # Marcar o slave como inativo se não atualizar em X segundos
        if time.time() - last_update_time > 10:  
            processed_slave_data[identifier.lower()] = None

@app.route('/slave1_data', methods=['GET'])
def get_slave1_data():
    """Endpoints 1 e 2 para consultar os dados mais recentes dos Slaves."""
    try:
        response = { 
            "slave_1": processed_slave_data["slave_1"],
        }
        return jsonify(response), 200
    
    except Exception as e:
        logging.error(f"Erro ao consultar os dados dos Slaves: {e}")
        return jsonify({"error": "Erro ao acessar os dados dos Slaves"}), 500


@app.route('/slave2_data', methods=['GET'])
def get_slave2_data():
    try:
        response = { 
            "slave_2": processed_slave_data["slave_2"]
        }
        return jsonify(response), 200

    except Exception as e:
        logging.error(f"Erro ao consultar os dados dos Slaves: {e}")
        return jsonify({"error": "Erro ao acessar os dados dos Slaves"}), 500

# Inicializando as threads para os Slaves e para o processamento
slave1_thread = Thread(target=handle_slave, args=(5001, queque_slave1, "Slave_1"))
slave2_thread = Thread(target=handle_slave, args=(5002, queque_slave2, "Slave_2"))
http_server_thread = Thread(target=start_http_server)

# processor_thread = Thread(target=process_data)

# Iniciando as threads
slave1_thread.start()
slave2_thread.start()
http_server_thread.start()

# processor_thread.start()

# Aguardando o término das threads
slave1_thread.join()
slave2_thread.join()
http_server_thread.join()
# processor_thread.join()
