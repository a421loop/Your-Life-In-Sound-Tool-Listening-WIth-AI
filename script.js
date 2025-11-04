// Global variables
let recognizer;
let modelLoaded = false;
let isListening = false;
let detectionLog = [];

// DOM elements
const loadBtn = document.getElementById('loadBtn');
const stopBtn = document.getElementById('stopBtn');
const modelUrlInput = document.getElementById('modelUrl');
const statusDiv = document.getElementById('status');
const visualizer = document.getElementById('visualizer');
const saveLogBtn = document.getElementById('saveLogBtn');
const clearLogBtn = document.getElementById('clearLogBtn');
const logDiv = document.getElementById('log');

// Status message helper
function showStatus(message, type = 'info') {
    statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
}

// Update visualizer
function updateVisualizer(label, confidence) {
    const bgColor = interpolateColor(confidence);
    
    visualizer.style.background = bgColor;
    visualizer.querySelector('.label').textContent = label;
    visualizer.querySelector('.confidence').textContent = `${(confidence * 100).toFixed(1)}% confidence`;

    // Log detection
    const timestamp = new Date().toLocaleTimeString();
    detectionLog.push({ timestamp, label, confidence: (confidence * 100).toFixed(1) });
    
    // Show last 10 in log area
    const recentLogs = detectionLog.slice(-10).reverse();
    logDiv.innerHTML = recentLogs.map(log => 
        `<div class="log-entry">${log.timestamp} — ${log.label} (${log.confidence}%)</div>`
    ).join('');

    if (detectionLog.length > 0) {
        saveLogBtn.disabled = false;
    }
}

// Color interpolation based on confidence
function interpolateColor(confidence) {
    // Low confidence: reddish
    // High confidence: lavender
    const lowColor = [250, 210, 210];   // #FAD2D2
    const highColor = [230, 210, 250];  // #E6D2FA
   
    const r = Math.round(lowColor[0] + (highColor[0] - lowColor[0]) * confidence);
    const g = Math.round(lowColor[1] + (highColor[1] - lowColor[1]) * confidence);
    const b = Math.round(lowColor[2] + (highColor[2] - lowColor[2]) * confidence);
    
    return `rgb(${r}, ${g}, ${b})`;
}

// Load model from URL
async function loadModel() {
    const url = modelUrlInput.value.trim();
    
    if (!url) {
        showStatus('Please paste your model URL', 'error');
        return;
    }

    // Ensure URL ends with / for metadata.json and model.json to load correctly
    const baseURL = url.endsWith('/') ? url : url + '/';

    try {
        showStatus('Loading your model...', 'info');
        loadBtn.disabled = true;

        // Create a speech recognizer with the custom model
        recognizer = speechCommands.create(
            'BROWSER_FFT',
            undefined,
            baseURL + 'model.json',
            baseURL + 'metadata.json'
        );

        await recognizer.ensureModelLoaded();
        
        const labels = recognizer.wordLabels();
        showStatus(`Model loaded successfully. Found ${labels.length} classes: ${labels.join(', ')}`, 'success');
        
        modelLoaded = true;
        startListening();

    } catch (error) {
        showStatus(`Error loading model: ${error.message}`, 'error');
        console.error('Load error:', error);
        loadBtn.disabled = false;
    }
}

// Start listening
async function startListening() {
    if (!modelLoaded) return;

    try {
        await recognizer.listen(result => {
            const scores = result.scores;
            const labels = recognizer.wordLabels();
            
            // Find the label with highest confidence
            let maxIndex = 0;
            let maxScore = scores[0];
            
            for (let i = 1; i < scores.length; i++) {
                if (scores[i] > maxScore) {
                    maxScore = scores[i];
                    maxIndex = i;
                }
            }
            
            const detectedLabel = labels[maxIndex];
            updateVisualizer(detectedLabel, maxScore);
            
        }, {
            probabilityThreshold: 0.5,
            invokeCallbackOnNoiseAndUnknown: true,
            overlapFactor: 0.5
        });

        isListening = true;
        loadBtn.classList.add('hidden');
        stopBtn.classList.remove('hidden');
        showStatus('Listening... Speak or make sounds', 'success');

    } catch (error) {
        showStatus(`Error accessing microphone: ${error.message}`, 'error');
        console.error('Listen error:', error);
    }
}

// Stop listening
function stopListening() {
    if (recognizer && isListening) {
        recognizer.stopListening();
        isListening = false;
        stopBtn.classList.add('hidden');
        loadBtn.classList.remove('hidden');
        showStatus('Stopped listening', 'info');
    }
}

// Save log as CSV
function saveLog() {
    if (detectionLog.length === 0) return;

    const csv = 'Timestamp,Label,Confidence\n' + 
                detectionLog.map(log => `${log.timestamp},${log.label},${log.confidence}`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `listening-log-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showStatus('Log saved successfully', 'success');
}

// Clear log
function clearLog() {
    detectionLog = [];
    logDiv.innerHTML = '<div class="log-entry">No detections yet...</div>';
    saveLogBtn.disabled = true;
    showStatus('Log cleared', 'info');
}

// Event listeners
loadBtn.addEventListener('click', loadModel);
stopBtn.addEventListener('click', stopListening);
saveLogBtn.addEventListener('click', saveLog);
clearLogBtn.addEventListener('click', clearLog);

// Allow Enter key to load model
modelUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadModel();
});

// Initialize log display
logDiv.innerHTML = '<div class="log-entry">No detections yet...</div>';

console.log('Listening with AI loaded successfully');
