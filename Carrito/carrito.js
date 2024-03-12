document.addEventListener("DOMContentLoaded", function () {
  const appElement = document.getElementById("app");
  const cartElement = document.getElementById("cart-items");
  const cartCountElement = document.getElementById("cart-count");
  const cartTotalElement = document.getElementById("cart-total");
  const searchInput = document.getElementById("search-input");
  const successModal = new bootstrap.Modal(document.getElementById("success-modal"));

  const productsPerPage = 4;
  let currentPage = 1;
  let itemsPerPage = 4;

  const data = {
    productos: [],
    carrito: {},
  };

  const itemsPerPageSelect = document.getElementById("itemsPerPage");
  const paginationContainer = document.getElementById("pagination");
  const currentPageElement = document.getElementById("currentPage");

  function renderPaginationButtons(totalProducts) {
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    ;

    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.classList.add("btn", "btn-secondary", "me-2");
      button.textContent = i;
      button.addEventListener("click", () => changePage(i));
      paginationContainer.appendChild(button);
    }
  }

  updateCart();

  fetch("http://localhost:3000/productos")
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.statusText}`);
      }
      return response.json();
    })
    .then(productosData => {
      data.productos = productosData;
      renderProducts(productosData);
    })
    .catch(error => console.error(error.message));

  function renderProducts(products) {
    appElement.innerHTML = "";

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = products.slice(startIndex, endIndex);

    currentProducts.forEach(product => {
      const productElement = document.createElement("div");
      productElement.classList.add("col-md-3", "mb-4");
      productElement.innerHTML = `
        <div class="card">
          <img src="${product.imagen}" class="card-img-top" alt="${product.nombre}">
          <div class="card-body">
            <h5 class="card-title">${product.nombre}</h5>
            <p class="card-text">Precio: $${product.precio}</p>
            <button class="btn btn-success" onclick="addToCart('${product.nombre}', ${product.precio})">
              <i class="fas fa-cart-plus"></i> Agregar al carrito
            </button>
          </div>
        </div>
      `;
      appElement.appendChild(productElement);
    });

    renderPaginationButtons(products.length);
  }

  function renderPaginationButtons(totalProducts) {
    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    const paginationElement = document.getElementById("pagination");
    paginationElement.innerHTML = "";

    const selectElement = document.createElement("select");
    selectElement.id = "itemsPerPage";
    selectElement.addEventListener("change", changeItemsPerPage);

    const options = [4, 8, 12, 16];
    options.forEach(option => {
      const optionElement = document.createElement("option");
      optionElement.value = option;
      optionElement.text = option;
      selectElement.appendChild(optionElement);
    });

    const labelElement = document.createElement("label");
    labelElement.htmlFor = "itemsPerPage";
    labelElement.textContent = "Mostrar por página:";

    paginationElement.appendChild(labelElement);
    paginationElement.appendChild(selectElement);

    const navElement = document.createElement("nav");
    navElement.setAttribute("aria-label", "Page navigation");

    const ulElement = document.createElement("ul");
    ulElement.classList.add("pagination");

    for (let i = 1; i <= totalPages; i++) {
      const liElement = document.createElement("li");
      liElement.classList.add("page-item");

      const buttonElement = document.createElement("button");
      buttonElement.classList.add("btn", "btn-primary");
      buttonElement.textContent = i;
      buttonElement.addEventListener("click", () => changePage(i));

      liElement.appendChild(buttonElement);
      ulElement.appendChild(liElement);
    }

    navElement.appendChild(ulElement);
    paginationElement.appendChild(navElement);
  }

  function changePage(newPage) {
    currentPage = newPage;
    fetch("http://localhost:3000/productos")
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al obtener datos: ${response.statusText}`);
        }
        return response.json();
      })
      .then(productosData => {
        data.productos = productosData;
        renderProducts(productosData);
      })
      .catch(error => console.error(error.message));
  }
  function changeItemsPerPage() {
    const newItemsPerPage = parseInt(itemsPerPageSelect.value);
    if (newItemsPerPage !== itemsPerPage) {
      itemsPerPage = newItemsPerPage;
      currentPage = 1;
      fetch("http://localhost:3000/productos")
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error al obtener datos: ${response.statusText}`);
          }
          return response.json();
        })
        .then(productosData => {
          data.productos = productosData;
          renderProducts(productosData);
        })
        .catch(error => console.error(error.message));
    }
  }

  window.addToCart = function (productName, productPrice) {
    fetch("http://localhost:3000/carrito")
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al obtener datos del carrito: ${response.statusText}`);
        }
        return response.json();
      })
      .then(cartData => {
        if (cartData[productName]) {
          cartData[productName]++;
        } else {
          cartData[productName] = 1;
        }

        fetch("http://localhost:3000/carrito", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cartData),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Error al actualizar el carrito: ${response.statusText}`);
            }
            return response.json();
          })
          .then(data => {
            console.log("Carrito actualizado en la base de datos:", data);
            updateCart();
          })
          .catch(error => console.error(error.message));
      })
      .catch(error => console.error(error.message));
  };
  function searchProducts() {
    const searchTerm = document.getElementById("search-input").value.toLowerCase();
    const productItems = document.getElementsByClassName("col-md-3");

    for (const productItem of productItems) {
      const productText = productItem.textContent.toLowerCase();
      if (productText.includes(searchTerm)) {
        productItem.style.display = "block";
      } else {
        productItem.style.display = "none";
      }
    }
  }


  function changeItemsPerPage() {
    const newItemsPerPage = parseInt(document.getElementById("itemsPerPage").value);
    if (newItemsPerPage !== itemsPerPage) {
      itemsPerPage = newItemsPerPage;
      currentPage = 1;
      fetch("http://localhost:3000/productos")
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error al obtener datos: ${response.statusText}`);
          }
          return response.json();
        })
        .then(productosData => {
          data.productos = productosData;
          renderProducts(productosData);
        })
        .catch(error => console.error(error.message));
    }
  }
  // Función para comprar los productos en el carrito
  window.buyCart = function () {
    fetch("http://localhost:3000/carrito", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al comprar el carrito: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Carrito vaciado en la base de datos:", data);
        updateCart();
        showSuccessModal();
      })
      .catch(error => console.error(error.message));
  };

  function showSuccessModal() {
    successModal.show();
  };

  // Función para eliminar todos los productos del carrito
  window.clearCart = function () {
    fetch("http://localhost:3000/carrito", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al vaciar el carrito: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Carrito vaciado en la base de datos:", data);
        updateCart();
      })
      .catch(error => console.error(error.message));
  };

  // Función para eliminar una unidad de un producto en el carrito
  window.removeOneFromCart = function (productName) {
    fetch("http://localhost:3000/carrito")
      .then(response => response.json())
      .then(cartData => {
        if (cartData[productName]) {
          cartData[productName]--;
          if (cartData[productName] === 0) {
            delete cartData[productName];
          }
          fetch("http://localhost:3000/carrito", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(cartData),
          })
            .then(response => response.json())
            .then(data => {
              console.log("Carrito actualizado en la base de datos:", data);
              updateCart();
            })
            .catch(error => console.error(error.message));
        }
      })
      .catch(error => console.error(error.message));
  };

  // Función para eliminar todos los productos de un tipo del carrito
  window.removeAllFromCart = function (productName) {
    fetch("http://localhost:3000/carrito")
      .then(response => response.json())
      .then(cartData => {
        if (cartData[productName]) {
          delete cartData[productName];
          fetch("http://localhost:3000/carrito", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(cartData),
          })
            .then(response => response.json())
            .then(data => {
              console.log("Carrito actualizado en la base de datos:", data);
              updateCart();
            })
            .catch(error => console.error(error.message));
        }
      })
      .catch(error => console.error(error.message));
  };

  // Función para actualizar el carrito en la interfaz
  function updateCart() {
    cartElement.innerHTML = "";
    fetch("http://localhost:3000/carrito")
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al obtener datos del carrito: ${response.statusText}`);
        }
        return response.json();
      })
      .then(cartData => {
        // Renderizar productos en el carrito
        let totalCount = 0;
        let totalPrice = 0;

        Object.keys(cartData).forEach(productName => {
          const cartItemElement = document.createElement("div");
          cartItemElement.classList.add("mb-2");
          cartItemElement.innerHTML = `
            ${productName}: ${cartData[productName]} unidades - Precio: $${cartData[productName] * getProductPrice(productName)}
            <button class="btn btn-warning btn-sm ms-2" onclick="removeOneFromCart('${productName}')">Eliminar 1</button>
            <button class="btn btn-danger btn-sm ms-2" onclick="removeAllFromCart('${productName}')">Eliminar todo</button>
          `;
          cartElement.appendChild(cartItemElement);

          // Sumar al contador total y al precio total
          totalCount += cartData[productName];
          totalPrice += cartData[productName] * getProductPrice(productName);
        });

        
        cartCountElement.textContent = totalCount;
        cartTotalElement.textContent = `Precio total: $${totalPrice}`;
      })
      .catch(error => console.error(error.message));
  }

  // Función para obtener el precio de un producto por su nombre
  function getProductPrice(productName) {
    const product = data.productos.find(product => product.nombre === productName);
    return product ? product.precio : 0;
  }
});
