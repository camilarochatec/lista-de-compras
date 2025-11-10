import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { IoArrowBack, IoTrashBinOutline, IoAddCircleOutline, IoSearchOutline } from 'react-icons/io5';
import { BiPlus, BiMinus } from 'react-icons/bi';
import { useListas } from '../context/ListasContext';

// URL da API
const API_URL = "http://localhost:3001";

const Lista = () => {
    const {
        todasAsListas, 
        setTodasAsListas, 
        produtosCadastrados,
        adicionarNovoProdutoGlobal
    } = useListas();

    const navigate = useNavigate();
    const { id } = useParams(); 
    const location = useLocation(); 

    const [lista, setLista] = useState(location.state);
    const [campoDeBusca, setCampoDeBusca] = useState('');

    // Efeito de Fallback (continua igual)
    useEffect(() => {
        if (!lista) { 
            const listaDoCache = todasAsListas.find(l => l.id.toString() === id);
            
            if (listaDoCache) {
                const itensComprados = listaDoCache.itens.map(item => ({
                    ...item,
                    comprado: item.comprado || false
                }));
                setLista({ ...listaDoCache, itens: itensComprados });
            }
        }
    }, [id, lista, todasAsListas]); 

    // 2. FUNÇÃO CENTRAL DE SALVAR NA API (Igual)
    const atualizarEsalvar = (updaterFn) => {
        let listaAtualizadaCompleta;

        // 1. Atualiza o estado LOCAL usando a forma funcional
        setLista(prevLista => {
            if (!prevLista) return null; 

            const novosItens = updaterFn(prevLista.itens);
            listaAtualizadaCompleta = { ...prevLista, itens: novosItens };
            return listaAtualizadaCompleta;
        });

        // 5. Envia o estado 'capturado' (o mais novo) para a API
        if (listaAtualizadaCompleta) {
            fetch(`${API_URL}/listas/${listaAtualizadaCompleta.id}`, { 
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(listaAtualizadaCompleta), 
            })
            .then(res => res.json())
            .then(data => {
                setTodasAsListas(prevListas =>
                    prevListas.map(l => (l.id === listaAtualizadaCompleta.id ? data : l))
                );
            })
            .catch(error => {
                console.error("Falha ao salvar alteração:", error);
            });
        }
    };

    // --- 3. Funções de manipulação (Iguais) ---

    const handleToggleComprado = (itemId) => {
        const updaterFn = (itensAtuais) => {
            return itensAtuais.map(item =>
                item.id === itemId ? { ...item, comprado: !item.comprado } : item
            );
        };
        atualizarEsalvar(updaterFn);
    };

    const handleQuantidade = (itemId, quantia) => {
        const updaterFn = (itensAtuais) => {
            return itensAtuais.map(item =>
                item.id === itemId ? { ...item, quantidade: Math.max(1, item.quantidade + quantia) } : item
            );
        };
        atualizarEsalvar(updaterFn);
    };

    const handleRemoverItem = (itemId) => {
        if (window.confirm("Remover este item?")) {
            const updaterFn = (itensAtuais) => {
                return itensAtuais.filter(item => item.id !== itemId);
            };
            atualizarEsalvar(updaterFn);
        }
    };

    // --- 4. Lógica de Adição (COM ALERTAS) ---

    const pesquisar = useMemo(() => {
        if (!campoDeBusca) return [];
        return produtosCadastrados.filter(p =>
            p.name.toLowerCase().includes(campoDeBusca.toLowerCase())
        );
    }, [campoDeBusca, produtosCadastrados]);

    // 'addProdutoNaListaLocal' agora com alerta de duplicata
    const addProdutoNaListaLocal = (produto) => {
        let foiAdicionado = false;
        
        const updaterFn = (itensAtuais) => {
            // Checamos a duplicata no estado MAIS ATUAL
            if (itensAtuais.some(item => item.id === produto.id)) {
                return itensAtuais; // Não faz nada
            }

            foiAdicionado = true; 
            const novoItem = {
                id: produto.id,
                name: produto.name,
                quantidade: 1,
                comprado: false
            };
            return [...itensAtuais, novoItem];
        };
        
        atualizarEsalvar(updaterFn);

        // REQUISITO 1: Alerta de duplicata
        if (!foiAdicionado) {
            alert("Esse item já está na lista!");
        }
        
        return foiAdicionado; 
    };


    const handleSelecionarProdutoExistente = (produto) => {
        if (addProdutoNaListaLocal(produto)) {
            // REQUISITO 2: Alerta de produto (existente) adicionado
            alert("Produto adicionado com sucesso!");
            setCampoDeBusca(''); 
        }
    };

    const handleCriarNovoProduto = async () => {
        if (!campoDeBusca.trim()) return;

        const nomeBusca = campoDeBusca.toLowerCase();
        let produtoParaAdicionar;
        let foiCriadoAgora = false; // Flag para saber se o produto é novo

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
            foiCriadoAgora = true; // Marca a flag
        }

        if (addProdutoNaListaLocal(produtoParaAdicionar)) {
            // REQUISITO 3: Alerta de produto (novo) cadastrado
            if (foiCriadoAgora) {
                alert("Produto cadastrado com sucesso!");
            } else {
                // Caso o usuário tenha digitado o nome exato e clicado em "criar"
                alert("Produto adicionado com sucesso!");
            }
            setCampoDeBusca('');
        }
        // Se addProdutoNaListaLocal retornar 'false', o alerta de duplicata
        // já será mostrado por ela.
    };


    // --- Renderização ---

    if (!lista) {
        return (
            <div className="p-4 text-center">
                <h1 className="text-xl text-red-500">Lista não encontrada ou a carregar...</h1>
                <button onClick={() => navigate('/')} className="text-blue-500 mt-4">Voltar para Home</button>
            </div>
        );
    }

    const itensParaComprar = lista.itens.filter(item => !item.comprado);
    const itensComprados = lista.itens.filter(item => item.comprado);

    return (
        <div className="bg-amber-100 min-h-screen">
            {/* Header da Página */}
            <header className="bg-amber-200 p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex items-center min-w-0">
                    <button onClick={() => navigate(-1)} className="text-gray-800 mr-4 flex-shrink-0">
                        <IoArrowBack size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800 truncate">{lista.nome}</h1>
                </div>
            </header>

            <main className="p-4 sm:p-6">

                {/* 1. SEÇÃO DE BUSCA E ADIÇÃO (Igual) */}
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

                    {/* Dropdown de Busca (Igual) */}
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
                                G</div>
                            ))}
                        </div>
                    )}
                </div>


                {/* 2. LISTA DE ITENS PARA COMPRAR (Igual) */}
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

                {/* 3. LISTA DE ITENS COMPRADOS (Igual) */}
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




