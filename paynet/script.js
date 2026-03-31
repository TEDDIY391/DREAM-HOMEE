// Simple Paynet simulation
let users = JSON.parse(localStorage.getItem('users')) || {
    'user': { password: 'pass', balance: 100000, transactions: [], cards: [] }
};

let currentUser = null;

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const error = document.getElementById('login-error');
    
    if (users[username] && users[username].password === password) {
        currentUser = username;
        localStorage.setItem('currentUser', currentUser);
        showDashboard();
        error.textContent = '';
    } else {
        error.textContent = 'Noto\'g\'ri foydalanuvchi nomi yoki parol';
    }
});

// registration handler
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newUser = document.getElementById('new-username').value;
        const newPass = document.getElementById('new-password').value;
        const regMsg = document.getElementById('register-message');
        
        if (users[newUser]) {
            regMsg.textContent = 'Bu nom band. Boshqa tanlang.';
            regMsg.style.color = 'red';
            return;
        }
        
        users[newUser] = { password: newPass, balance: 0, transactions: [], cards: [] };
        saveUsers();
        regMsg.textContent = 'Ro\'yxatdan muvaffaqiyatli o\'tildi';
        regMsg.style.color = 'green';
        document.getElementById('new-username').value = '';
        document.getElementById('new-password').value = '';
    });
}

document.getElementById('logout-btn').addEventListener('click', function() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
});

// open payment page in new window
const payBtn = document.getElementById('open-payment-btn');
if (payBtn) {
    payBtn.addEventListener('click', () => {
        window.open('payment.html', '_blank', 'width=400,height=600');
    });
}

// password recovery
const recoverBtn = document.getElementById('recover-btn');
if (recoverBtn) {
    recoverBtn.addEventListener('click', function() {
        const user = prompt('Foydalanuvchi nomini kiriting:');
        if (user && users[user]) {
            alert(`Parol: ${users[user].password}`);
        } else {
            alert('Foydalanuvchi topilmadi');
        }
    });
}

document.getElementById('topup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const amount = parseInt(document.getElementById('topup-amount').value);
    const message = document.getElementById('topup-message');
    
    if (amount <= 0) {
        message.textContent = 'Miqdor noto\'g\'ri';
        message.style.color = 'red';
        return;
    }
    
    users[currentUser].balance += amount;
    users[currentUser].transactions.push({
        service: 'topup',
        amount: amount,
        date: new Date().toLocaleString()
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    
    updateDashboard();
    message.textContent = 'Balans to\'ldirildi';
    message.style.color = 'green';
    document.getElementById('topup-amount').value = '';
});

document.getElementById('add-card-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('card-name').value;
    const number = document.getElementById('card-number').value;
    const message = document.getElementById('add-card-message');
    
    if (!name || !number) {
        message.textContent = 'Barcha maydonlarni to\'ldiring';
        message.style.color = 'red';
        return;
    }
    
    if (number.length !== 16 || isNaN(number)) {
        message.textContent = 'Karta raqami 16 raqamdan iborat bo\'lishi kerak';
        message.style.color = 'red';
        return;
    }
    
    users[currentUser].cards.push({ name: name, number: number });
    
    localStorage.setItem('users', JSON.stringify(users));
    
    updateDashboard();
    message.textContent = 'Karta qo\'shildi';
    message.style.color = 'green';
    document.getElementById('card-name').value = '';
    document.getElementById('card-number').value = '';
});

function showDashboard() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    updateDashboard();
}

// if already logged in, show dashboard on load
if (currentUser && users[currentUser]) {
    showDashboard();
}

function updateDashboard() {
    document.getElementById('balance').textContent = users[currentUser].balance;
    const list = document.getElementById('transaction-list');
    list.innerHTML = '';
    users[currentUser].transactions.forEach(t => {
        const li = document.createElement('li');
        if (t.type === 'transfer') {
            li.textContent = `${t.date} - Transfer to **** **** **** ${t.recipient.slice(-4)}: ${t.amount} so'm`;
        } else {
            li.textContent = `${t.date} - ${t.service}: ${t.amount} so'm`;
        }
        list.appendChild(li);
    });
    
    const cardList = document.getElementById('card-list');
    cardList.innerHTML = '';
    users[currentUser].cards.forEach(c => {
        const li = document.createElement('li');
        li.textContent = `${c.name}: **** **** **** ${c.number.slice(-4)}`;
        cardList.appendChild(li);
    });
}
