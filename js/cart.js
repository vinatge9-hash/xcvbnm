/*
  Simple cart utility for Niyantri Beans & Brew site
  - Uses localStorage key 'nyb_cart'
  - Exposes addToCart(name, price) for Menu buttons
  - Renders cart and PayPal integration on Cart page
*/

function getCart(){
  try {
    return JSON.parse(localStorage.getItem('nyb_cart') || '[]');
  } catch { return []; }
}

function renderCartCount(){
  const countEl = document.getElementById('cart-count');
  if(countEl){ countEl.textContent = getCart().length; }
}

function addToCart(name, price){
  const cart = getCart();
  cart.push({ name: String(name), price: Number(price) });
  localStorage.setItem('nyb_cart', JSON.stringify(cart));
  renderCartCount();
}

function removeFromCart(index){
  const cart = getCart();
  cart.splice(index, 1);
  localStorage.setItem('nyb_cart', JSON.stringify(cart));
  // Re-render if on cart page
  if(typeof renderCartItems === 'function') renderCartItems();
  renderCartCount();
}

/* Cart page rendering (optional if you navigate directly to /cart.html) */
function renderCartItems(){
  const items = getCart();
  const container = document.getElementById('cart-items');
  if(!container) return;
  if(items.length === 0){ container.innerHTML = '<p>Your cart is empty.</p>'; updateTotalDisplay(0); return; }
  let html = '';
  items.forEach((it, idx) => {
    html += `<div class="flex justify-between items-center border-b py-2">
              <span>${it.name}</span>
              <span>$${Number(it.price).toFixed(2)}</span>
              <button class="text-red-500" onclick="removeFromCart(${idx})">Remove</button>
            </div>`;
  });
  container.innerHTML = html;
  updateTotal();
  // Update PayPal if present
  if(typeof renderPayPal === 'function') renderPayPal(getTotal());
}

function updateTotal(){
  const total = getTotal();
  updateTotalDisplay(total);
}

function updateTotalDisplay(total){
  const totalEl = document.getElementById('cart-total');
  if(totalEl) totalEl.textContent = '$' + Number(total || 0).toFixed(2);
}

function getTotal(){
  const items = getCart();
  return items.reduce((sum, i) => sum + Number(i.price || 0), 0);
}

// PayPal button integration helper (optional to exist on cart page)
function renderPayPal(total){
  if(typeof paypal === 'undefined') return;
  const container = document.getElementById('paypal-button-container');
  if(!container) return;
  container.innerHTML = '';
  paypal.Buttons({
    createOrder: function(data, actions){
      const amount = Number(total || 0).toFixed(2);
      return actions.order.create({ purchase_units: [{ amount: { currency_code: 'USD', value: amount } }] });
    },
    onApprove: function(data, actions){
      return actions.order.capture().then(function(details){
        alert('Payment completed. Thank you, ' + details.payer.name.given_name + '!');
        localStorage.removeItem('nyb_cart');
        renderCartItems();
      });
    }
  }).render('#paypal-button-container');
}

// Initialize on page load (if present)
document.addEventListener('DOMContentLoaded', function(){
  renderCartCount();
  if(typeof renderCartItems === 'function') renderCartItems();
});
