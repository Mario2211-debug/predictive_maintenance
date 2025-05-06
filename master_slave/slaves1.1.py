import socket
import time
import logging
import random
import ssl

context = ssl.create_default_context(ssl.Purpose.SERVER_AUTH, cafile='server.crt')
context.check_hostname = False
context.verify_mode = ssl.CERT_NONE

# Configuração do logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        #Escreve as mensagens dos logs nos ficheiros
        logging.FileHandler("slave1.log"),
        #Escreve as mensagens na linha de comando
        logging.StreamHandler()
    ]
)

def generate_random_data():
    """Gera dados aleatórios para os sensores."""
    identifier = random.randint(1, 500)
    category = random.choice(['L','M','H'])
    air_temp = round(random.uniform(290.0, 300.0), 1)
    process_temp = round(random.uniform(300.0, 310.0), 1)
    rotational_speed = random.randint(1500, 1800)
    torque = round(random.uniform(20.0, 40.0), 1)
    tool_life = random.randint(50, 100)
    failure = random.choice([0, 1])
    
# Definir as descrições de falha possíveis
    failure_descriptions = [
        "Normal_Operation",
        "Power_Supply_Issue",
        "Tool_Degradation",
        "Excessive_Load",
        "Unexpected_Failure",
        "Thermal_Failure"
    ]
    
    # Seleciona uma descrição de falha aleatória
    failure_description = random.choice(failure_descriptions)    
    return {
        "Identifier": identifier,
        "Category": category,
        "Air_Temp": air_temp,
        "Process_Temp": process_temp,
        "Rotational_Speed": rotational_speed,
        "Torque": torque,
        "Tool_Life": tool_life,
        "Failure": failure,
        "Failure_Description": failure_description
    }

# Função para gerar múltiplos dados aleatórios
def generate_multiple_data(num_rows=500):
    """Gera um número de dados aleatórios e os armazena em uma lista."""
    sensor_data = []
    for _ in range(num_rows):
        data = generate_random_data()
        sensor_data.append(data)
    return sensor_data




# CSV_FILE = "slave1_data.csv"

# # Função que recebe os dados do CSV
# def read_sensor_data():
#     """Lê os dados do arquivo CSV e retorna uma lista de linhas formatadas em JSON."""
#     sensor_data = []
#     data = pd.read_csv(CSV_FILE)
#     for index, row in data.iterrows():
#         try:
#             row_dict = {col: row[col] for col in row.index}
#             sensor_data.append(json.dumps(row_dict))
#         except ValueError as e:
#             logging.error(f"Erro ao processar linha {index}: {e}")
#     return sensor_data


def connect_to_server():
    """Tenta estabelecer uma nova conexão com o servidor."""
    try:
        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        secure_socket = context.wrap_socket(client, server_hostname="master")
        secure_socket.connect(("master", 5001))
        logging.info("Conectado ao servidor com sucesso.")
        return secure_socket
    except socket.error as e:
        logging.error(f"Erro ao tentar conectar ao servidor: {e}")
        return None


def send_data_to_master(sensor_data):
    """Envia dados do sensor ao Master com reconexão progressiva."""
    retry_delay = 1
    max_retries = 5
    client = None

    # Tenta conectar e manter a conexão aberta
    while not client:
        client = connect_to_server()
        if not client:
            time.sleep(retry_delay)
            # Aumentar o tempo de espera exponencialmente
            retry_delay *= 2  
            if retry_delay > 32:
                logging.error("Número máximo de tentativas para conectar atingido.")
                 # Saída do loop se não conseguir conectar
                return 

    # Envio de dados
    for data in sensor_data:
        retries = 0
        while retries < max_retries:
            try:
                logging.info(f"Enviando dados: {data}")
                # Enviando os dados
                client.send(data.encode())  
                 # Esperando resposta
                response = client.recv(1024).decode() 
                logging.info(f"Resposta do Master: {response}")
                # Se envio for bem-sucedido, sai do loop
                break  
            except socket.error as e:
                logging.error(f"Erro ao enviar dados: {e}")
                retries += 1
                time.sleep(retry_delay)
                # Aumentar o tempo de espera exponencialmente
                retry_delay *= 2  
                
        if retries == max_retries:
            logging.error("Número máximo de tentativas atingido. Pulando para o próximo dado.")
            continue
# Fecha a conexão após enviar todos os dados
    client.close()  


if __name__ == "__main__":
    while True:
        sensor_data = generate_multiple_data()
        # sensor_data = read_sensor_data()
        send_data_to_master(sensor_data)
        time.sleep(15)
