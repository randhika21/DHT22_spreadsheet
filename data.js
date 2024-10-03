let allData = [];

async function fetchData() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbyQWJdExXiwdsJXh9Uuk1_-V03hlBU9IMdpI7-bHVBdKXiU--5HOKa9lm8X2rxgFvGXCA/exec');
        const data = await response.json();

        allData = data;

        if (allData.length > 1000) {
            allData = allData.slice(allData.length - 1000);
        }

        updateTable();
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

    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const year = date.getUTCFullYear();
    
    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = date.toLocaleTimeString('en-US', { timeZone: 'Asia/Jakarta', hour12: true });

    return { formattedDate, formattedTime };
}

function updateCurrentValues() {
    const latestData = allData[allData.length - 1];
    document.getElementById('currentTemperature').innerText = `${latestData.temperature} °C`;
    document.getElementById('currentHumidity').innerText = `${latestData.humidity} %`;
}

document.getElementById('applyFilters').addEventListener('click', updateTable);

function updateTable() {
    const tableBody = document.getElementById('data-body');
    const selectedCount = parseInt(document.getElementById('dataCountSelect').value);
    const dateFilterValue = document.getElementById('dateFilter').value;
    const timeFilterValue = document.getElementById('timeFilter').value;

    const tempMin = parseFloat(document.getElementById('temperatureFilterMin').value) || -Infinity;
    const tempMax = parseFloat(document.getElementById('temperatureFilterMax').value) || Infinity;
    const humMin = parseFloat(document.getElementById('humidityFilterMin').value) || -Infinity;
    const humMax = parseFloat(document.getElementById('humidityFilterMax').value) || Infinity;

    tableBody.innerHTML = '';

    const filteredData = allData.filter(row => {
        const { formattedDate, formattedTime } = formatDateToJakarta(row.timestamp);
        const matchesDate = dateFilterValue ? formattedDate === dateFilterValue : true;
        const matchesTime = timeFilterValue ? formattedTime.startsWith(timeFilterValue) : true;

        const matchesTemperature = row.temperature >= tempMin && row.temperature <= tempMax;
        const matchesHumidity = row.humidity >= humMin && row.humidity <= humMax;

        return matchesDate && matchesTime && matchesTemperature && matchesHumidity;
    });

    const reversedData = filteredData.slice().reverse().slice(0, selectedCount);
    reversedData.forEach(row => {
        const { formattedDate, formattedTime } = formatDateToJakarta(row.timestamp);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formattedDate}</td>
            <td>${formattedTime}</td>
            <td>${row.temperature} °C</td>
            <td>${row.humidity} %</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Toggle sidebar visibility
document.getElementById('toggleSidebar').addEventListener('click', function() {
    var sidebar = document.getElementById('sidebar');
    var content = document.getElementById('content');
    var overlay = document.getElementById('overlay');

    sidebar.classList.toggle('active');
    content.classList.toggle('shifted');
    overlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
});

// Hide sidebar and overlay when clicking outside
document.getElementById('overlay').addEventListener('click', function() {
    var sidebar = document.getElementById('sidebar');
    this.style.display = 'none';
    sidebar.classList.remove('active');
    document.getElementById('content').classList.remove('shifted');
});

// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
});

document.getElementById('downloadBtn').addEventListener('click', function() {
    const table = document.getElementById('data-body');
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add headers
    csvContent += "Date,Time,Temperature (°C),Humidity (%)\n";

    // Add rows
    Array.from(table.rows).forEach(row => {
        const rowData = Array.from(row.cells).map(cell => cell.textContent).join(",");
        csvContent += rowData + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data.csv");
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

setInterval(fetchData, 2000); // Refresh data every 2 seconds
fetchData(); // Initial fetch
