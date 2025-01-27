
let listeners = [];
const added_products = {};
const landed_on_mobile = window.innerWidth < 659;
var page_activity = 0;
var suggestion_displayed = false;
var last_resulted = 0;

const server_response = {
    1: {
      id: 1,
      image: "./assets/images/image-waffle-desktop.jpg",
      type: "Waffle",
      title: "Waffle with Berries",
      price: "6.50",
      cartStatus: "4"
    },
    2: {
      id: 2,
      image: "./assets/images/image-creme-brulee-desktop.jpg",
      type: "Crème Brûlée",
      title: "Vanilla Bean Crème Brûlée",
      price: "7.00",
      cartStatus: "Add to cart"
    },
    3: {
      id: 3,
      image: "./assets/images/image-macaron-desktop.jpg",
      type: "Macaron",
      title: "Macaron Mic of Five",
      price: "8.00",
      cartStatus: "Add to cart"
    },
    4: {
      id: 4,
      image: "./assets/images/image-tiramisu-desktop.jpg",
      type: "Tiramisu",
      title: "Classic Tiramisu",
      price: "5.50",
      cartStatus: "Add to cart"
    },
    5: {
      id: 5,
      image: "./assets/images/image-baklava-desktop.jpg",
      type: "Baklava",
      title: "Pistachio Baklava",
      price: "5.50",
      cartStatus: "Add to cart"
    },
    6: {
      id: 6,
      image: "./assets/images/image-meringue-desktop.jpg",
      type: "Pie",
      title: "Lemon Meringue Pie",
      price: "5.50",
      cartStatus: "Add to cart"
    },
    7: {
      id: 7,
      image: "./assets/images/image-cake-desktop.jpg",
      type: "Cake",
      title: "Red Velvet Cake",
      price: "4.50",
      cartStatus: "Add to cart"
    },
    8: {
      id: 8,
      image: "./assets/images/image-brownie-desktop.jpg",
      type: "Brownie",
      title: "Salted Caramel Brownie",
      price: "4.50",
      cartStatus: "Add to cart"
    },
    9: {
      id: 9,
      image: "./assets/images/image-panna-cotta-desktop.jpg",
      type: "Panna Cotta",
      title: "Vanilla Panna Cotta",
      price: "6.50",
      cartStatus: "Add to cart"
    },
  };

const products_count = Object.keys(server_response).length || 0;

function recordActivity(){
  page_activity += 1;
  if ((page_activity > 3) && (!suggestion_displayed)){
    sourceSuggestion();
    suggestion_displayed = !suggestion_displayed;
  };
};

function updateQuantiy(product_id, quantity){
  const data_holder = document.getElementById(`quantity-${product_id}`)
  if (data_holder){
    data_holder.textContent = quantity;
  }
}

function getCartProduct(product_id){
  const card = document.getElementById(`cart-product-${product_id}`);
  if (card){card.classList.remove('animate-card')}
  return card || null
};

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function dynamicPriceUpdate(resulted_number, holder) {
  const wholePart = Math.floor(resulted_number);
  if (holder) {
    let times_needed = wholePart - last_resulted;
    const negative_change = times_needed <= 0;
    times_needed = negative_change ? (times_needed * -1) : times_needed;
    for (let times = 0; times <= times_needed; times++){
      const digit_to_update = negative_change ? (last_resulted-times) : (last_resulted+times)
      setTimeout(() => {
        if(times === times_needed){holder.textContent = `$${resulted_number.toFixed(2)}`; last_resulted = wholePart; return true;}
        holder.textContent = `$${digit_to_update.toFixed(2)}`;
      }, 49 * (times/2));
    }
  }
}

const dynamicUpdate = debounce(dynamicPriceUpdate, 499);

function updateTotal(){
  const added_product_ids = Object.keys(added_products);
  const holder = document.getElementById('Exact-Amount');
  if(holder){
    let total = 0;
    Object.entries(added_products).forEach(([product_id, quantity]) => {
      const product_price = server_response[product_id]['price'];
      total += (product_price * quantity);
    })
    dynamicUpdate(total, holder);
  }
}

function insertHtml(parent, child){
  if (parent && child){
    parent.appendChild(child);
  }
}

function updateProductStatus(product_id, regular_change=false){
  const productStatus = document.getElementById(`product-${product_id}`);
  if(regular_change){
    productStatus.classList.remove('enlargeAnim');
    productStatus.classList.remove('statusRefresh');
    setTimeout(() => {
      productStatus.classList.add('enlargeAnim');
    }, 99);
    return true;
  }
  if(productStatus){
    productStatus.classList.remove('enlargeAnim');
    productStatus.classList.remove('statusRefresh');
    setTimeout(() => {
      productStatus.classList.add('statusRefresh')
    }, 99);
  };
};

