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

interface ModalProps {
    handleModal: () => void;
    modalData: SlaveRawData;
}

export default function Modal(props: ModalProps) {
    const failureDescriptions: { [key: string]: string } = {
        Normal_Operation: "Operação normal (nenhuma falha ocorreu).",
        Power_Supply_Issue: "Falha devido a problemas na potência fornecida.",
        Tool_Degradation: "Falha causada pelo desgaste excessivo da ferramenta.",
        Excessive_Load: "Falha causada por sobrecarga no sistema.",
        Unexpected_Failure: "Falhas aleatórias e imprevisíveis.",
        Thermal_Failure: "Falha devido a dissipação térmica insuficiente.",
    };
    const failureKey = props.modalData.Failure_Description;


    return (
        <>
            {/* Modal para mostrar os dados completos */}
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white text-neutral-900 p-6 rounded-lg w-full max-w-lg">
                    <h2 className="text-2xl font-semibold mb-4">Detalhes da Falha (Identifier: {props.modalData.Identifier})</h2>
                    <p><strong>Temperatura do Ar:</strong> {props.modalData.Air_Temp}°C</p>
                    <p><strong>Categoria:</strong> {props.modalData.Category}</p>
                    <p><strong>Falha:</strong> {props.modalData.Failure}</p>
                    <p><strong>Descrição da Falha:</strong> {failureDescriptions[props.modalData.Failure_Description] || "Descrição não disponível."}</p>
                    <p><strong>Temperatura do Processo:</strong> {props.modalData.Process_Temp}°C</p>
                    <p><strong>Velocidade Rotacional:</strong> {props.modalData.Rotational_Speed} rpm</p>
                    <p><strong>Vida Útil da Ferramenta:</strong> {props.modalData.Tool_Life} horas</p>
                    <p><strong>Torque:</strong> {props.modalData.Torque} Nm</p>
                    <button
                        onClick={props.handleModal}
                        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </>
    )
}