
document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'http://localhost:3001';

    // --- DOM Elements ---
    const customProductGrid = document.getElementById('custom-product-grid');
    const modal = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('custom-modal-title');
    const closeModalBtn = modal.querySelector('.close-btn');
    const songUrlInput = document.getElementById('song-url-input');
    const generateQrBtn = document.getElementById('generate-qr-btn');
    const qrResultContainer = document.getElementById('qr-result-container');

    let selectedProduct = null;

    // --- API Helpers ---
    async function getApi(endpoint) {
        try {
            const response = await fetch(`${apiBaseUrl}${endpoint}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch from API:", error);
            customProductGrid.innerHTML = `<p>Error al cargar los modelos. Revisa que el servidor backend esté funcionando.</p>`;
            return null;
        }
    }

    async function postApi(endpoint, body) {
        try {
            const response = await fetch(`${apiBaseUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to post to API:", error);
            return null;
        }
    }

    // --- Load Customizable Products ---
    async function loadCustomizableProducts() {
        const products = await getApi('/api/customizable-products');
        if (!products) return;

        customProductGrid.innerHTML = ''; // Clear loading message

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=KeyVibe';">
                <div class="product-card-content">
                    <h3>${product.name}</h3>
                    <p class="price" style="font-weight: bold; color: var(--primary-color);">${product.price}</p>
                    <button class="customize-btn" data-id="${product.id}" data-name="${product.name}">Personalizar canción</button>
                </div>
            `;
            customProductGrid.appendChild(card);
        });

        document.querySelectorAll('.customize-btn').forEach(button => {
            button.addEventListener('click', () => {
                selectedProduct = {
                    id: button.getAttribute('data-id'),
                    name: button.getAttribute('data-name')
                };
                openCustomModal();
            });
        });
    }

    // --- Modal Logic ---
    function openCustomModal() {
        modalTitle.textContent = `Personalizar: ${selectedProduct.name}`;
        songUrlInput.value = '';
        qrResultContainer.innerHTML = '';
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
        selectedProduct = null;
    }

    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target == modal) closeModal();
    });

    // --- QR Generation and Order Submission ---
    generateQrBtn.addEventListener('click', async () => {
        const url = songUrlInput.value.trim();
        if (!url) {
            alert('Por favor, pega un enlace de una canción.');
            return;
        }

        qrResultContainer.innerHTML = '<p>Generando QR...</p>';
        const qrData = await getApi(`/api/generate-qr?url=${encodeURIComponent(url)}`);

        if (qrData && qrData.qrCode) {
            qrResultContainer.innerHTML = `
                <h4>3. ¡Tu código QR está listo!</h4>
                <img src="${qrData.qrCode}" alt="Código QR personalizado" style="width:150px; height:150px;">
                <p>Ahora puedes enviar tu solicitud para que preparemos tu llavero.</p>
                <button id="submit-order-btn">Enviar Solicitud</button>
            `;

            document.getElementById('submit-order-btn').addEventListener('click', async () => {
                qrResultContainer.innerHTML = '<p>Enviando solicitud...</p>';
                const order = {
                    productId: selectedProduct.id,
                    productName: selectedProduct.name,
                    songUrl: url
                };
                const result = await postApi('/api/submit-order', order);
                if (result) {
                    qrResultContainer.innerHTML = `<h4>¡Solicitud Enviada!</h4><p>Hemos recibido tu pedido. Nos pondremos en contacto contigo pronto.</p>`;
                    setTimeout(closeModal, 3000);
                } else {
                    qrResultContainer.innerHTML = `<p>Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo.</p>`;
                }
            });
        } else {
            qrResultContainer.innerHTML = '<p>No se pudo generar el código QR. Verifica el enlace.</p>';
        }
    });

    // --- Initial Load ---
    loadCustomizableProducts();
});