function formCartProduct(product, quantity, for_update=false){
  return !for_update ? `
      <div id="cart-product-${product.id}" class="cart-product">
          <div class="cart-product-child1">
            <small>${product.title}</small>
          </div>
          <div class="cart-product-child2">
            <p class="x-amount globaltext">${quantity}x</p>
          </div>
          <div class="cart-product-child3">
            <p class="price1 globaltext">@ $${parseFloat(product.price).toFixed(2)}</p>
          </div>
          <div class="cart-product-child4">
            <p class="price2 globaltext">$${parseFloat(product.price * quantity).toFixed(2)}</p>
          </div>
          <div onclick="forceRemove_CartItem(${product.id})" class="cart-product-child5">
            <img src="./assets/images/icon-remove-item.svg">
          </div>
      </div>
  `
    : 
  `
        <div class="cart-product-child1">
          <small>${product.title}</small>
        </div>
        <div class="cart-product-child2">
          <p class="x-amount globaltext">${quantity}x</p>
        </div>
        <div class="cart-product-child3">
          <p class="price1 globaltext">@ $${product.price}</p>
        </div>
        <div class="cart-product-child4">
          <p class="price2 globaltext">$${product.price * quantity}</p>
        </div>
        <div onclick="complete_removal(${product.id})" class="cart-product-child5">
          <img src="./assets/images/icon-remove-item.svg">
        </div>
  `
}

function applyUpdateEffect(product_id){
  const cartProduct = document.getElementById(`cart-product-${product_id}`);
  if(cartProduct){
    cartProduct.classList.remove('cart-update-effect');
    setTimeout(() => {
      cartProduct.classList.add('cart-update-effect');
    }, 99);
  };
}

function removeFromCart(product_id){
  const card = document.getElementById(`cart-product-${product_id}`);
  if(card){
    updateProductStatus(product_id);
    card.classList.remove('cart-update-effect')
    card.classList.add('slowlyRemove')
    setTimeout(() => {
      card.remove();
    }, 999);
  };
}

function updateCartTotal(){
  const total = Object.keys(added_products).length;
  const card = document.getElementById('');
  const cartText = total ? `Your Cart (<span id="exact-total">${total}</span>)` : 'No Products Yet.';
  const indicator = `<h3>${cartText}</h3>`;
  if(card){
    card.innerHTML = indicator;
  }
  updateTotal();
}

function addedStatus(product_id, added=1){
  return `
    <div class="added-status">
      <div onclick="decrease(${product_id})" class="minus">
        <div class="minus-round">
          <span></span>
          <span></span>
        </div>
      </div>
      <div class="quantity">
        <div id="quantity-${product_id}" class="quantity-holder">${added}</div>
      </div>
      <div onclick="increase(${product_id})" class="plus">
        <div class="plus-holder">
          <div class="line"></div>
          <div class="line"></div>
        </div>
      </div>
    </div>
  `
}

function defaultStatus(product_id){
  return `
      <div class="DefaultProductStatus">
        <div class="status1">
          <img src="./assets/images/icon-add-to-cart.svg" alt="Description of the image">
        </div>
        <div class="status2">
          <p>Add to cart</p>
        </div>
      </div>
  `
}
function formProduct(product, added=0){
  const cartStatus = added ? `
    <div class="added-status">
      <div class="minus">
        <div class="minus-round">
          <span></span>
          <span></span>
        </div>
      </div>
      <div class="quantity">
        <div class="quantity-holder">${added}</div>
      </div>
      <div class="plus">
        <div class="plus-holder">
          <div class="line"></div>
          <div class="line"></div>
        </div>
      </div>
    </div>`
      :
    `
      <div class="DefaultProductStatus">
        <div class="status1">
          <img src="./assets/images/icon-add-to-cart.svg" alt="Description of the image">
        </div>
        <div class="status2">
          <p>Add to cart</p>
        </div>
      </div>
    `
  return `
      <div class="product">
          <div class="image_window">
            <img class="product_image" src="${product.image}" alt="">
          </div>
          <div data-id="${product.id}" id="product-${product.id}"  class="cart-status">
            ${cartStatus}
          </div>
          <div class="product_type">
            <small>${product.type}</small>
          </div>
          <div class="product_title">
            <h5>${product.title}</h5>
          </div>
          <div class="product_price">
            <p>$${product.price}</p>
          </div>
      </div>
  `
}

