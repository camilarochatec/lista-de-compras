import { BrowserRouter, Route, Routes } from "react-router";
import Home from "../pages/Home";
import Lista from "../pages/Lista";
import Cadastro from "../pages/Cadastro";
import Layout from "../layout/Layout";
import { ListasProvider } from '../context/ListasContext'; 

// Componentes de página "placeholder" para completar as rotas. será feito futuramente.
const Perfil = () => <div className="p-4"><h1>Página de Perfil (a ser criada)</h1></div>
const Produtos = () => <div className="p-4"><h1>Página de Produtos (a ser criada)</h1></div>

const Path = () => {

    return (
        <ListasProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/cadastro" element={<Cadastro />} />
                        <Route path="/lista/:id" element={<Lista />} />

                        {/* Rotas do  menu */}
                        <Route path="/home" element={<Home />} />
                        <Route path="/produtos" element={<Produtos />} />
                        <Route path="/perfil" element={<Perfil />} />

                    </Route>
                </Routes>
            </BrowserRouter>
        </ListasProvider>
    );
}

export default Path;