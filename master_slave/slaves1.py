import socket
import time
import logging
import pandas as pd
import json

# Configuração do logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        # Escreve as mensagens no arquivo de log
        logging.FileHandler("/home/mario/Python/Mestrado/projeto_monitor/backend/logs/slave1_logs.log"),
        # Escreve as mensagens na linha de comando  
        logging.StreamHandler()  
    ]
)

CSV_FILE = "slave1_data.csv"

def read_sensor_data():
    """Lê os dados do arquivo CSV e retorna uma lista de linhas formatadas em JSON."""
    sensor_data = []
    data = pd.read_csv(CSV_FILE)
    for index, row in data.iterrows():
        try:
            row_dict = {col: row[col] for col in row.index}
            sensor_data.append(json.dumps(row_dict))
        except ValueError as e:
            logging.error(f"Erro ao processar linha {index}: {e}")
    return sensor_data


def connect_to_server():
    """Tentativa de estabelecer uma nova conexão com o servidor."""
    try:
        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        # Configura um timeout para evitar esperas indefinidas
        # client.settimeout(10)  
        client.connect(("127.0.0.1", 5001))
        logging.info("Conectado ao servidor com sucesso.")
        return client
    except socket.error as e:
        logging.error(f"Erro ao tentar conectar ao servidor: {e}")
        return None


def send_data_to_master(sensor_data):
    """Envia dados do sensor ao Master com reconexão progressiva."""
    # Tempo inicial entre as tentativas
    retry_delay = 1
     # Número máximo de tentativas  
    max_retries = 5 

    for data in sensor_data:
        retries = 0
        while retries < max_retries:
            client = connect_to_server()
            if client:
                try:
                    time.sleep(1)
                    logging.info(f"Enviando dados: {data}\n")
                    # Enviando os dados
                    client.send(data.encode())  
                     # Aguarda resposta
                    response = client.recv(1024).decode() 
                    logging.info(f"Resposta do Master: {response}\n")
                    client.close()
                    # Resetar o tempo de espera ao sucesso
                    retry_delay = 1  
                    break
                except socket.error as e:
                    logging.error(f"Erro ao enviar dados: {e}")
                    retries += 1
                    time.sleep(retry_delay)
                    # Aumentar o tempo de espera exponencialmente
                    retry_delay *= 2  
            else:
                retries += 1
                time.sleep(retry_delay)
                retry_delay *= 2

        if retries == max_retries:
            logging.error(f"Falha ao enviar dados após {max_retries} tentativas.")
             # Continua com o próximo dado
            continue 


if __name__ == "__main__":
    while True:
        sensor_data = read_sensor_data()
        send_data_to_master(sensor_data)
