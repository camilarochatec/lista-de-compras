import { createContext, useContext, useState, useEffect, useMemo } from "react"; // 1. Importe o useMemo

const ListasContext = createContext();
const API_URL = "http://localhost:3001";

export const ListasProvider = ({ children }) => {

    const [todasAsListas, setTodasAsListas] = useState([]);
    const [produtosCadastrados, setProdutosCadastrados] = useState([]);

    // 1. Carrega os dados iniciais (listas e produtos) quando o app abre
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [listasRes, produtosRes] = await Promise.all([
                    fetch(`${API_URL}/listas`),
                    fetch(`${API_URL}/produtos_cadastrados`)
                ]);

                const listasData = await listasRes.json();
                const produtosData = await produtosRes.json();

                setTodasAsListas(listasData);
                setProdutosCadastrados(produtosData);

            } catch (error) {
                console.error("Falha ao buscar dados da API:", error);
            }
        };
        fetchData();
    }, []);

    // 2. A ÚNICA função de API que fica aqui é a de PRODUTOS,
    // pois ela afeta o estado global 'produtosCadastrados'.
    const adicionarNovoProdutoGlobal = async (nomeProduto) => {
        const novoProduto = { name: nomeProduto };
        try {
            const response = await fetch(`${API_URL}/produtos_cadastrados`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoProduto),
            });
            const data = await response.json();
            // Atualiza o estado global de produtos
            setProdutosCadastrados(prev => [...prev, data]);
            return data;
        } catch (error) {
            console.error("Falha ao adicionar produto global:", error);
            return null;
        }
    };

    // 3. Note que 'adicionarNovaLista', 'excluirLista', etc. SAÍRAM DAQUI.
    // Nós exportamos o 'setTodasAsListas' para que os componentes
    // possam atualizar o estado global eles mesmos.
    const providerValue = useMemo(() => ({
        todasAsListas,
        setTodasAsListas,
        produtosCadastrados,
        setProdutosCadastrados,
        adicionarNovoProdutoGlobal
        // 3. Adicione os estados na lista de dependências
    }), [todasAsListas, produtosCadastrados]);

    return (
        // 4. Passe o "providerValue" memoizado aqui
        <ListasContext.Provider value={providerValue}>
            {children}
        </ListasContext.Provider>
    );
};

export const useListas = () => {
    const context = useContext(ListasContext);
    if (context === undefined) {
        throw new Error("useListas deve ser usado dentro de um ListasProvider");
    }
    return context;
};