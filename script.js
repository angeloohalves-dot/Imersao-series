let allSeries = []; // Armazena os dados de todas as séries

// Função para buscar e exibir os dados das séries
async function fetchSeries() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Filtra objetos vazios que possam existir no JSON
        allSeries = data.filter(serie => serie.nome); 
        
        createCategoryMenu(); // Cria o menu de categorias
        displaySeries(allSeries); // Exibe todas as séries inicialmente

    } catch (error) {
        console.error("Erro ao buscar os dados das séries:", error);
    }
}

// Função para exibir as séries na tela
function displaySeries(seriesToShow) {
    const container = document.querySelector('.card-container');
    container.innerHTML = ''; // Limpa o container antes de adicionar novos cards

    if (seriesToShow.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhuma série encontrada para esta categoria.</p>';
        return;
    }

    // Agrupa as séries em conjuntos de 3
    for (let i = 0; i < seriesToShow.length; i += 3) {
        const seriesChunk = seriesToShow.slice(i, i + 3);
        const page = document.createElement('section');
        page.className = 'series-page';

        // Adiciona o fundo com base na primeira série do grupo
        if (seriesChunk[0] && seriesChunk[0].capa) {
            page.innerHTML = `<div class="page-background" style="background-image: url('${seriesChunk[0].capa}')"></div>`;
        }

        const cardsWrapper = document.createElement('div');
        cardsWrapper.className = 'cards-wrapper';

        seriesChunk.forEach(serie => {
            const article = document.createElement('article');
            article.classList.add('card');
            const serieId = serie.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            article.id = `serie-${serieId}`;

            article.innerHTML = `
                <div class="card-image">
                    <img src="${serie.capa}" alt="Capa da série ${serie.nome}" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x600.png?text=Capa+Indisponível';">
                </div>
                <div class="card-info">
                    <h2><a href="${serie.imdb_link}" target="_blank" rel="noopener noreferrer">${serie.nome}</a></h2>
                    <p><strong>Ano:</strong> ${serie.ano}</p>
                    <p>${serie.descricao}</p>
                    <a href="${serie.link}" class="saiba-mais-btn" target="_blank" rel="noopener noreferrer">Saiba Mais</a>
                </div>
            `;
            cardsWrapper.appendChild(article);
        });
        page.appendChild(cardsWrapper);
        container.appendChild(page);
    }

    // Após criar os artigos, inicia o observador de animação
    setupAnimationObserver();
}

// Função para criar o menu de categorias
function createCategoryMenu() {
    const categoryList = document.getElementById('category-list');
    // Usando um Set para obter tags únicas
    const allTags = new Set(allSeries.flatMap(serie => serie.tags || []));
    const sortedTags = [...allTags].sort(); // Ordena as tags em ordem alfabética

    // Botão para mostrar todas as séries
    const allLi = document.createElement('li');
    allLi.innerHTML = `<button class="category-button active">Todas</button>`;
    allLi.querySelector('button').addEventListener('click', (e) => {
        displaySeries(allSeries);
        document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
    });
    categoryList.appendChild(allLi);

    // Cria um botão para cada tag
    sortedTags.forEach(tag => {
        const listItem = document.createElement('li');
        // Formata a tag para exibição (ex: 'ficcao_cientifica' -> 'Ficcao Cientifica')
        const formattedTag = tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        listItem.innerHTML = `<button class="category-button">${formattedTag}</button>`;
        
        listItem.querySelector('button').addEventListener('click', (e) => {
            const filteredSeries = allSeries.filter(serie => serie.tags && serie.tags.includes(tag));
            displaySeries(filteredSeries);
            // Gerencia a classe 'active' para feedback visual
            document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
        });
        categoryList.appendChild(listItem);
    });
}

