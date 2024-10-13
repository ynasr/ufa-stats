const CSV_URLS = {
    1: {
        qb: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRPTNVO4dlNhgG_atRMPgWezrrS_NQOqAI4X5_4p8CSDyS73ffnfIkg2nBYqale3eRSgQJmxbE-mCqf/pub?gid=773674420&single=true&output=csv',
        wr: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRPTNVO4dlNhgG_atRMPgWezrrS_NQOqAI4X5_4p8CSDyS73ffnfIkg2nBYqale3eRSgQJmxbE-mCqf/pub?gid=533704836&single=true&output=csv'
    },
    2: {
        qb: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQHMhPDxWk4iBo5RNf4NclytFQvkZBgehiovBhaoPGg5CZmRp5_zntFWxhTENbGc1h_P1Ah3WpQEklF/pub?gid=773674420&single=true&output=csv',
        wr: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQHMhPDxWk4iBo5RNf4NclytFQvkZBgehiovBhaoPGg5CZmRp5_zntFWxhTENbGc1h_P1Ah3WpQEklF/pub?gid=533704836&single=true&output=csv'
    },
    3: {
        qb: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4uo_4mfncHJM4qkdut4sgsHVwfRSJ3PYuTWNspGjbw6-2JatM_WHdiIOHNKuSLhgpJhkUKb29sgdT/pub?gid=773674420&single=true&output=csv',
        wr: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4uo_4mfncHJM4qkdut4sgsHVwfRSJ3PYuTWNspGjbw6-2JatM_WHdiIOHNKuSLhgpJhkUKb29sgdT/pub?gid=533704836&single=true&output=csv'
    }
};

const QB_COLUMNS = ['Qbs', 'Yards', 'TDs', 'Int', 'Extra Points', 'Completions', 'Attempts', 'Yards/completion', 'Completion %'];
const WR_COLUMNS = ['Players', 'Catches', 'Targets', 'Yards', 'Tds', 'Extra Points', 'Yards/Reception', 'Catch Percentage', 'Defensive Int', 'Flags Pulled'];

let allData = {};

async function fetchData(season, position) {
    const url = CSV_URLS[season][position];

    try {
        const response = await fetch(url);
        const data = await response.text();
        return Papa.parse(data, { header: true }).data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

function createTable(data, columns) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Create header row
    const headerRow = document.createElement('tr');
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Create data rows
    data.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(column => {
            const td = document.createElement('td');
            td.textContent = row[column] || '';
            tr.appendChild(td);
        });
        tr.addEventListener('click', () => showPlayerCard(row[columns[0]]));
        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    return table;
}

function showPlayerCard(playerName) {
    const modal = document.getElementById('player-modal');
    const playerNameElement = document.getElementById('player-name');
    const playerStatsElement = document.getElementById('player-stats');

    playerNameElement.textContent = playerName;
    playerStatsElement.innerHTML = '';

    const seasons = Object.keys(CSV_URLS);
    const positions = ['qb', 'wr'];

    let playerStats = {};

    seasons.forEach(season => {
        positions.forEach(position => {
            const data = allData[season][position];
            console.log(data);
            console.log(playerName);
            const player = data.find(p => p[position === 'qb' ? 'Qbs' : 'Players'] === playerName);
            if (player) {
                Object.keys(player).forEach(stat => {
                    if (!playerStats[stat]) {
                        playerStats[stat] = {};
                    }
                    playerStats[stat][season] = player[stat];
                });
            }
        });
    });

    // Create a table for player stats
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Header row
    const headerRow = document.createElement('tr');
    const statHeader = document.createElement('th');
    statHeader.textContent = 'Stat';
    headerRow.appendChild(statHeader);
    seasons.forEach(season => {
        const th = document.createElement('th');
        th.textContent = `Season ${season}`;
        headerRow.appendChild(th);
    });
    const totalHeader = document.createElement('th');
    totalHeader.textContent = 'Total';
    headerRow.appendChild(totalHeader);
    thead.appendChild(headerRow);

    // Stat rows
    Object.keys(playerStats).forEach(stat => {
        if (stat !== 'Qbs' && stat !== 'Player or Players') {
            const tr = document.createElement('tr');
            const statName = document.createElement('td');
            statName.textContent = stat;
            tr.appendChild(statName);

            let total = 0;
            seasons.forEach(season => {
                const td = document.createElement('td');
                const value = playerStats[stat][season] || '';
                td.textContent = value;
                if (!isNaN(value)) {
                    total += parseFloat(value);
                }
                tr.appendChild(td);
            });

            const totalCell = document.createElement('td');
            totalCell.textContent = isNaN(total) ? '' : total.toFixed(2);
            tr.appendChild(totalCell);

            tbody.appendChild(tr);
        }
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    playerStatsElement.appendChild(table);

    modal.style.display = 'block';
}

async function updateTable() {
    const season = document.getElementById('season-select').value;
    const position = document.getElementById('position-select').value;
    const container = document.getElementById('stats-table-container');

    if (!allData[season]) {
        allData[season] = {};
    }

    if (!allData[season][position]) {
        allData[season][position] = await fetchData(season, position);
    }

    const data = allData[season][position];
    const columns = position === 'qb' ? QB_COLUMNS : WR_COLUMNS;

    container.innerHTML = '';
    container.appendChild(createTable(data, columns));
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('season-select').addEventListener('change', updateTable);
    document.getElementById('position-select').addEventListener('change', updateTable);
    updateTable();

    const modal = document.getElementById('player-modal');
    const closeBtn = document.getElementsByClassName('close')[0];

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
});
