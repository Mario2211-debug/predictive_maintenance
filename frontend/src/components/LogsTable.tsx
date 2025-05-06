import React from "react";

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
};

interface Failure {
  identifier: number;
  slave: string;
  time: string;
  description: string;
  failure: number;
  prediction: number;
  rawData: SlaveRawData | null;
}

interface Log {
  selectedTab: string;
  setSelected: (value: string) => void;
  handleCellClick: (failure: Failure) => void;
  filteredFailures: Failure[];
  sortedFailures: Failure[];
  selectedSlave: string;
}

const SlaveStatusIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <span
      className={`inline-block w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}
      title={isActive ? 'Comunicação Ativa' : 'Sem Comunicação'}
    />
  );
};

export default function LogsTable(props: Log) {
  const { filteredFailures, sortedFailures, selectedSlave, handleCellClick } = props;

  if (filteredFailures.length === 0) return <p>Nenhuma falha registrada.</p>;

  return (
    <div className='grid'>
      <div className="gap-6 border border-1 border-neutral-600 p-2">
        <button
          className={props.selectedTab === 'Normal' ? 'tab-active bg-slate-300 p-2 text-neutral-950' : 'tab p-2 border border-1 border-neutral-600'}
          onClick={() => props.setSelected('Normal')}
        >
          Tabela Normal
        </button>
        <button
          className={props.selectedTab === 'Predictive' ? 'tab-active bg-slate-300 p-2 text-neutral-950' : 'tab p-2 border border-1 border-neutral-600'}
          onClick={() => props.setSelected('Predictive')}
        >
          Tabela Preditiva
        </button>
      </div>

      {/* Tabela de falhas */}
      <table border={1} style={{ padding: '4px', marginTop: '20px', width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Identifier</th>
            <th>Slave</th>
            <th>Time</th>
            <th>Description</th>
            <th>Prediction</th>
          </tr>
        </thead>
        <tbody>
          {sortedFailures.map((log, index) => (
            <tr key={index} className='p-2' onClick={() => handleCellClick(log)}>
              {selectedSlave === 'All' || log.slave === selectedSlave ? (
                <>
                  <td className={`${log.prediction === 1 ? 'bg-yellow-400' : ''}`}>
                    {log.identifier}
                  </td>
                  <td className={`${log.prediction === 1 ? 'bg-yellow-400' : ''}`}>
                    {log.slave}
                  </td>
                  <td className={`${log.prediction === 1 ? 'bg-yellow-400' : ''}`}>
                    {log.time}
                  </td>
                  <td className={`${log.prediction === 1 ? 'bg-yellow-400' : ''}`}>
                    {log.description}
                  </td>
                  <td className={`${log.prediction === 1 ? 'bg-yellow-400' : ''}`}>
                    {log.prediction === 1 ? 'Sim' : 'Não'}
                  </td>
                </>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