// Função para configurar a animação de fade-in nos artigos
function setupAnimationObserver() {
    const pages = document.querySelectorAll('.series-page');
    const body = document.body;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Se a página de séries está visível
            if (entry.isIntersecting) {
                // Remove a classe de fundo ativo de todas as páginas
                document.querySelectorAll('.page-background').forEach(bg => bg.classList.remove('active-background'));
                // Adiciona a classe de fundo ativo apenas na página atual
                const currentBackground = entry.target.querySelector('.page-background');
                if (currentBackground) {
                    currentBackground.classList.add('active-background');
                }
            }
        });
    }, {
        threshold: 0.5 // Dispara quando 50% da página estiver visível
    });

    pages.forEach(page => {
        observer.observe(page);
    });
}

// Função para buscar uma série e rolar até ela
function iniciarBusca() {
    const input = document.querySelector('.search-input');
    const searchTerm = input.value.trim().toLowerCase();

    if (!searchTerm) {
        alert("Por favor, digite o nome de uma série.");
        return;
    }

    // Encontra a primeira série que corresponde ao termo de busca
    const serieEncontrada = allSeries.find(serie => serie.nome.toLowerCase().includes(searchTerm));

    if (serieEncontrada) {
        const serieId = serieEncontrada.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const elementoSerie = document.getElementById(`serie-${serieId}`);
        if (elementoSerie) {
            elementoSerie.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Adiciona a classe de destaque
            elementoSerie.classList.add('highlight');

            // Remove a classe de destaque após 3 segundos
            setTimeout(() => {
                elementoSerie.classList.remove('highlight');
            }, 3000); // 3000ms = 3 segundos
        }
    } else {
        alert(`Nenhuma série encontrada com o termo "${input.value}".`);
    }
}

// Inicia a busca de dados quando a página carrega e configura os eventos
document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica do Botão Voltar ao Topo ---
    const backToTopButton = document.getElementById('back-to-top-btn');

    // Mostra ou esconde o botão baseado na posição da rolagem
    window.onscroll = () => {
        // Se o usuário rolou mais que a altura de uma tela (100vh), mostra o botão
        if (document.body.scrollTop > window.innerHeight || document.documentElement.scrollTop > window.innerHeight) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    };

    // Adiciona o evento de clique para rolar suavemente para o topo
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Carregamento das Séries e Busca ---
    fetchSeries();
    // Adiciona evento para buscar ao pressionar "Enter"
    document.querySelector('.search-input').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            iniciarBusca();
        }
    });

    // --- Lógica do Menu Lateral ---
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const categoryMenu = document.querySelector('.category-menu');
    const menuCloseBtn = document.getElementById('menu-close-btn');
    menuToggleBtn.setAttribute('aria-expanded', 'false');

    // Botão "Hamburger" agora apenas abre o menu
    menuToggleBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Impede que o clique se propague para o document
        categoryMenu.classList.add('open');
        menuToggleBtn.setAttribute('aria-expanded', 'true');
        // Move o foco para o botão de fechar dentro do menu
        menuCloseBtn.focus();
    });

    // Botão "X" fecha o menu
    menuCloseBtn.addEventListener('click', () => {
        categoryMenu.classList.remove('open');
        menuToggleBtn.setAttribute('aria-expanded', 'false');
        // Devolve o foco para o botão que abriu o menu
        menuToggleBtn.focus();
    });

    // Fecha o menu se clicar fora dele
    document.addEventListener('click', (event) => {
        if (categoryMenu.classList.contains('open') && !categoryMenu.contains(event.target) && event.target !== menuToggleBtn) {
            categoryMenu.classList.remove('open');
            menuToggleBtn.setAttribute('aria-expanded', 'false');
            // Não precisa devolver o foco aqui, pois o usuário clicou em outro lugar
        }
    });

    // Adiciona a lógica de "trapping focus" ao menu
    categoryMenu.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab') {
            return; // Se não for a tecla Tab, não faz nada
        }

        // Pega todos os elementos focáveis dentro do menu
        const focusableElements = categoryMenu.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Se a tecla Shift NÃO estiver pressionada (navegando para frente)
        if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault(); // Impede o comportamento padrão do Tab
            firstElement.focus(); // Move o foco para o primeiro elemento
        }

        // Se a tecla Shift ESTIVER pressionada (navegando para trás)
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault(); // Impede o comportamento padrão do Tab
            lastElement.focus(); // Move o foco para o último elemento
        }
    });
});
