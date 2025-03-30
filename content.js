// Crear el elemento balloon
const balloon = document.createElement('div');
balloon.className = 'balance-balloon pixel-art';
document.body.appendChild(balloon);

// Cache para el precio
let sflPriceCache = {
  value: 0,
  lastUpdated: 0
};

// Mostrar estado de carga
function showLoading() {
  balloon.innerHTML = `
    <div class="balloon-content">
      <div class="loading">
        <div class="pixel-spinner"></div>
        <div class="loading-text pixel-text">Cargando...</div>
      </div>
    </div>
  `;
  balloon.style.display = 'block';
}

// Obtener precio de SFL
async function fetchSFLPrice() {
  const now = Date.now();
  if (now - sflPriceCache.lastUpdated < 120000 && sflPriceCache.value > 0) {
    return sflPriceCache.value;
  }

  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=sunflower-land');
    const data = await response.json();
    if (data && data.length > 0) {
      sflPriceCache = {
        value: data[0].current_price,
        lastUpdated: now
      };
      return data[0].current_price;
    }
  } catch (error) {
    console.error('Error fetching SFL price:', error);
    return 0;
  }
}

// Convertir balance a USDT
function convertToUSDT(balance, price) {
  const balanceValue = parseFloat(balance.replace(/[^\d.-]/g, ''));
  if (!isNaN(balanceValue)) {
    return price > 0 ? (balanceValue * price).toFixed(2) : '--.--';
  }
  return '--.--';
}

// Mostrar balloon con datos
async function showBalloon(element) {
  const rect = element.getBoundingClientRect();
  const scrollY = window.scrollY || window.pageYOffset;
  const scrollX = window.scrollX || window.pageXOffset;
  
  // Calcular posición
  const top = rect.bottom + scrollY + 5;
  const left = rect.left + scrollX + (rect.width / 2) - 110;
  
  // Ajustar para no salir de la pantalla
  const maxLeft = window.innerWidth - 220 - 10;
  const adjustedLeft = Math.max(10, Math.min(left, maxLeft));
  
  balloon.style.top = `${top}px`;
  balloon.style.left = `${adjustedLeft}px`;
  balloon.style.display = 'block';
  
  showLoading();
  
  const sflPrice = await fetchSFLPrice();
  const balanceText = element.textContent.trim();
  const usdtValue = convertToUSDT(balanceText, sflPrice);
  
  balloon.innerHTML = `
    <div class="balloon-content">
      <div class="original-balance pixel-text">${balanceText}</div>
      <div class="usdt-conversion pixel-text">$${usdtValue} USDT</div>
      ${sflPrice > 0 ? 
        `<div class="price-info pixel-text">1 SFL = $${sflPrice.toFixed(4)}</div>` : 
        `<div class="error-info pixel-text">Error de conexión</div>`}
    </div>
  `;
}

// Manejadores de eventos
document.addEventListener('click', (e) => {
  const balanceElement = e.target.closest('.balance-text');
  
  if (balanceElement && !balanceElement.classList.contains('mt-0.5')) {
    e.preventDefault();
    e.stopPropagation();
    showBalloon(balanceElement);
  } else if (!balloon.contains(e.target)) {
    balloon.style.display = 'none';
  }
});

window.addEventListener('scroll', () => {
  balloon.style.display = 'none';
}, { passive: true });

window.addEventListener('resize', () => {
  balloon.style.display = 'none';
}, { passive: true });