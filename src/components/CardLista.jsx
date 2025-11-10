import { useNavigate } from 'react-router';
import { FiEdit } from "react-icons/fi";
import { IoTrashBinOutline } from "react-icons/io5";
import { useListas } from '../context/ListasContext'; // <--- Importamos o hook do contexto

// A URL da API
const API_URL = "http://localhost:3001";

     //a prop lista vem do map que fazemos na Home.jsx
const CardLista = ({ lista }) => {

    // Usamos o 'state' do navigate para "enviar" o objeto da lista, ao clicar no card, será possível acessar esse objeto.
    const visualizarLista = () => {
        navigate(`/lista/${lista.id}`, { state: lista });
    };

    const navigate = useNavigate();

    // Pegamos a função 'set' do contexto. o contexto está recebendo da api os dados das listas.
    const { setTodasAsListas } = useListas();

    // Lógica de 'Excluir'
    const botaoExcluir = (e) => {
        e.stopPropagation();
        if (window.confirm(`Tem certeza que deseja excluir a lista "${lista.nome}"?`)) {

            fetch(`${API_URL}/listas/${lista.id}`, { method: 'DELETE' })
                .then(res => {
                    if (!res.ok) throw new Error("Falha ao excluir");

                    // Se deu certo na API, atualizamos o estado GLOBAL
                    setTodasAsListas(prevListas =>
                        prevListas.filter(l => l.id !== lista.id)
                    );
                })
                .catch(error => {
                    console.error("Falha ao excluir lista:", error);
                    alert("Não foi possível excluir a lista.");
                });
        }
    };

    // Lógica de 'Editar'
    const botaoEditar = (e) => {
        e.stopPropagation();
        const novoNome = window.prompt("Qual o novo nome da lista?", lista.nome);

        if (novoNome && novoNome.trim() !== "" && novoNome.trim() !== lista.nome) {

            // Prepara o body para a API
            // (Importante: tem que enviar o objeto COMPLETO, pois o PUT substitui)
            const bodyAtualizado = { ...lista, nome: novoNome.trim() };

            fetch(`${API_URL}/listas/${lista.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyAtualizado),
            })
                .then(res => res.json())
                .then(data => {
                    // Se deu certo na API (retornou a 'data' atualizada),
                    // atualizamos o estado GLOBAL
                    setTodasAsListas(prevListas =>
                        prevListas.map(l => (l.id === lista.id ? data : l))
                    );
                })
                .catch(error => {
                    console.error("Falha ao editar lista:", error);
                    alert("Não foi possível editar o nome da lista.");
                });

        } else if (novoNome !== null) { // Evita alerta se o usuário só clicou "cancelar"
            alert("O nome não pode ficar vazio ou ser igual ao antigo.");
        }
    };



    return (
        <div
            onClick={visualizarLista}
            className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between border border-gray-200 transition-all hover:shadow-lg hover:border-amber-400 cursor-pointer"
        >
            <h2 className="text-lg font-bold text-gray-800 truncate">{lista.nome}</h2>
            <div className="flex items-center space-x-3">
                <button onClick={botaoEditar} className="text-gray-500 hover:text-blue-500">
                    <FiEdit size={20} />
                </button>
                <button onClick={botaoExcluir} className="text-gray-500 hover:text-red-500">
                    <IoTrashBinOutline size={22} />
                </button>
            </div>
        </div>
    );
}

export default CardLista;