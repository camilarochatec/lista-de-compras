import { createContext, useContext, useState, useEffect } from "react";

const ListasContext = createContext();
const API_URL = "http://localhost:3001"; 

export const ListasProvider = ({ children }) => {
    
    const [todasAsListas, setTodasAsListas] = useState([]);
    const [produtosCadastrados, setProdutosCadastrados] = useState([]);

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

    const adicionarNovaLista = async (novaListaData) => {
        try {
            const response = await fetch(`${API_URL}/listas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novaListaData),
            });
            const data = await response.json();
            setTodasAsListas(prevListas => [...prevListas, data]);
        } catch (error) {
            console.error("Falha ao adicionar lista:", error);
        }
    };

    const excluirLista = async (listaId) => {
        try {
            await fetch(`${API_URL}/listas/${listaId}`, { method: 'DELETE' });
            setTodasAsListas(prevListas => prevListas.filter(lista => lista.id !== listaId));
        } catch (error) {
            console.error("Falha ao excluir lista:", error);
        }
    };

    const atualizarItensDaLista = async (listaId, novosItens) => {
        const listaParaAtualizar = todasAsListas.find(l => l.id === listaId);
        if (!listaParaAtualizar) return;
        
        const bodyAtualizado = { ...listaParaAtualizar, itens: novosItens };

        try {
            const response = await fetch(`${API_URL}/listas/${listaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyAtualizado),
            });
            const data = await response.json(); 
            setTodasAsListas(prevListas =>
                prevListas.map(lista => (lista.id === listaId ? data : lista))
            );
        } catch (error) {
            console.error("Falha ao atualizar itens:", error);
        }
    };
    

    const editarLista = async (listaId, dadosAtualizados) => {
   
        const listaParaAtualizar = todasAsListas.find(l => l.id === listaId);
        if (!listaParaAtualizar) return;

        // Mescla a lista antiga com os dados novos
        const bodyAtualizado = { ...listaParaAtualizar, ...dadosAtualizados };

        try {
            const response = await fetch(`${API_URL}/listas/${listaId}`, {
                method: 'PUT', // PUT substitui o objeto inteiro
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyAtualizado),
            });
            const data = await response.json(); 
            
            // Atualiza o estado local
            setTodasAsListas(prevListas =>
                prevListas.map(lista =>
                    lista.id === listaId ? data : lista
                )
            );
        } catch (error) {
            console.error("Falha ao editar lista:", error);
        }
    };
    
    // --- Função de PRODUTOS ---
    const adicionarNovoProdutoGlobal = async (nomeProduto) => {
        const novoProduto = { name: nomeProduto };
        try {
            const response = await fetch(`${API_URL}/produtos_cadastrados`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoProduto),
            });
            const data = await response.json(); 
            setProdutosCadastrados(prev => [...prev, data]);
            return data; 
        } catch (error) {
            console.error("Falha ao adicionar produto global:", error);
            return null;
        }
    };

    const value = {
        todasAsListas,
        adicionarNovaLista,
        excluirLista,
        editarLista, 
        atualizarItensDaLista,
        produtosCadastrados, 
        adicionarNovoProdutoGlobal 
    };

    return (
        <ListasContext.Provider value={value}>
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