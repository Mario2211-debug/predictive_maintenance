import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.preprocessing import StandardScaler
import pickle

"Carregar os dados"
data = pd.read_csv("dados_csv.csv")
print("Dados carregados com sucesso!")
print(data)

"Seleção de features e variável alvo"
X = data[["Air_Temp", "Process_Temp", "Rotational_Speed", "Torque", "Tool_Life"]]
y = data["Failure"]

"Escalar os dados inválidos, (0 & NaN)"
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

"Divisão em conjunto de treinamento e teste"
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.3, random_state=42)

"Treinamento do modelo"
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

"Avaliação do modelo"
y_pred = model.predict(X_test)
print("Relatório de classificação:")
print(classification_report(y_test, y_pred))

"Salva o modelo e o scaler"
with open("failure_prediction_model.pkl", "wb") as file:
    pickle.dump({"model": model, "scaler": scaler}, file)

print("Modelo e scaler salvos com sucesso!")
