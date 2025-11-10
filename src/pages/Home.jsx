//ele exibe a lista de listas criadas pelo usuário
import { useNavigate } from 'react-router';
import CardLista from '../components/CardLista'; 
import { BiPlus } from 'react-icons/bi';
import { BsBagX } from "react-icons/bs";
//para se conectar ao contexto
import { useListas } from '../context/ListasContext';

const Home = () => {
    // a lógica está no contexto!
    const { todasAsListas, excluirLista, editarLista } = useListas();

    const navigate = useNavigate();

    // "atalho" para a página de cadastro de uma lista
    const handleCriarLista = () => {
        navigate('/cadastro');
        //navega para a página de cadastro. no path.jsx está a rota que leva para o componente Cadastro.jsx
    };

    //terá 2 retornos: um para quando não há listas e outro para quando há listas
    if (todasAsListas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-80px)] p-6 bg-amber-100">
                <BsBagX className="text-amber-400/80 mb-6" size={120} />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Nenhuma lista por aqui</h2>
                <p className="text-gray-500 mb-8 max-w-xs">Crie sua primeira lista de compras.</p>
                <button onClick={handleCriarLista} className="flex items-center justify-center bg-amber-400 text-amber-900 font-bold py-3 px-8 rounded-full shadow-md hover:bg-amber-500 transition-colors">
                    <BiPlus size={24} className="mr-2" />
                    Criar Nova Lista
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 bg-amber-100 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Minhas Listas</h1>
                <button onClick={handleCriarLista} className="flex items-center justify-center bg-amber-400 text-amber-900 font-bold py-2 px-4 rounded-full shadow-md hover:bg-amber-500 transition-colors">
                    <BiPlus size={22} />
                </button>
            </div>
            <div className="space-y-3">
                {/* Renderiza cada lista usando o componente CardLista. como é um array, usamos map */}
                {todasAsListas.map((lista) => (
                    <CardLista 
                        key={lista.id} 
                        lista={lista} 
                        onExcluir={excluirLista} 
                        onEditar={editarLista} 
                    />
                ))}
            </div>
        </div>
    );
}

export default Home;