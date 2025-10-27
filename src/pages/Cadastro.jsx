//tipo um formulário para cadastrar nova lista de compras
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { IoArrowBack, IoAddCircleOutline, IoSearchOutline, IoTrashBinOutline } from 'react-icons/io5';
import { BiPlus, BiMinus } from 'react-icons/bi';
import { useListas } from '../context/ListasContext';

const Cadastro = () => {
    //  Pegamos os produtos e funções da API (do Contexto). são funções globais.
    const { adicionarNovaLista, produtosCadastrados, adicionarNovoProdutoGlobal } = useListas();

    //nosso gps
    const navigate = useNavigate();

    // Estados locais para o formulário
    const [NomeListaCadastrada, setNomeListaCadastrada] = useState(''); // Nome da nova lista
    const [produtosAdicionadosNaLista, setprodutosAdicionadosNaLista] = useState([]); // Itens adicionados na nova lista, é um array de objetos {id, name, quantidade, comprado}
    const [campoDeBuscaDeProdutos, setcampoDeBuscaDeProdutos] = useState(''); //guarda o texto do campo de busca

    // 'pesquisar'  usa 'produtosCadastrados' (da API)
    //usei o hook useMemo para memorizar o resultado da pesquisa com base nas dependências fornecidas.
    const pesquisar = useMemo(() => {
        if (!campoDeBuscaDeProdutos) return [];
        return produtosCadastrados.filter(p =>
            p.name.toLowerCase().includes(campoDeBuscaDeProdutos.toLowerCase())
            //p é o padrão do filter, representa cada produto no array produtosCadastrados. o includes verifica se o nome do produto contém o texto buscado.
        );
    // Adicionamos 'produtosCadastrados' como dependência
    }, [campoDeBuscaDeProdutos, produtosCadastrados]);

    // Função "segura" para adicionar itens na lista LOCAL
    // (Usa o 'prevLista' para evitar o bug de apagar a lista)
    const addProdutoNaListaLocal = (produto) => {
        setprodutosAdicionadosNaLista(prevLista => {
            if (!prevLista.some(p => p.id === produto.id)) {
                // Adiciona o produto com quantidade e status 'comprado'
                return [...prevLista, { ...produto, quantidade: 1, comprado: false }];
            }
            return prevLista; // Não adiciona duplicatas
        });
    };

    const qtd = (produtoId, quantia) => {
        setprodutosAdicionadosNaLista(produtosAdicionadosNaLista.map(p =>
            p.id === produtoId ? { ...p, quantidade: Math.max(1, p.quantidade + quantia) } : p
        ));
    };

    const removerProduto = (produtoId) => {
        setprodutosAdicionadosNaLista(produtosAdicionadosNaLista.filter(p => p.id !== produtoId));
    };

    const salvarLista = () => {
        if (!NomeListaCadastrada.trim()) {
            alert('Por favor, dê um nome para a sua lista.');
            return;
        }
        const novaListaData = {
            nome: NomeListaCadastrada,
            itens: produtosAdicionadosNaLista,
        };
        adicionarNovaLista(novaListaData);
        navigate('/');
    };
    
    const goBack = () => navigate(-1);
    
    // 5. Função para o clique em um produto que JÁ EXISTE
    const handleSelecionarProdutoExistente = (produto) => {
        addProdutoNaListaLocal(produto); 
        setcampoDeBuscaDeProdutos(''); // Limpa a busca
    };

    // 6. Função para o clique em "Criar novo produto"
    const handleCriarNovoProduto = async () => {
        if (!campoDeBuscaDeProdutos.trim()) return;

        const nomeBusca = campoDeBuscaDeProdutos.toLowerCase();
        // Verifica se já existe (para evitar duplicados)
        const produtoExistente = produtosCadastrados.find(p => p.name.toLowerCase() === nomeBusca);
        
        let produtoParaAdicionar;

        if (produtoExistente) {
            produtoParaAdicionar = produtoExistente;
        } else {
            // Se não existe, cria na API
            const novoProduto = await adicionarNovoProdutoGlobal(campoDeBuscaDeProdutos);
            if (novoProduto) {
                produtoParaAdicionar = novoProduto;
            }
        }

        // Adiciona na lista local e limpa a busca
        if (produtoParaAdicionar) {
            addProdutoNaListaLocal(produtoParaAdicionar);
        }
        setcampoDeBuscaDeProdutos('');
    };

    return (
        <div className="bg-amber-100 min-h-screen">
            <header className="bg-amber-200 p-4 flex items-center shadow-sm sticky top-0 z-10">
                <button onClick={goBack} className="text-gray-800 mr-4"><IoArrowBack size={24} /></button>
                <h1 className="text-xl font-bold text-gray-800">Criar Nova Lista</h1>
            </header>

            <main className="p-4 sm:p-6">
                {/* 1. NOME DA LISTA */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <label htmlFor="nome-lista" className="block text-gray-700 font-bold mb-2">Nome da Lista:</label>
                    <input
                        type="text" id="nome-lista" value={NomeListaCadastrada}
                        onChange={(e) => setNomeListaCadastrada(e.target.value)}
                        placeholder="Ex: Compras da Semana"
                        className="w-full p-3 bg-gray-100 rounded-lg border focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </div>

                {/* 2. BUSCA E ADIÇÃO DE PRODUTOS */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-bold text-gray-700 mb-3">Adicionar Itens</h2>
                    <div className="relative">
                        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text" value={campoDeBuscaDeProdutos}
                            onChange={(e) => setcampoDeBuscaDeProdutos(e.target.value)}
                            placeholder="Buscar produto ou criar um novo..."
                            className="w-full p-3 pl-10 bg-gray-100 rounded-lg border focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    {campoDeBuscaDeProdutos && (
                        <div className="mt-2 border rounded-lg bg-white max-h-48 overflow-y-auto">
                            
                            {/* onClick para CRIAR */}
                            <div 
                                onClick={handleCriarNovoProduto} 
                                className="flex justify-between items-center p-3 hover:bg-amber-50 cursor-pointer text-amber-600 font-bold"
                            >
                                <span>Criar novo produto: "{campoDeBuscaDeProdutos}"</span>
                                <IoAddCircleOutline size={24} />
                            </div>
                            
                            {/* onClick para SELECIONAR */}
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


                {/* 3. ITENS JÁ ADICIONADOS NA LISTA */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-bold text-gray-700 mb-3">Itens na Lista ({produtosAdicionadosNaLista.length})</h2>
                    {produtosAdicionadosNaLista.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Nenhum item adicionado ainda.</p>
                    ) : (
                        <ul className="space-y-3">
                            {produtosAdicionadosNaLista.map(produto => (
                                <li key={produto.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <span className="font-semibold text-gray-800">{produto.name}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => qtd(produto.id, -1)} className="bg-amber-300 p-1 rounded-full text-amber-800"><BiMinus size={20} /></button>
                                        <span className="w-8 text-center font-bold">{produto.quantidade}</span>
                                        <button onClick={() => qtd(produto.id, 1)} className="bg-amber-300 p-1 rounded-full text-amber-800"><BiPlus size={20} /></button>
                                        <button onClick={() => removerProduto(produto.id)} className="ml-2 text-red-500 hover:text-red-700"><IoTrashBinOutline size={20} /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* BOTÃO FINAL DE SALVAR */}
                <div className="mt-8">
                    <button
                        onClick={salvarLista}
                        className="w-full bg-amber-400 text-amber-900 font-bold py-4 px-8 rounded-full shadow-md hover:bg-amber-500 transition-colors"
                    >
                        Salvar Lista Completa
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Cadastro;