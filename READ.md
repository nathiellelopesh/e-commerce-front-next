# E-commerce Front-end

Este repositório contém a aplicação de front-end do e-commerce, desenvolvida com Next.js, React e Tailwind CSS. O projeto interage com a API RESTful de back-end (Node.js/Express/Supabase) para fornecer funcionalidades completas para clientes e vendedores.

# Tecnologias e Dependências

A aplicação foi construída utilizando as seguintes tecnologias:

Framework: Next.js (versão 16.0.7, App Router)

Linguagem: JavaScript

Estilização: Tailwind CSS

Ícones: Lucide React

# Instalação e Execução

Para iniciar o projeto em seu ambiente local, siga os passos abaixo.

## Pré-requisitos

Certifique-se de ter o Node.js instalado.

## Instalação das Dependências

Clone o repositório e instale as dependências:

git clone [URL_DO_SEU_REPO]
cd meu-ecom-auth
npm install

## Execução do Servidor de Desenvolvimento

Inicie o Next.js em modo de desenvolvimento: npm run dev

# Estrutura de Rotas (Páginas)

O projeto segue a estrutura de rotas baseada em arquivos do Next.js e é segmentado por permissão de usuário:

A rota / direciona a página inicial e Landing Page.

A rota /login direciona ao formulário de login de Cliente/Vendedor.

A rota /register direciona ao formulário de registro de Cliente/Vendedor.

A rota /customerDashboard direciona ao catálogo de produtos para clientes.

A rota /sellerDashboard direciona ao painel de controle e inventário para vendedores.

a rota /createProduct direciona ao formulário para cadastro manual ou em massa (CSV) de produtos.

A rota /updateProduct/:productId direciona ao formulário para edição de um produto específico.

A rota /cart direciona a visualização e finalização do carrinho de compras.

A rota /favorites direciona a lista de produtos favoritos do usuário.

A rota /purchaseHistory direciona ao histórico de compras do cliente.

# Autenticação e Gestão de Sessão

A aplicação gerencia a autenticação da seguinte forma:

Login/Registro: O usuário envia as credenciais para o back-end (/api/users/login).

Token: Em caso de sucesso, o access_token (JWT) e o userId são armazenados no localStorage.

Redirecionamento: O usuário é redirecionado para o customerDashboard ou sellerDashboard com base no campo is_seller retornado pelo back-end. Se o usuário tiver o campo is_seller como true, é direcionad a página de vendedores.

Autorização de API: Todas as requisições protegidas (carrinho, produtos, etc.) recuperam o token do localStorage e o anexam ao cabeçalho Authorization: Bearer <token>.

# Lógica de Compra e Contextos

## CartProvider (Contexto do Carrinho)

O carrinho é gerenciado globalmente usando o CartContext.

Estado: Armazena uma lista de cartItems (incluindo detalhes do produto: nome, preço, imagem).

Funcionalidades: addToCart, removeFromCart, updateQuantity, fetchCart.

Checkout (checkout): Envia a lista de itens e quantidades para o endpoint /api/sales do back-end para processar a transação de venda e, em seguida, recarrega o carrinho.

## FavoriteProvider (Contexto de Favoritos)

O estado de favoritos é mantido de forma reativa.

Estado: Armazena apenas os favoriteProductIds (IDs dos produtos favoritos).

Funcionalidades: toggleFavorite (adiciona/remove) e checkIsFavorite.

Página /favorites: Utiliza a lista de IDs para buscar os detalhes completos dos produtos a serem exibidos.

# Fluxo de Vendedor (SellerDashboard e Produtos)

Métricas: O SellerDashboard busca as métricas de vendas (/api/metrics) e o inventário de produtos do vendedor (/api/products/inventory).

Criação/Edição: As páginas CreateProduct e UpdateProduct permitem o gerenciamento completo do catálogo do vendedor, incluindo o upload de CSV para criação em massa de produtos, que é processado assincronamente pelo back-end.

Modais de Confirmação: Modais são usados para ações destrutivas (Logout, Desativação de Conta, Exclusão de Produto), centralizando a lógica de confirmação (ConfirmationModal).