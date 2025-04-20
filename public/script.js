// DOM Elements
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const noteForm = document.getElementById('noteForm');
const notesSection = document.getElementById('notesSection');

// Event Listeners
registerForm.addEventListener('submit', handleRegister);
loginForm.addEventListener('submit', handleLogin);
noteForm.addEventListener('submit', handleNoteSubmit);

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('token')) {
        showNotesSection();
        loadNotes();
        document.getElementById('logoutBtn').addEventListener('click', logout); 
    }
});

function handleLogout() {
  localStorage.removeItem('token');
  alert("👋 You have been logged out!");
  document.getElementById('logoutSection').style.display = 'none'; // ✅ Hide logout
  location.reload();
}




// Register User
async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        const resultElement = document.getElementById('registerResult');

        if (response.ok) {
            resultElement.textContent = "✅ Registration successful! Please login.";
            resultElement.className = 'success';
            registerForm.reset();
        } else {
            resultElement.textContent = `❌ ${data.error || 'Registration failed'}`;
            resultElement.className = 'error';
        }
    } catch (err) {
        document.getElementById('registerResult').textContent = '❌ Network error';
        document.getElementById('registerResult').className = 'error';
    }
}

// Login User
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        const resultElement = document.getElementById('loginResult');

        if (response.ok) {
            localStorage.setItem('token', data.token);
            resultElement.textContent = "✅ Login successful!";
            resultElement.className = 'success';
            loginForm.reset();
            showNotesSection();
            loadNotes();
        } else {
            resultElement.textContent = `❌ ${data.error || 'Login failed'}`;
            resultElement.className = 'error';
        }
    } catch (err) {
        document.getElementById('loginResult').textContent = '❌ Network error';
        document.getElementById('loginResult').className = 'error';
    }
}

// Create Note
async function handleNoteSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ title, content })
        });

        const data = await response.json();
        const resultElement = document.getElementById('noteResult');

        if (response.ok) {
            resultElement.textContent = "✅ Note created successfully!";
            resultElement.className = 'success';
            noteForm.reset();
            loadNotes();
        } else {
            resultElement.textContent = `❌ ${data.error || 'Failed to create note'}`;
            resultElement.className = 'error';
        }
    } catch (err) {
        document.getElementById('noteResult').textContent = '❌ Network error';
        document.getElementById('noteResult').className = 'error';
    }
}

async function loadNotes() {
  const token = localStorage.getItem('token');
  const notesList = document.getElementById('notesList');

  try {
    const response = await fetch('/notes', {
      headers: {
        'Authorization': token
      }
    });

    const notes = await response.json();
    notesList.innerHTML = '';

    if (notes.length === 0) {
      notesList.innerHTML = '<li>No notes found. Create your first note!</li>';
      return;
    }

    notes.forEach(note => {
      const li = document.createElement('li');
      li.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.content}</p>
        <small>${new Date(note.createdAt).toLocaleString()}</small><br>
        <button onclick="deleteNote('${note._id}')">🗑 Delete</button>
        <button onclick="editNote('${note._id}', \`${note.title}\`, \`${note.content}\`)">✏️ Edit</button>
      `;
      notesList.appendChild(li);
    });

  } catch (err) {
    notesList.innerHTML = '<li>❌ Failed to load notes</li>';
  }
}


async function deleteNote(id) {
  const token = localStorage.getItem('token');

  const response = await fetch(`/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token
    }
  });

  const data = await response.json();

  if (response.ok) {
    alert("🗑 Note deleted!");
    loadNotes(); // Refresh list
  } else {
    alert(`❌ ${data.error}`);
  }
}

function editNote(id, oldTitle, oldContent) {
  const newTitle = prompt("Edit Title:", oldTitle);
  const newContent = prompt("Edit Content:", oldContent);

  if (newTitle && newContent) {
    updateNote(id, newTitle, newContent);
  }
}

async function updateNote(id, title, content) {
  const token = localStorage.getItem('token');

  const response = await fetch(`/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({ title, content })
  });

  const data = await response.json();

  if (response.ok) {
    alert("✅ Note updated!");
    loadNotes();
  } else {
    alert(`❌ ${data.error}`);
  }
}

// Helper function to show notes section
function showNotesSection() {
  document.getElementById('notesSection').style.display = 'block';
  document.querySelector('.auth-section').style.display = 'none';
  document.getElementById('logoutSection').style.display = 'block'; // ✅ Show logout button
}







  
  