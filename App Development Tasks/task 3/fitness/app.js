// --- Firebase Config Start ---
const firebaseConfig = {
  apiKey: "AIzaSyDrWVyLzbO8fGD8-XHz2sMcIH9mUQX_z0E",
  authDomain: "fitness-tracker-5cbd8.firebaseapp.com",
  projectId: "fitness-tracker-5cbd8",
  storageBucket: "fitness-tracker-5cbd8.firebasestorage.app",
  messagingSenderId: "1001123482914",
  appId: "1:1001123482914:web:f4d1d6191a24eae661e97b",
  measurementId: "G-MFC6PKKSY7"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
// --- Firebase Config End ---

// Fitness Tracker App Logic
// Data will be stored in Firestore (per user)

let currentUser = null;
let fitnessData = {};

// UI toggle helpers
function showDashboard(show) {
    document.getElementById('dashboard').style.display = show ? '' : 'none';
    document.getElementById('logForm').style.display = show ? '' : 'none';
    document.getElementById('logoutBtn').style.display = show ? '' : 'none';
    document.getElementById('authSection').style.display = show ? 'none' : '';
}

// Auth listeners
function showAuthMsg(msg, color = 'red') {
    const el = document.getElementById('authMsg');
    el.textContent = msg;
    el.style.color = color;
}

document.addEventListener('DOMContentLoaded', function() {
    // Auth form events
    document.getElementById('authForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('authEmail').value;
        const pass = document.getElementById('authPassword').value;
        auth.signInWithEmailAndPassword(email, pass)
            .then(() => showAuthMsg('Login successful!', 'green'))
            .catch(err => showAuthMsg(err.message));
    });
    document.getElementById('registerBtn').addEventListener('click', function(e) {
        e.preventDefault();
        const email = document.getElementById('authEmail').value;
        const pass = document.getElementById('authPassword').value;
        auth.createUserWithEmailAndPassword(email, pass)
            .then(() => showAuthMsg('Registration successful! Now login.', 'green'))
            .catch(err => showAuthMsg(err.message));
    });
    document.getElementById('logoutBtn').addEventListener('click', function() {
        auth.signOut();
    });

    // Auth state change
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            showDashboard(true);
            loadFitnessData();
        } else {
            currentUser = null;
            showDashboard(false);
            showAuthMsg('');
        }
    });

    // Activity form
    document.getElementById('activityForm').addEventListener('submit', function(e) {
        e.preventDefault();
        logActivity();
    });
    document.getElementById('resetBtn').addEventListener('click', function() {
        resetAllData();
    });
    document.getElementById('exportBtn').addEventListener('click', function() {
        exportData();
    });
    document.getElementById('importBtn').addEventListener('click', function() {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', function(e) {
        importData(e.target.files[0]);
        e.target.value = '';
    });
});

function exportData() {
    const data = getFitnessData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fitness_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData(file) {
    if (!file || !currentUser) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (typeof imported === 'object' && imported !== null) {
                saveFitnessData(imported);
                alert('Data imported successfully!');
            } else {
                alert('Invalid file format.');
            }
        } catch (err) {
            alert('Error importing file.');
        }
    };
    reader.readAsText(file);
}

function getTodayDate() {
    const today = new Date();
    return today.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getFitnessData() {
    return fitnessData;
}

function saveFitnessData(data) {
    if (!currentUser) return;
    db.collection('fitnessData').doc(currentUser.uid).set(data)
        .then(() => {
            fitnessData = data;
            updateDashboard();
            renderWeeklyChart();
        });
}

function loadFitnessData() {
    if (!currentUser) return;
    db.collection('fitnessData').doc(currentUser.uid).get().then(doc => {
        fitnessData = doc.exists ? doc.data() : {};
        updateDashboard();
        renderWeeklyChart();
    });
}

function logActivity() {
    if (!currentUser) return;
    const steps = parseInt(document.getElementById('stepsInput').value) || 0;
    const workout = parseInt(document.getElementById('workoutInput').value) || 0;
    const calories = parseInt(document.getElementById('caloriesInput').value) || 0;
    const today = getTodayDate();
    const data = getFitnessData();
    data[today] = {
        steps: (data[today]?.steps || 0) + steps,
        workout: (data[today]?.workout || 0) + workout,
        calories: (data[today]?.calories || 0) + calories
    };
    saveFitnessData(data);
    document.getElementById('activityForm').reset();
}

function updateDashboard() {
    const today = getTodayDate();
    const data = getFitnessData();
    const todayData = data[today] || {steps: 0, workout: 0, calories: 0};
    document.getElementById('stepsCount').textContent = todayData.steps;
    document.getElementById('workoutTime').textContent = todayData.workout;
    document.getElementById('caloriesBurned').textContent = todayData.calories;
    updateWeeklyProgressBar();
}

function updateWeeklyProgressBar() {
    // Weekly goal: 35,000 steps (5000 per day)
    const WEEKLY_GOAL = 35000;
    const data = getFitnessData();
    const days = getLast7Days();
    const totalSteps = days.reduce((sum, day) => sum + (data[day]?.steps || 0), 0);
    const percent = Math.min(100, Math.round((totalSteps / WEEKLY_GOAL) * 100));
    document.getElementById('weeklyProgressBar').style.width = percent + '%';
    document.getElementById('weeklyProgressText').textContent = percent + '%';
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
    }
    return days;
}

function renderWeeklyChart() {
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    const data = getFitnessData();
    const days = getLast7Days();
    const steps = days.map(day => data[day]?.steps || 0);
    if (window.weeklyChartInstance) {
        window.weeklyChartInstance.destroy();
    }
    window.weeklyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days.map(d => d.slice(5)),
            datasets: [{
                label: 'Steps',
                data: steps,
                backgroundColor: '#2d3a4b',
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function resetAllData() {
    if (!currentUser) return;
    if (confirm('Are you sure you want to delete all fitness data?')) {
        db.collection('fitnessData').doc(currentUser.uid).set({}).then(() => {
            fitnessData = {};
            updateDashboard();
            renderWeeklyChart();
        });
    }
}
