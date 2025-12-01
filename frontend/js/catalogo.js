
document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'http://localhost:3001';

    // --- DOM Elements ---
    const productCatalog = document.getElementById('product-catalog');
    const modal = document.getElementById('detail-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.querySelector('.close-btn');

    // --- API Helper ---
    async function fetchApi(endpoint) {
        try {
            const response = await fetch(`${apiBaseUrl}${endpoint}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch from API:", error);
            productCatalog.innerHTML = `<p>Error al cargar los productos. Revisa que el servidor backend esté funcionando correctamente.</p>`;
            return null;
        }
    }

    // --- Product Catalog Logic ---
    async function loadProducts() {
        const products = await fetchApi('/api/products');
        if (!products) return;

        productCatalog.innerHTML = ''; // Clear loading message

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='https.via.placeholder.com/300x200?text=KeyVibe';">
                <div class="product-card-content">
                    <h3>${product.name}</h3>
                    <p class="price" style="font-weight: bold; color: var(--primary-color);">${product.price}</p>
                    <p>${product.description}</p>
                    <button class="view-more-btn" data-id="${product.id}">Ver más</button>
                </div>
            `;
            productCatalog.appendChild(card);
        });

        // Add event listeners to the new buttons
        document.querySelectorAll('.view-more-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const productId = button.getAttribute('data-id');
                const product = products.find(p => p.id == productId);
                if (product) await showProductDetail(product);
            });
        });
    }

    // --- Modal Logic ---
    async function showProductDetail(product) {
        modalBody.innerHTML = '<p>Generando código QR...</p>';
        modal.style.display = 'block';

        const qrData = await fetchApi(`/api/generate-qr?url=${encodeURIComponent(product.songUrl)}`);

        if (qrData && qrData.qrCode) {
            modalBody.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image" style="width:100%; max-width:300px; margin: 0 auto; display:block; border-radius:10px;" onerror="this.src='https://via.placeholder.com/300?text=KeyVibe';">
                <h3 style="text-align:center; margin-top:1rem;">${product.name}</h3>
                <p class="price" style="font-weight: bold; color: var(--primary-color); text-align:center; font-size: 1.2rem;">${product.price}</p>
                <div class="modal-designs">
                    <div>
                        <p><strong>Diseño Frontal</strong></p>
                        <img src="${product.frontImageUrl}" alt="Diseño frontal" onerror="this.src='https://via.placeholder.com/100?text=Front';">
                    </div>
                    <div>
                        <p><strong>Diseño Trasero</strong></p>
                        <img src="${product.backImageUrl}" alt="Diseño trasero" onerror="this.src='https://via.placeholder.com/100?text=Back';">
                    </div>
                </div>
                <p style="text-align:center; margin-top:1.5rem;"><strong>Escanea para escuchar:</strong></p>
                <img src="${qrData.qrCode}" alt="Código QR de la canción" class="modal-qr-code">
            `;
        } else {
            modalBody.innerHTML = '<p>No se pudo generar el código QR.</p>';
        }
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target == modal) closeModal();
    });

    // --- Initial Load ---
    loadProducts();
});
