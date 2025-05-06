import { FaRobot } from "react-icons/fa";
import { BsThermometerHalf, BsSpeedometer2 } from "react-icons/bs";
import { GiGears, GiSandsOfTime } from "react-icons/gi";
import { MdCategory } from "react-icons/md";

interface SlavesProps {
    slave1: any;
    slave2: any;
    selectedSlave: string;
    setSelectedSlave: React.Dispatch<React.SetStateAction<string>>;
}

export default function Slaves({ slave1, slave2, selectedSlave, setSelectedSlave }: SlavesProps) {
    // Função para determinar o estado de comunicação
    const getCommunicationStatus = (failure: number) => {
        if (failure > 0) {
            return "alert"; // Falha, comunicação inativa
        }
        return "active"; // Comunicação ativa
    };

    const renderMachineCard = (slave: any, machineName: string) => {
        return (
            <div className="p-6 flex flex-col gap-6 w-full bg-gray-800 text-white border border-gray-700 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4">
                    <FaRobot className="text-blue-500 text-3xl" />
                    <h1 className="text-2xl font-bold">{machineName}</h1>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <MdCategory className="text-purple-400 text-xl" />
                        <p>
                            <strong>Categoria:</strong> {slave?.Category}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <BsThermometerHalf className="text-red-400 text-xl" />
                        <p>
                            <strong>Temp. Ar:</strong> {slave?.Air_Temp} °C
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <BsThermometerHalf className="text-orange-400 text-xl" />
                        <p>
                            <strong>Temp. Processo:</strong> {slave?.Process_Temp} °C
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <BsSpeedometer2 className="text-green-400 text-xl" />
                        <p>
                            <strong>Vel. Rotacional:</strong> {slave?.Rotational_Speed} RPM
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <GiGears className="text-yellow-400 text-xl" />
                        <p>
                            <strong>Torque:</strong> {slave?.Torque} Nm
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <GiSandsOfTime className="text-blue-400 text-xl" />
                        <p>
                            <strong>Vida útil:</strong> {slave?.Tool_Life} horas
                        </p>
                    </div>
                </div>
                <div
                    className={`w-6 h-6 rounded-full ${getCommunicationStatus(slave?.Failure) === "alert" ? "bg-red-500" : "bg-green-500"
                        } self-end`}
                />
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 p-8 bg-gray-900">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white"> {selectedSlave === 'All' ? 'Geral' : selectedSlave}</h2>
                <select
                    value={selectedSlave}
                    onChange={(e) => setSelectedSlave(e.target.value)}
                    className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                >
                    <option value="All">Todas as Máquinas</option>
                    <option value="Slave 1">Máquina 1</option>
                    <option value="Slave 2">Máquina 2</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {selectedSlave === "All" || selectedSlave === "Slave 1"
                    ? renderMachineCard(slave1, "Máquina 1")
                    : null}
                {selectedSlave === "All" || selectedSlave === "Slave 2"
                    ? renderMachineCard(slave2, "Máquina 2")
                    : null}
            </div>
        </div>
    );
}
