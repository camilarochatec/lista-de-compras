import { useNavigate } from 'react-router';
import { FiEdit } from "react-icons/fi";
import { IoTrashBinOutline } from "react-icons/io5";

//temos 3 props do componente home: lista (objeto), onExcluir (função), onEditar (função). essa função é chamada quando o usuário clica no botão de editar. a logica dessa função está no contexto do ListasContext.jsx
const CardLista = ({ lista, onExcluir, onEditar }) => {

    //redirecionar para a página da lista. hook do react-router, é o gps do app.
    const navigate = useNavigate();

    //função para visualizar. redireciona para a página da lista específica.
    const visualizarLista = () => {
        navigate(`/lista/${lista.id}`); //no componente path.jsx, a rota da lista é /lista/:id e isso leva ao componente Lista.jsx
    };

    //o eprop é o evento do clique. o stopPropagation impede que o clique no botão de excluir ou editar dispare o clique no card inteiro (que redireciona para a lista)

    const botaoExcluir = (e) => {
        e.stopPropagation();
        if (window.confirm(`Tem certeza que deseja excluir a lista "${lista.nome}"?`)) {
            onExcluir(lista.id);
        }
    };

    const botaoEditar = (e) => {
        e.stopPropagation();

        //abre um campo prompt para o usuário digitar o novo nome da lista
        const novoNome = window.prompt("Qual o novo nome da lista?", lista.nome);

        //o trim é uma função que remove os espaços em branco do início e do fim da string
        if (novoNome && novoNome.trim() !== "" && novoNome.trim() !== lista.nome) {
            onEditar(lista.id, { nome: novoNome.trim() });
        } else if (novoNome === null) {
            alert("O nome não pode ficar vazio.");
        } else if (novoNome.trim() === "") {
            alert("O nome não pode ficar vazio.");
        }
    };

    return (
        <div
            onClick={visualizarLista}
            className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between border border-gray-200 transition-all hover:shadow-lg hover:border-amber-400"
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