let allData = [];
const temperatureChartCtx = document.getElementById('temperatureChart').getContext('2d');
const humidityChartCtx = document.getElementById('humidityChart').getContext('2d');

const temperatureChart = new Chart(temperatureChartCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Temperature (°C)',
            data: [],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderWidth: 2,
            fill: true,
        }]
    },
    options: {
        scales: {
            x: { title: { display: true, text: 'Timestamp' }, reverse: false },
            y: { title: { display: true, text: 'Temperature (°C)' }}
        }
    }
});

const humidityChart = new Chart(humidityChartCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Humidity (%)',
            data: [],
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderWidth: 2,
            fill: true,
        }]
    },
    options: {
        scales: {
            x: { title: { display: true, text: 'Timestamp' }, reverse: false },
            y: { title: { display: true, text: 'Humidity (%)' }}
        }
    }
});

async function fetchData() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbyQWJdExXiwdsJXh9Uuk1_-V03hlBU9IMdpI7-bHVBdKXiU--5HOKa9lm8X2rxgFvGXCA/exec');
        const data = await response.json();

        allData = data;

        if (allData.length > 20) {
            allData = allData.slice(allData.length - 20);
        }

        updateCharts();
        updateCurrentValues();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function formatDateToJakarta(timestamp) {
    const date = new Date(timestamp);
    const options = {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };

    const formattedDate = date.toLocaleString('id-ID', options).replace(', ', 'T').replace(/\./g, ':');
    const amPm = date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: true }).split(' ').pop();

    return formattedDate.replace(/ (AM|PM)$/, '') + ' ' + amPm;
}

function updateCurrentValues() {
    const latestData = allData[allData.length - 1];
    document.getElementById('currentTemperature').innerText = `${latestData.temperature} °C`;
    document.getElementById('currentHumidity').innerText = `${latestData.humidity} %`;
}

function updateCharts() {
    const recentData = allData.slice(-10);
    const labels = recentData.map(row => {
        const date = new Date(row.timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    });
    const temperatures = recentData.map(row => row.temperature);
    const humidities = recentData.map(row => row.humidity);

    temperatureChart.data.labels = labels;
    temperatureChart.data.datasets[0].data = temperatures;
    temperatureChart.update();

    humidityChart.data.labels = labels;
    humidityChart.data.datasets[0].data = humidities;
    humidityChart.update();
}

document.getElementById('toggleSidebar').addEventListener('click', function() {
    var sidebar = document.getElementById('sidebar');
    var content = document.getElementById('content');
    var overlay = document.getElementById('overlay');

    sidebar.classList.toggle('active');
    content.classList.toggle('shifted');
    overlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
});

document.getElementById('overlay').addEventListener('click', function() {
    var sidebar = document.getElementById('sidebar');
    this.style.display = 'none';
    sidebar.classList.remove('active');
    document.getElementById('content').classList.remove('shifted');
});

document.getElementById('darkModeToggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    this.textContent = isDarkMode ? '☀️' : '🌙';
});

// Removed download data functionality

setInterval(fetchData, 500);
fetchData();
