'use client';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Ticks } from 'chart.js';
import { format } from 'date-fns';
import LogsTable from '@/components/LogsTable';
import ModalLogs from '@/components/ModalLogs';
import { sendTelegramAlert } from '@/utils/sendTelegramAlert';
import Slaves from '@/components/Slaves';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type SlaveRawData = {
  Air_Temp: number;
  Category: string;
  Failure: number;
  Failure_Description: string;
  Identifier: number;
  Process_Temp: number;
  Rotational_Speed: number;
  Tool_Life: number;
  Torque: number;
  prediction: number
};

type SlaveData = {
  alert: string;
  prediction: number;
  raw_data: SlaveRawData | null;
};

type ApiResponse = {
  slave_1: SlaveData | null;
  slave_2: SlaveData | null;
};

type FailureLog = {
  identifier: number;
  prediction: number;
  slave: string;
  time: string;
  failure: number;
  description: string;
  rawData: SlaveRawData | null;
};

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState('Normal');
  const [modalData, setModalData] = useState<SlaveRawData | null>(null);
  const [selectedSlave, setSelectedSlave] = useState<string>('All');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [failures, setFailures] = useState<FailureLog[]>([]);


  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response1 = await axios.get<ApiResponse>('http://localhost:8080/slave1_data');
        const response2 = await axios.get<ApiResponse>('http://localhost:8080/slave2_data');

        const fetchedData1 = response1.data;
        const fetchedData2 = response2.data;

        const logs: FailureLog[] = [];
        const now = new Date();

        // Processa dados do Slave 1
        if (fetchedData1.slave_1?.raw_data != null) {
          const rawData = fetchedData1.slave_1.raw_data;
          logs.push({
            identifier: rawData.Identifier,
            prediction: rawData.prediction,
            slave: 'Slave 1',
            time: format(now, 'dd-MM-yy:HH:mm:ss'),
            failure: rawData.Failure,
            description: rawData.Failure_Description,
            rawData: rawData
          });

          // Verifica condições de alerta
          if (rawData.Failure === 1 && rawData.prediction === 1) {
            await sendTelegramAlert(`🚨 URGENTE: Slave 1 detectou falha crítica:\n''\n**Descrição da falha**: ${rawData.Failure_Description}. \nIdentificador: ${rawData.Identifier}`);
          } else if (rawData.Failure === 1) {
            await sendTelegramAlert(`⚠️ ALERTA: Slave 1 detectou uma falha: \n''\n**Descrição da falha**: ${rawData.Failure_Description}. \nIdentificador: ${rawData.Identifier}.`);
          } else if (rawData.prediction === 1) {
            await sendTelegramAlert(`🟡 PREVISÃO: Slave 1 detecta possível falha.`);
          }
        }

        // Processa dados do Slave 2
        if (fetchedData2.slave_2?.raw_data != null) {
          const rawData = fetchedData2.slave_2.raw_data;
          logs.push({
            identifier: rawData.Identifier,
            prediction: rawData.prediction,
            slave: 'Slave 2',
            time: format(now, 'dd-MM-yy:HH:mm:ss'),
            failure: rawData.Failure,
            description: rawData.Failure_Description,
            rawData: rawData
          });

          // Verifica condições de alerta
          if (rawData.Failure === 1 && rawData.prediction === 1) {
            await sendTelegramAlert(`🚨 *URGENTE*: **Slave** 2 detectou falha crítica: \n''\n**Descrição da falha**: ${rawData.Failure_Description}. \nIdentificador: ${rawData.Identifier}`);
          } else if (rawData.Failure === 1) {
            await sendTelegramAlert(`⚠️ ALERTA: Slave 2 detectou uma falha: \n''\n**Descrição da falha**: ${rawData.Failure_Description}. \nIdentificador: ${rawData.Identifier}`);
          } else if (rawData.prediction === 1) {
            await sendTelegramAlert(`🟡 PREVISÃO: Slave 2 detecta possível falha.`);
          }
        }

        // Atualiza os estasdos
        if (isMounted) {
          setData({ slave_1: fetchedData1.slave_1, slave_2: fetchedData2.slave_2 });
          setFailures((prev) => [...prev, ...logs]);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
      finally {
        if (isMounted) setTimeout(fetchData, 1000); 
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);
  const filteredFailures = failures


  // Filtra os dados de acordo com a aba selecionada
  const getFilteredFailures = () => {
    if (selectedTab === 'Normal') {
      return failures;
    }
    if (selectedTab === 'Predictive') {
      return failures.filter(failure => failure.prediction === 1);
    }
    return failures;
  };

  // Função para exibir os dados do modal ao clicar em uma célula
  const handleCellClick = (failure: FailureLog) => {
    setModalData(failure.rawData); 
  };


  // Ordenar erros com base no identificador
  const sortedFailures = getFilteredFailures().sort((a, b) => a.identifier - b.identifier);


  return (
    <>

      <DashboardLayout>
        <div>
          <Slaves
            slave1={data?.slave_1?.raw_data}
            slave2={data?.slave_2?.raw_data}
            selectedSlave={selectedSlave}
            setSelectedSlave={setSelectedSlave}
          />

          <h2 className="text-2xl font-bold mb-4">Log de Falhas</h2>
          <LogsTable
            filteredFailures={failures}
            handleCellClick={(failure: FailureLog) => handleCellClick(failure)}
            selectedSlave={selectedSlave}
            selectedTab={selectedTab}
            setSelected={setSelectedTab}
            sortedFailures={sortedFailures}
          />
          {modalData && (
            <ModalLogs handleModal={() => setModalData(null)} modalData={modalData} />
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
