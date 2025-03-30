// VR destinations configuration
const destinations = {
    'great-wall': {
        skyImage: 'https://images.pexels.com/photos/123456/wall-360.jpg',
        title: 'Great Wall of China',
        description: 'Explore one of the greatest wonders of the world'
    },
    'math-lab': {
        skyImage: 'https://images.pexels.com/photos/123456/math-sky.jpg',
        labType: 'math',
        title: 'Interactive Math Lab'
    },
    'physics-lab': {
        skyImage: 'https://images.pexels.com/photos/123456/physics-sky.jpg',
        labType: 'physics',
        title: 'Physics Lab Simulations'
    },
    'chemistry-lab': {
        skyImage: 'https://images.pexels.com/photos/123456/chemistry-sky.jpg',
        labType: 'chemistry',
        title: 'Chemistry Lab Experiments'
    }
};

// Progress Tracking System
const progress = {
    init() {
        this.data = JSON.parse(localStorage.getItem('edugenie-progress')) || {
            completedExperiments: [],
            scores: {},
            lastAccessed: new Date().toISOString()
        };
        return this;
    },
    completeExperiment(experimentId, score = 100) {
        if (!this.data.completedExperiments.includes(experimentId)) {
            this.data.completedExperiments.push(experimentId);
        }
        this.data.scores[experimentId] = Math.max(score, this.data.scores[experimentId] || 0);
        this.save();
    },
    getProgress() {
        return {
            completed: this.data.completedExperiments.length,
            total: Object.keys(destinations).length,
            score: Object.values(this.data.scores).reduce((a,b) => a + b, 0) / 
                  Math.max(Object.keys(this.data.scores).length, 1)
        };
    },
    save() {
        localStorage.setItem('edugenie-progress', JSON.stringify(this.data));
    }
}.init();

// Initialize VR experience
function initVR() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;
    
    const destination = localStorage.getItem('currentDestination') || 'great-wall';
    const config = destinations[destination];
    
    if (config) {
        // Set sky image
        const sky = document.querySelector('a-sky');
        if (sky) sky.setAttribute('src', config.skyImage);
        
        // Set title
        const title = document.createElement('a-text');
        title.setAttribute('value', config.title);
        title.setAttribute('color', '#FFF');
        title.setAttribute('position', '0 2 -3');
        title.setAttribute('align', 'center');
        scene.appendChild(title);
    }
    
    // Add VR controls help
    const helpText = document.createElement('a-text');
    helpText.setAttribute('value', 'Use WASD keys to move\nMouse to look around');
    helpText.setAttribute('color', '#FFF');
    helpText.setAttribute('position', '0 1.5 -3');
    helpText.setAttribute('align', 'center');
    scene.appendChild(helpText);

    // Initialize lab if applicable
    if (config.labType) {
        initLab();
    }
}

// Start VR experience
function startVR(destination) {
    try {
        localStorage.setItem('currentDestination', destination);
        window.location.href = destination + '.html';
    } catch (error) {
        console.error('Error starting VR experience:', error);
        alert('Could not start VR experience. Please try again.');
    }
}

// Initialize lab experience
function initLab() {
    const labType = destinations[localStorage.getItem('currentDestination')].labType;
    
    switch(labType) {
        case 'math':
            createMathLab();
            break;
        case 'physics':
            createPhysicsLab();
            break;
        case 'chemistry':
            createChemistryLab();
            break;
    }
}

// Chemistry Lab Functions
function createChemistryLab() {
    // Molecule interaction logic
    const atoms = document.querySelectorAll('.atom');
    atoms.forEach(atom => {
        atom.addEventListener('mousedown', startDrag);
        atom.addEventListener('mouseup', endDrag);
    });

    // Bond creation
    document.addEventListener('mouseup', () => {
        const activeAtoms = document.querySelectorAll('.atom[dragging]');
        if (activeAtoms.length === 2) {
            createBond(activeAtoms[0], activeAtoms[1]);
        }
    });
}

function startDrag(e) {
    this.setAttribute('dragging', 'true');
    this.setAttribute('animation', {
        property: 'position',
        dur: 200,
        to: {x: this.object3D.position.x, y: this.object3D.position.y, z: this.object3D.position.z}
    });
}

function endDrag(e) {
    this.removeAttribute('dragging');
    this.removeAttribute('animation');
}

