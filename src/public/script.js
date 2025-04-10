async function register(e) {
  e.preventDefault();
  const data = {
    first_name: document.getElementById('registerFirstName')?.value,
    email: document.getElementById('registerEmail')?.value,
    password: document.getElementById('registerPassword')?.value
  };

  try {
    const res = await fetch('/api/sessions/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message);
    if (res.ok) location.href = '/';
  } catch (err) {
    console.error('Error en registro:', err);
    alert('Error al registrarse');
  }
}

async function login(e) {
  e.preventDefault();
  const data = {
    email: document.getElementById('loginEmail').value,
    password: document.getElementById('loginPassword').value
  };

  try {
    const res = await fetch('/api/sessions/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    const result = await res.json();
    alert(result.message);
    location.href = '/';
  } catch (err) {
    console.error('Error en login:', err.message);
    alert(`Error: ${err.message}`);
  }
}


document.getElementById('registerForm')?.addEventListener('submit', register);
document.getElementById('loginForm')?.addEventListener('submit', login);
