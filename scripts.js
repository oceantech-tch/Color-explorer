const baseURL = 'https://www.thecolorapi.com';
let currentSchemeType = 'monochrome';

// Helper to fetch color data
const fetchColorData = async (colorHex, endpoint = 'id', params = {}) => {
const url = new URL(`${baseURL}/${endpoint}`);
url.searchParams.append('hex', colorHex.replace('#', ''));
url.searchParams.append('format', 'json');

Object.entries(params).forEach(([key, val]) => {
    url.searchParams.append(key, val);
});

try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
} catch (err) {
    console.error('Fetch Error:', err);
    showError(err.message);
    return null;
}
}

// Display color info
const renderColorInfo = (colorData) => {
const container = document.getElementById('color-info');
container.innerHTML = `
    <h2>${colorData.name.value || 'Your Selected Color'}</h2>
    <p><strong>HEX:</strong> ${colorData.hex.value}</p>
    <p><strong>RGB:</strong> ${colorData.rgb.value}</p>
    <p><strong>HSL:</strong> ${colorData.hsl.value}</p>
    <p><strong>Contrast:</strong> For readable text, use ${colorData.contrast.value}</p>
    <p><strong>Scheme Type:</strong> ${getSchemeName(currentSchemeType)}</p>
    `;
}

// Get human-readable scheme name
const getSchemeName = (schemeType) => {
const names = {
    'monochrome': 'Monochrome',
    'analogic': 'Analogic',
    'triad': 'Triad',
    'complement': 'Complement',
    'quad': 'Quad'
};
return names[schemeType] || schemeType;
}

// Render color scheme
const renderColorScheme = (colors) => {
const container = document.getElementById('scheme-container');
container.innerHTML = `
    <div class="scheme-info">
        ${colors.length}-color ${getSchemeName(currentSchemeType)} Scheme
    </div>
    ${colors.map(color => `
        <div class="color-box" style="background: ${color.hex.value};" 
            title="Click to copy ${color.hex.value}" 
            onclick="copyToClipboard('${color.hex.value}')">
        <small>${color.hex.value}</small>
        </div>
    `).join('')}
    `;
}

// Copy color to clipboard
const copyToClipboard = (text) => {
navigator.clipboard.writeText(text).then(() => {
    alert(`Copied ${text} to clipboard!`);
}).catch(err => {
    console.error('Copy failed:', err);
});
}

const showLoading = () => {
document.getElementById('scheme-container').innerHTML =
    '<p class="loading">Generating your color scheme...</p>';
}

const showError = (message) => {
document.getElementById('color-info').innerHTML = `
    <div style="color: red; padding: 15px; background: #ffeeee; border-radius: 4px;">
        <strong>Error:</strong> ${message}
    </div>
    `;
}

// Form handler
document.getElementById('color-form').addEventListener('submit', async (e) => {
e.preventDefault();
const generateBtn = document.getElementById('generate-btn');
const originalBtnText = generateBtn.textContent;

// Show loading state on button
generateBtn.textContent = 'Generating...';
generateBtn.disabled = true;

showLoading();

const colorHex = document.getElementById('color-picker').value;
currentSchemeType = document.getElementById('scheme-mode').value;

try {
    // Fetch base color info
    const colorData = await fetchColorData(colorHex);
    if (colorData) renderColorInfo(colorData);

    // Fetch color scheme
    const schemeData = await fetchColorData(colorHex, 'scheme', {
        mode: currentSchemeType,
        count: 6
    });

    if (schemeData) {
        renderColorScheme(schemeData.colors);
        // Add smooth scroll to results
        document.getElementById('scheme-container').scrollIntoView({
            behavior: 'smooth'
        });
    }
} catch (err) {
    showError("Failed to load color data. Please check your connection and try again.");
} finally {
    // Restore button state
    generateBtn.textContent = originalBtnText;
    generateBtn.disabled = false;
}
});

// Initialize with default color
window.addEventListener('DOMContentLoaded', () => {
document.getElementById('color-form').dispatchEvent(new Event('submit'));
});