// Authentication and OTP Logic
const users = JSON.parse(localStorage.getItem('users')) || {};
let otpCodes = {};
let pendingUser = null;

// Generate random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP (mock implementation)
function sendOTP(email) {
    const otp = generateOTP();
    otpCodes[email] = {
        code: otp,
        expires: Date.now() + 300000 // 5 minutes
    };
    console.log(`OTP for ${email}: ${otp}`); // In production, this would email the OTP
    return otp;
}

// Verify OTP
function verifyOTP(email, code) {
    const otpData = otpCodes[email];
    if (!otpData || otpData.expires < Date.now()) {
        return false;
    }
    return otpData.code === code;
}

// Password strength check
function checkPasswordStrength(password) {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
}

// Login Form
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        if (users[username] && users[username].password === password) {
            localStorage.setItem('currentUser', JSON.stringify(users[username]));
            location.href = 'role-selector.html';
        } else {
            alert('Invalid username or password');
        }
    } else {
        alert('Please fill in all fields');
    }
});

// Signup Form
document.getElementById('signupForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (email && username && password) {
        if (!users[username]) {
            if (checkPasswordStrength(password)) {
                pendingUser = { email, username, password };
                sendOTP(email);
                location.href = 'otp-verification.html';
            } else {
                alert('Password must contain at least 8 characters, including uppercase, lowercase, number and special character');
            }
        } else {
            alert('Username already exists');
        }
    } else {
        alert('Please fill in all fields');
    }
});

// OTP Verification
document.getElementById('otpForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const inputs = document.querySelectorAll('#otpForm input');
    const otp = Array.from(inputs).map(input => input.value).join('');
    
    if (pendingUser && verifyOTP(pendingUser.email, otp)) {
        users[pendingUser.username] = {
            email: pendingUser.email,
            password: pendingUser.password
        };
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(users[pendingUser.username]));
        alert('Account created successfully!');
        location.href = 'role-selector.html';
    } else {
        alert('Invalid OTP');
    }
});

// Resend OTP
document.getElementById('resendOtp')?.addEventListener('click', function() {
    if (pendingUser) {
        sendOTP(pendingUser.email);
        alert('New OTP sent!');
    }
});

// Logout Function
function logout() {
    localStorage.removeItem('currentUser');
    location.href = 'login.html';
}
