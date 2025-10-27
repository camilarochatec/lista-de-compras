import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { IoArrowBack, IoTrashBinOutline, IoAddCircleOutline, IoSearchOutline } from 'react-icons/io5';
import { BiPlus, BiMinus } from 'react-icons/bi';
import { useListas } from '../context/ListasContext';

const Lista = () => {
    // Pegar os produtos e a função de adicionar global
    const { 
        todasAsListas, 
        atualizarItensDaLista,
        produtosCadastrados, 
        adicionarNovoProdutoGlobal 
    } = useListas();

    const navigate = useNavigate();
    const { id } = useParams();

    const listaAtual = todasAsListas.find(l => l.id.toString() === id);

    // Estado para os itens da lista local
    const [itens, setItens] = useState([]);
    
    // Estado para o campo de busca
    const [campoDeBusca, setCampoDeBusca] = useState('');

    // Efeito para carregar os itens da lista atual
    useEffect(() => {
        if (listaAtual) {
            // Garante que a flag 'comprado' exista em todos os itens. eu não entendo como funciona a desestruturação aqui. ...
            const itensComprados = listaAtual.itens.map(item => ({
                ...item,
                comprado: item.comprado || false
            }));
            setItens(itensComprados);
        }
    }, [listaAtual]); // Roda sempre que a 'listaAtual' for encontrada/mudar

    // Função central para salvar mudanças na API
    const salvarAlteracoes = (novosItens) => {
        setItens(novosItens); // Atualiza o estado local
        atualizarItensDaLista(listaAtual.id, novosItens); // Envia para o contexto/API
    };

    // --- Funções de manipulação de itens (checkbox, quantidade, remover) ---

    const handleToggleComprado = (itemId) => { 
        const novosItens = itens.map(item =>
            item.id === itemId ? { ...item, comprado: !item.comprado } : item
        );
        salvarAlteracoes(novosItens);
    };

    const handleQuantidade = (itemId, quantia) => { 
        const novosItens = itens.map(item =>
            item.id === itemId ? { ...item, quantidade: Math.max(1, item.quantidade + quantia) } : item
        );
        salvarAlteracoes(novosItens);
    };

    const handleRemoverItem = (itemId) => { 
        if (window.confirm("Remover este item?")) {
            const novosItens = itens.filter(item => item.id !== itemId);
            salvarAlteracoes(novosItens);
        }
    };

    // --- Lógica de Busca e Adição de Produtos ---

    // 'pesquisar' filtra os produtos da API conforme o usuário digita
    const pesquisar = useMemo(() => {
        if (!campoDeBusca) return [];
        return produtosCadastrados.filter(p =>
            p.name.toLowerCase().includes(campoDeBusca.toLowerCase())
        );
    }, [campoDeBusca, produtosCadastrados]);

    // Função "segura" para adicionar o item na lista local
    // Retorna 'true' se adicionou, 'false' se o item já existia
    const addProdutoNaListaLocal = (produto) => {
        if (itens.some(item => item.id === produto.id)) {
            alert("Esse item já está na lista!");
            return false; 
        }

        const novoItem = {
            id: produto.id, // Usa o ID vindo da API
            name: produto.name,
            quantidade: 1,
            comprado: false
        };

        const novosItens = [...itens, novoItem];
        salvarAlteracoes(novosItens);
        return true; 
    };

    // Função para o clique em um produto EXISTENTE no dropdown
    const handleSelecionarProdutoExistente = (produto) => {
        if (addProdutoNaListaLocal(produto)) {
            setCampoDeBusca(''); // Limpa a busca
        }
    };

    // Função para CRIAR um produto novo (no dropdown ou via 'Enter')
    const handleCriarNovoProduto = async () => {
        if (!campoDeBusca.trim()) return;

        const nomeBusca = campoDeBusca.toLowerCase();
        let produtoParaAdicionar;

        // Verifica se já existe na API
        const produtoExistente = produtosCadastrados.find(p => p.name.toLowerCase() === nomeBusca);

        if (produtoExistente) {
            produtoParaAdicionar = produtoExistente;
        } else {
            // Se não existe, cria na API
            const novoProdutoGlobal = await adicionarNovoProdutoGlobal(campoDeBusca);
            if (!novoProdutoGlobal) {
                alert("Erro ao salvar novo produto!");
                return;
            }
            produtoParaAdicionar = novoProdutoGlobal;
        }

        // Adiciona na lista local e limpa a busca
        if (addProdutoNaListaLocal(produtoParaAdicionar)) {
            setCampoDeBusca(''); 
        }
    };


    // --- Renderização ---

    // Se a URL for inválida ou os dados ainda não carregaram
    if (!listaAtual) {
        return (
            <div className="p-4 text-center">
                <h1 className="text-xl text-red-500">Lista não encontrada.</h1>
                <button onClick={() => navigate('/')} className="text-blue-500 mt-4">Voltar para Home</button>
            </div>
        );
    }

    // Separa os itens para renderizar em listas diferentes
    const itensParaComprar = itens.filter(item => !item.comprado);
    const itensComprados = itens.filter(item => item.comprado);

    return (
        <div className="bg-amber-100 min-h-screen">
            {/* Header da Página */}
            <header className="bg-amber-200 p-4 flex items-center shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="text-gray-800 mr-4">
                    <IoArrowBack size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-800 truncate">{listaAtual.nome}</h1>
            </header>

            <main className="p-4 sm:p-6">
                
                {/* 1. SEÇÃO DE BUSCA E ADIÇÃO (AGORA COM DROPDOWN) */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-bold text-gray-700 mb-3">Adicionar Itens</h2>
                    <form 
                        onSubmit={(e) => { 
                            e.preventDefault(); 
                            handleCriarNovoProduto(); 
                        }} 
                        className="relative"
                    >
                        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={campoDeBusca}
                            onChange={(e) => setCampoDeBusca(e.target.value)}
                            placeholder="Buscar produto ou criar um novo..."
                            className="w-full p-3 pl-10 bg-gray-100 rounded-lg border focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button 
                            type="submit" 
                            className="absolute right-1 top-1/2 -translate-y-1/2 bg-amber-400 text-amber-900 p-2 rounded-lg hover:bg-amber-500 transition-colors"
                            aria-label="Adicionar item"
                        >
                            <BiPlus size={24} />
                        </button>
                    </form>

                    {/* Dropdown de Busca (igual ao do Cadastro.jsx) */}
                    {campoDeBusca && (
                        <div className="mt-2 border rounded-lg bg-white max-h-48 overflow-y-auto shadow-lg z-10 relative">
                            <div 
                                onClick={handleCriarNovoProduto} 
                                className="flex justify-between items-center p-3 hover:bg-amber-50 cursor-pointer text-amber-600 font-bold"
                            >
                                <span>Criar novo produto: "{campoDeBusca}"</span>
                                <IoAddCircleOutline size={24} />
                            </div>
                            
                            {pesquisar.map(produto => (
                                <div 
                                    key={produto.id} 
                                    onClick={() => handleSelecionarProdutoExistente(produto)} 
                                    className="flex justify-between items-center p-3 hover:bg-amber-50 cursor-pointer border-b"
                                >
                                    <span>{produto.name}</span>
                                    <IoAddCircleOutline className="text-green-500" size={24} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                {/* 2. LISTA DE ITENS PARA COMPRAR */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <h2 className="text-lg font-bold text-gray-700 mb-3">Itens ({itensParaComprar.length})</h2>
                    {itensParaComprar.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Nenhum item para comprar.</p>
                    ) : (
                        <ul className="space-y-3">
                            {itensParaComprar.map(item => (
                                <li key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="checkbox" 
                                            checked={item.comprado}
                                            onChange={() => handleToggleComprado(item.id)}
                                            className="h-6 w-6 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                                        />
                                        <span className="font-semibold text-gray-800">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleQuantidade(item.id, -1)} className="bg-amber-300 p-1 rounded-full text-amber-800"><BiMinus size={20} /></button>
                                        <span className="w-8 text-center font-bold">{item.quantidade}</span>
                                        <button onClick={() => handleQuantidade(item.id, 1)} className="bg-amber-300 p-1 rounded-full text-amber-800"><BiPlus size={20} /></button>
                                        <button onClick={() => handleRemoverItem(item.id)} className="ml-2 text-red-500 hover:text-red-700"><IoTrashBinOutline size={20} /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* 3. LISTA DE ITENS COMPRADOS */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-bold text-gray-700 mb-3">Comprados ({itensComprados.length})</h2>
                    {itensComprados.length === 0 ? (
                         <p className="text-gray-500 text-center py-4">Nenhum item comprado ainda.</p>
                    ) : (
                        <ul className="space-y-3">
                             {itensComprados.map(item => (
                                <li key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg opacity-70">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="checkbox" 
                                            checked={item.comprado}
                                            onChange={() => handleToggleComprado(item.id)}
                                            className="h-6 w-6 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                                        />
                                        <span className="font-semibold text-gray-500 line-through">{item.name}</span>
                                    </div>
                                    <button onClick={() => handleRemoverItem(item.id)} className="ml-2 text-red-500 hover:text-red-700"><IoTrashBinOutline size={20} /></button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </main>
        </div>
    );
}

export default Lista;

