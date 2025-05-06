### Sistema de Manutenção Preditiva

## Visão Geral

- Este projeto implementa um sistema de manutenção preditiva, projetado para monitorar equipamentos industriais e prever possíveis falhas utilizando dados de sensores. 
O sistema é composto por um servidor mestre, nós escravos, um modelo de aprendizado de máquina para previsão de falhas e um painel web para monitoramento em tempo real e alertas.
Estrutura do Projeto

## Backend:

- **master.py**: Servidor central que recebe dados dos nós escravos, processa-os utilizando um modelo de aprendizado de máquina e fornece dados ao frontend via API Flask.
- **slaves1.py** e slaves2.py: Nós escravos que leem dados de sensores de arquivos CSV e os enviam ao servidor mestre via sockets TCP.
- **slaves1.1.py**: Implementação alternativa de um nó escravo que gera dados aleatórios de sensores e utiliza SSL para comunicação segura.
- **train_model.py**: Script para treinar um modelo RandomForestClassifier e salvá-lo junto com um StandardScaler para pré-processamento de dados.

## Frontend:

- **page.tsx**: Painel baseado em React com Next.js, exibindo dados de sensores em tempo real, previsões de falhas e logs. Inclui visualizações e alertas via Telegram para eventos críticos.

## Dados:

- **slave1_data.csv e slave2_data.csv**: Arquivos CSV de entrada contendo dados de sensores para os nós escravos.
- **failure_prediction_model.pkl**: Modelo de aprendizado de máquina e scaler salvos para previsão de falhas.

## Logs:

- Arquivos de log gerados pelo mestre e pelos nós escravos para depuração e monitoramento.


### Funcionalidades

- **Coleta de Dados**: Nós escravos coletam dados de sensores (ex.: temperatura do ar, temperatura do processo, velocidade de rotação, torque, vida útil da ferramenta) de arquivos CSV ou geram dados aleatórios.
- Previsão de Falhas: Um modelo RandomForestClassifier prevê falhas de equipamentos com base em dados escalonados.
- Monitoramento em Tempo Real: O servidor mestre baseado em Flask processa dados e os disponibiliza via endpoints de API (/slave1_data, /slave2_data).
- Painel Web: Um frontend em Next.js exibe dados de sensores, logs de falhas e previsões, com opções de filtragem e um modal para inspeção detalhada de dados.
- Alertas: Notificações via Telegram são enviadas para falhas detectadas ou problemas previstos.
- Comunicação Segura: Suporte opcional a SSL para comunicação entre escravo e mestre (em slaves1.1.py).
- Logging: Registro abrangente para os nós mestre e escravos para rastrear comportamento e erros do sistema.

### Pré-requisitos

**Python 3.8+**:

Instale os pacotes necessários: pip install pandas numpy scikit-learn flask flask-cors pickle


### Node.js 18+ (para o frontend):

- **Instale as dependências**: `npm install axios chart.js date-fns`


## Arquivos CSV:

- Certifique-se de que slave1_data.csv e slave2_data.csv estejam disponíveis com as colunas: Identifier, Category, Air_Temp, Process_Temp, Rotational_Speed, Torque, Tool_Life, Failure, Failure_Description.


## Bot do Telegram (opcional):

- Configure um bot do Telegram e ajuste a função sendTelegramAlert em page.tsx para alertas.

## Certificados SSL (opcional):

- Para slaves1.1.py, forneça server.crt para adicionar a camada de segurança na comunicação.

## Configuração e Instalação

**Clonar o Repositório**:
```bash
git clone <url-do-repositório>
cd <diretório-do-repositório>
```

## Configuração do Backend:

**Instale as dependências do Python**:

```bash
pip install -r requirements.txt
```

- **Treine o modelo (se ainda não treinado)**:
```bash
python train_model.py
```

- **Inicie o servidor mestre**:
```bash
python master.py
```

- **Execute os nós escravos**:
```bash
python slaves1.py
python slaves2.py
```

**Alternativamente, use slaves1.1.py para SSL**:
```bash
python slaves1.1.py
```

## Configuração do Frontend:

**Navegue até o diretório do frontend**:
```bash
cd <diretório-do-frontend>
```

**Instale as dependências do Node.js**:

```bash
npm install
```

**Inicie o servidor de desenvolvimento do Next.js**:
```bash
npm run dev
```


**Acesse o Painel**:

- Abra `http://localhost:3000` em um navegador para visualizar o painel.

# Uso

- Nós Escravos: Enviem continuamente dados de sensores ao servidor mestre nas portas 5001 (Slave 1) e 5002 (Slave 2).
- Servidor Mestre: Escuta dados recebidos, processa-os com o modelo treinado e atualiza os endpoints da API.
**Painel**:
- Visualize dados de sensores e previsões de falhas em tempo real.
- Filtre logs por status (Normal, Preditivo) ou nó escravo.
- Clique em uma entrada de log para ver dados detalhados em um modal.
- Receba alertas via Telegram para falhas críticas ou previsões.


## Observações

- Certifique-se de que o servidor mestre esteja em execução antes de iniciar os nós escravos.
- O sistema assume que os arquivos CSV estão formatados corretamente e disponíveis.
- Para produção, configure as origens CORS em master.py e proteja a API Flask.
- A implementação SSL em slaves1.1.py requer um certificado válido e configuração adequada de hostname.

## Melhorias Futuras

- Adicionar suporte para mais nós escravos.
- Implementar um banco de dados para armazenamento persistente de logs.
- Aprimorar o painel com visualizações adicionais (ex.: gráficos de séries temporais).
- Melhorar o tratamento de erros e mecanismos de retentativa para problemas de rede.
- Implantar o sistema usando Docker para maior escalabilidade.

## Licença
- Este projeto está licenciado sob a Licença MIT. Consulte o arquivo LICENSE para mais detalhes.