for (let count = 1; count <= products_count; count++){
  const products_window = document.getElementById('products-hub');
  if(products_window){
    const product = server_response[count];
    const htmlInsert = formProduct(product);
    products_window.innerHTML += htmlInsert;
    listeners.push(product.id);
  }
}

function ConfirmPurchase(button_itself){
  const products_added = Object.keys(added_products).length;
  if(products_added){
    exposeMessage({message: thankfulness}); 
    recordActivity();
    if(button_itself){
      button_itself.classList.remove('bubble-button');
      setTimeout(() => {
        button_itself.classList.add('bubble-button');
      }, 99);
    }
  };
}

function defaultAddtoCart(event){
  const element = event.currentTarget;
  if (element){
    const product_id = element.getAttribute('data-id')
    add_to_cart(product_id, true)
    element.removeEventListener('click', defaultAddtoCart)
  }
};
listeners.forEach(each_id=>{
  const element = document.getElementById(`product-${each_id}`);
  element.addEventListener('click', defaultAddtoCart);
})
function add_to_cart(product_id, increment=true){
  recordActivity();
  if(product_id){
    const current_amount = added_products[product_id] || 0;
    const verify_amount = (amount)=> amount < 0 ? 0 : amount
    const productStatus = document.getElementById(`product-${product_id}`);
    let resulted;
    if(increment){
      resulted = Number(current_amount) + 1;
      added_products[product_id] = resulted;
      if (resulted == 1){
        productStatus.innerHTML = addedStatus(product_id, resulted);
      }else{
        updateQuantiy(product_id, resulted)
      }
    }
    if(!increment){
      resulted = verify_amount(Number(current_amount) - 1);
      added_products[product_id] = resulted;
      updateQuantiy(product_id, resulted)
    }
    const resulted_zero = resulted == 0;
    if(!resulted_zero){updateProductStatus(product_id, true)}
    if (resulted_zero){
      productStatus.innerHTML = defaultStatus(product_id);
      setTimeout(() => {
        productStatus.addEventListener('click', defaultAddtoCart)
      }, 99);
    }
    updateCart(product_id, resulted)
  }
}

function complete_removal(product_id){
  const productStatus = document.getElementById(`product-${product_id}`);
  productStatus.innerHTML = defaultStatus(product_id);
  removeFromCart(product_id);
  delete added_products[product_id];
  setTimeout(() => {
    updateCartTotal();
    productStatus.addEventListener('click', defaultAddtoCart);
  }, 99);
};

const increase = (product_id)=>{add_to_cart(product_id, true)}
const decrease = (product_id)=>{add_to_cart(product_id, false)}

function formNewProduct(product_id){
  const Product = document.createElement('div');
  Product.id = `cart-product-${product_id}`;
  Product.className = `cart-product animate-card`;
  return Product;
}

function updateCart(updated_one, lasted){
  const cartHub = document.getElementById('added-products');
  if (cartHub){
    Object.entries(added_products).forEach(([product_id, quantity]) => {
      const product_dealing_with = server_response[product_id];
      if(product_dealing_with){
        const already_inserted = getCartProduct(product_id);
        const cartProduct = formCartProduct(product_dealing_with, quantity, already_inserted);
        if (already_inserted){
          already_inserted.innerHTML = cartProduct;
          if ((updated_one == product_id) && (quantity)){applyUpdateEffect(product_id);}
        }
        else{
          const newProduct = formNewProduct(product_id);
          newProduct.innerHTML = formCartProduct(product_dealing_with, quantity, true);
          insertHtml(cartHub, newProduct);
        }
        if (!quantity){
          removeFromCart(product_id);
          delete added_products[product_id];
        }
      }
      updateCartTotal();
  });
  }
};

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const onMobile = width < 659;
  if(!onMobile){toggleMenu(true)}
});

const mobileCart = document.getElementById('mobileCart');
const ConfirmButton = document.getElementById('ConfirmButton');
var toggled = 1;
const menuButton = document.getElementById('togglePoint')
menuButton.addEventListener('click', ()=>toggleMenu())

function toggleMenu(force_open=false) {
  if (force_open){
    mobileCart.classList.remove("closeMobileCart");
    menuButton.classList.add("active");
    toggled = 1;
  }else{
    if (!toggled){
      mobileCart.classList.remove("closeMobileCart");
      menuButton.classList.add("active");
      toggled = 1;
    }else{
      menuButton.classList.remove("active");
      mobileCart.classList.remove("closeMobileCart");
      mobileCart.classList.add("closeMobileCart");
      toggled = 0;
    }
  }
}

if(ConfirmButton){
  ConfirmButton.addEventListener('click', ()=>ConfirmPurchase(ConfirmButton));
}

if(landed_on_mobile){
  toggleMenu() 
}