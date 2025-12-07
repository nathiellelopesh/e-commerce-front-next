const API_BASE_URL = 'http://localhost:3030/users';

const apiCall = async (endpoint, method, body = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  
  if (!response.ok) {
    const errorMessage = data.message || `Erro na requisição ${method} para ${endpoint}.`;
    throw new Error(errorMessage);
  }

  return data;
};

export const registerUser = async ({ email, password, role }) => {
  const customer = role === 'customer';
  return apiCall('/register', 'POST', { email, password, customer });
};

export const loginUser = async ({ email, password }) => {
  const data = await apiCall('/login', 'POST', { email, password });
  const role = email.includes('vendedor') || email.includes('seller') ? 'seller' : 'customer';
  
  return { 
    token: data.access_token, 
    userId: data.user_id, 
    email, 
    role 
  };
};

export const deactivateAccount = async (userId) => {
  return apiCall('/deactivate', 'DELETE', { userId });
};