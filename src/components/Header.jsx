import { useState } from 'react';
import { NavLink } from 'react-router';
import { BiMenu } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';

const Header = () => {

    // chamamos o estado para controlar se o menu está aberto ou fechado. ele lembra o estado atual
    const [menuAberto, setmenuAberto] = useState(false);

    // Funções de Ação

    // Função para fechar e abrir o menu. o setmenuAberto altera o estado para o valor passado. ele começa como false (fechado). mas ao abrir, vira true.
    const abrirMenu = () => setmenuAberto(true);
    const fecharMenu = () => setmenuAberto(false);


    // classes do "Backdrop" (fundo escuro) com base no estado. usamos template literals para facilitar a construção das classes.
    // o PointerEvents-none impede que o fundo escuro capture cliques quando o menu está fechado.
    const classesDoFundoEscuro = `
        fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
        ${menuAberto ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    `;

    // classes do "Painel" (menu lateral) com base no estado
    const classesDoPainel = `
        fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 
        transform transition-transform duration-300 ease-in-out
        ${menuAberto ? 'translate-x-0' : '-translate-x-full'}
    `;

    // Função que o NavLink usará para saber qual classe aplicar. o isActive é um booleano que o NavLink fornece automaticamente. isActive é true se o link for o atual e será aplicado o estilo de ativo.
    const getClassesDoNavLink = ({ isActive }) => {
        const classePadrão = 'block py-3 px-4 rounded-lg text-lg transition-colors';

        if (isActive) {
            return `${classePadrão} bg-amber-100 text-amber-800 font-bold`;
        }

        // Estilo do link INATIVO
        return `${classePadrão} text-gray-600 hover:bg-gray-100`;
    };


    return (
        <>
            <header className="bg-amber-300 p-4 shadow-md w-full sticky top-0 z-30">
                <div className="container mx-auto flex items-center">
                    {/* quando clicar nesse botão, a função abrirMenu será chamada, alterando o estado para true e abrindo o menu */}
                    <button
                        onClick={abrirMenu}
                        className="p-1 rounded-full text-amber-800 hover:text-amber-900  active:bg-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-150"
                    >
                        <BiMenu size={32} />
                    </button>

                    <div className="relative flex-grow ml-4">
                        <h1 className="text-2xl font-bold text-gray-800">Lista de Compras</h1>
                    </div>
                </div>
            </header>
            {/* ele guarda o menu lateral e o fundo escuro */}
            <aside>
                <div
                // o fundo escuro cobre toda a tela e quando clicado, chama a função fecharMenu para fechar o menu
                    className={classesDoFundoEscuro}
                    onClick={fecharMenu}
                ></div>
                <div
                    className={classesDoPainel}
                >
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-700">Menu</h2>
                        <button onClick={fecharMenu} className="text-gray-600 hover:text-gray-900">
                            <IoClose size={28} />
                        </button>
                    </div>

                    <nav className="p-4">
                        <ul>
                            <li>
                                <NavLink
                                    to="/"
                                    className={getClassesDoNavLink}
                                    onClick={fecharMenu}
                                >
                                    Home
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/produtos"
                                    className={getClassesDoNavLink}
                                    onClick={fecharMenu}
                                >
                                    Produtos
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/perfil"
                                    className={getClassesDoNavLink}
                                    onClick={fecharMenu}
                                >
                                    Meu Perfil
                                </NavLink>
                            </li>
                        </ul>
                    </nav>
                </div>
            </aside>
        </>
    );
}

export default Header;


