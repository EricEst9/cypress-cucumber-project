export function getTotal(): Cypress.Chainable<number> {
  return cy.get('#totalp').then($total => {
    if ($total.length > 0) {
      const totalText = $total.text().trim();
      const match = totalText.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    }
    return 0;
  });
}

export function addProducts(
  state: { products: { name: string; price: number; quantity: number }[]; total: number },
  productName: string,
  price: number,
  quantity: number
): { products: { name: string; price: number; quantity: number }[]; total: number } {
  const newState = {
    products: [...state.products],
    total: state.total
  };
  const existingIndex = newState.products.findIndex(p => p.name === productName);
  if (existingIndex >= 0) {
    newState.products[existingIndex].quantity += quantity;
  } else {
    newState.products.push({ name: productName, price, quantity });
  }
  newState.total = newState.products.reduce((sum, product) => {
    return sum + (product.price * product.quantity);
  }, 0);
  return newState;
}

export function removeProduct(
  state: { products: { name: string; price: number; quantity: number }[]; total: number },
  productName: string
): { products: { name: string; price: number; quantity: number }[]; total: number } {
  const newState = {
    products: [...state.products],
    total: state.total
  };
  const index = newState.products.findIndex(p => p.name === productName);
  if (index >= 0) {
    if (newState.products[index].quantity > 1) {
      newState.products[index].quantity -= 1;
    } else {
      newState.products.splice(index, 1);
    }
    newState.total = newState.products.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);
  }
  return newState;
} 