function createBond(atom1, atom2) {
    const pos1 = atom1.object3D.position;
    const pos2 = atom2.object3D.position;
    
    const bond = document.createElement('a-entity');
    bond.setAttribute('line', {
        start: {x: pos1.x, y: pos1.y, z: pos1.z},
        end: {x: pos2.x, y: pos2.y, z: pos2.z},
        color: '#FFFFFF'
    });
    bond.setAttribute('class', 'bond');
    document.querySelector('a-scene').appendChild(bond);
}

// Physics Lab Functions
function createPhysicsLab() {
    // Add physics equation solver UI
    const equationUI = document.createElement('a-entity');
    equationUI.setAttribute('position', '0 1.5 -3');
    equationUI.innerHTML = `
        <a-text value="Physics Equation Solver" color="#FFF" position="0 0.5 0" align="center"></a-text>
        <a-text value="F = ma" color="#FFF" position="0 0 0" align="center"></a-text>
        <a-text value="Click to solve" color="#FFF" position="0 -0.5 0" align="center"></a-text>
    `;
    equationUI.addEventListener('click', solvePhysicsEquation);
    document.querySelector('a-scene').appendChild(equationUI);
}

function solvePhysicsEquation() {
    // Simple physics equation solver
    const mass = 5; // kg
    const acceleration = 9.8; // m/s²
    const force = mass * acceleration;
    
    const result = document.createElement('a-text');
    result.setAttribute('value', `F = ${force} N (m=${mass}kg, a=${acceleration}m/s²)`);
    result.setAttribute('color', '#FFF');
    result.setAttribute('position', '0 1 -3');
    result.setAttribute('align', 'center');
    document.querySelector('a-scene').appendChild(result);
}

// Math Lab Functions
function createMathLab() {
    // Add 3D graphing calculator
    const graph = document.createElement('a-entity');
    graph.setAttribute('position', '0 1 -3');
    graph.innerHTML = `
        <a-text value="3D Graphing Calculator" color="#FFF" position="0 0.5 0" align="center"></a-text>
        <a-box color="#FF0000" width="1" height="1" depth="1" position="-1 0 0"></a-box>
        <a-text value="y = x²" color="#FFF" position="-1 0.5 0" align="center"></a-text>
    `;
    document.querySelector('a-scene').appendChild(graph);
}

// Teacher Portal Functions
function generateClassReport() {
    return {
        date: new Date().toLocaleDateString(),
        progress: progress.getProgress(),
        popularExperiments: progress.data.completedExperiments
            .reduce((acc, id) => {
                acc[id] = (acc[id] || 0) + 1;
                return acc;
            }, {})
    };
}

// Role-based functionality
function setRole(role) {
    localStorage.setItem('userRole', role);
}

function getRole() {
    return localStorage.getItem('userRole');
}

// Theme switching
function toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark', savedTheme === 'dark');
}

// Initialize theme on page load
applySavedTheme();

// Forum Navigation
function navigateToThread(threadId) {
    // In a real implementation, this would load a specific thread
    console.log(`Navigating to thread ${threadId}`);
    alert(`Thread ${threadId} would load in a full implementation`);
}

// Chat functionality
function sendMessage() {
    const messageInput = document.getElementById('chat-input');
    const message = messageInput.value.trim();
    if (message) {
        const chatContainer = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'bg-gray-100 dark:bg-gray-700 p-2 rounded ml-6';
        messageElement.innerHTML = `
            <p class="font-bold">You:</p>
            <p>${message}</p>
        `;
        chatContainer.appendChild(messageElement);
        messageInput.value = '';
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// Initialize when page loads
if (document.readyState === 'complete') {
    initVR();
} else {
    window.addEventListener('load', initVR);
}

// Track experiment completion
function completeExperiment(experimentId) {
    progress.completeExperiment(experimentId);
    updateProgressUI();
    
    // Confetti effect
    const confetti = document.createElement('a-entity');
    confetti.setAttribute('particle-system', {
        preset: 'default',
        color: '#FFC107,#E91E63,#9C27B0,#2196F3',
        particleCount: 200,
        positionSpread: {x: 5, y: 5, z: 5}
    });
    document.querySelector('a-scene').appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
    
    // Play success sound
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
    audio.volume = 0.3;
    audio.play();
}

function updateProgressUI() {
    const progressData = progress.getProgress();
    document.querySelectorAll('.progress-indicator').forEach(el => {
        el.textContent = `${progressData.completed}/${progressData.total}`;
    });
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if(e.key === 'b') window.location.href = '/';
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('Critical error:', e.message);
    alert('An error occurred. Please refresh the page.');
});