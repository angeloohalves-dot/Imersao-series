let allSeries = []; // Variável global para armazenar os dados de todas as séries

// Função para buscar e exibir os dados das séries
async function fetchSeries() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        allSeries = data; // Armazena os dados na variável global
        const container = document.querySelector('.card-container');
        container.innerHTML = ''; // Limpa o container antes de adicionar novos cards

        // Agrupa as séries em conjuntos de 3
        for (let i = 0; i < data.length; i += 3) {
            const seriesChunk = data.slice(i, i + 3);
            const page = document.createElement('section');
            page.className = 'series-page';

            // Adiciona o fundo com base na primeira série do grupo
            page.innerHTML = `<div class="page-background" style="background-image: url('${seriesChunk[0].capa}')"></div>`;

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
                        <h2><a href="${serie.link}" target="_blank">${serie.nome}</a></h2>
                        <p><strong>Ano:</strong> ${serie.ano}</p>
                        <p>${serie.descricao}</p>
                    </div>
                `;
                cardsWrapper.appendChild(article);
            });
            page.appendChild(cardsWrapper);
            container.appendChild(page);
        }

        // Após criar os artigos, inicia o observador de animação
        setupAnimationObserver();

    } catch (error) {
        console.error("Erro ao buscar os dados das séries:", error);
    }
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
});