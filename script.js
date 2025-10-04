let ANZAHL_RUNDEN = 10;

//load cards from local storage
document.addEventListener("DOMContentLoaded", () => {
	let cards = [];
	let keys = Object.keys(localStorage);

	for (let i = 0; i <= keys.length + 1; i++) {
		let obj = new Object();
		obj.id = keys[i];
		obj.data = localStorage.getItem(keys[i]);
		if (obj.id ? obj.id.startsWith('card') : false) {cards.push(obj)};
	}

	if (cards.length > 0) {
		cards.forEach(card => {
			card = createCard(card.id, JSON.parse(card.data))
		})
	}

	//load team names from local storage
	let teams = document.querySelectorAll('[data-team]');
	teams.forEach(team => {
		let name = localStorage.getItem(`team-${team.dataset.team}`);
		if (name) {
			team.innerText = name;
		} else {
			team.innerText = 'Team ' + team.dataset.team;
		}
	})
})

window.addEventListener('keydown', async e => {
	// create new cards, retrieving data from json
	if (e.key === ' ' && e.shiftKey) {
		let id = 0;
		while (true) {
			if (document.querySelector(`#card-${id}`)) {
				id++;
			} else {
				const data = await fetch('songs.json');
				let tracks = await data.json();
				let totWidth = window.visualViewport.width;
				let totHeight = window.visualViewport.height;
				const mousePos = await getCoordinates();

				const cData = new Object();
				cData.left = (mousePos.x / totWidth * 100) - 5 + '%';
				cData.top = (mousePos.y / totHeight * 100) - 5 + '%';
				cData.reveal = false;
				cData.hidden = false;
				cData.year = tracks[id].year;
				cData.name = tracks[id].name;
				cData.artist = tracks[id].artist;

				createCard(`card-${id}`, cData);
				localStorage.setItem(`card-${id}`, JSON.stringify(cData))
				break;
			}
		}
	}
	//show rules and info
	if (e.key === 'I') {
		document.querySelector('.rulesWrapper').classList.toggle('hide');
	}
})
async function getCoordinates() {
    return new Promise(resolve => {
        function handleClick(e) {
            const x = e.clientX;
            const y = e.clientY;

            document.removeEventListener('click', handleClick);
            resolve({ x, y });
        }

        document.addEventListener('click', handleClick);
    });
}

function addMovement(card) {
	let dragging = false;
	card.addEventListener('mousedown', () => {
		dragging = true;
		card.style.zIndex = 999; //🕊️
	})
	window.addEventListener('mouseup', () => {
		dragging = false;
		card.style.zIndex = '';

		updateLocalStorage(card.id, 'left', card.style.left)
		updateLocalStorage(card.id, 'top', card.style.top)
	})
	card.addEventListener('mousemove', b => {
		if (!dragging) return;

		let totWidth = window.visualViewport.width;
		let totHeight = window.visualViewport.height;

		let newLeft = (b.clientX - 0.5 * card.offsetWidth) / totWidth;
		let newTop = (b.clientY - 0.5 * card.offsetHeight) / totHeight;

		let c = totWidth * 0.02 / totWidth
		let xLocks = getLockPoints(totWidth, ANZAHL_RUNDEN)
		for (let x of xLocks) {
			x = x / totWidth;
			if (x - c < newLeft && newLeft < x + c) {
				newLeft = x;
				break;
			}
		}
		let teams = document.querySelectorAll('[data-team]').length;
		let yLocks = getLockPoints(totHeight, teams)
		for (let y of yLocks) {
			y = y / totHeight;
			if (y - c < newTop && newTop < y + c) {
				newTop = y;
				break;
			}
		}
		card.style.left = newLeft > 0 ? newLeft * 100 + '%' : '2px';
		card.style.top = newTop > 0 ? newTop * 100 + '%' : '2px';
		window.getSelection().removeAllRanges()
	})
}
function getLockPoints(totalLength, parts) {
	const points = [];
	let run = 0;
	while (points.length < parts) {
		points.push(totalLength / parts * run)
		run++;
	}
	return points;
}

function handleCard(card) {
	card.addEventListener('keydown', e => {
		// reveal card
		if (e.key === ' ' && !e.shiftKey) {
			let year = card.dataset.year;
			let name = card.dataset.name;
			let artist = card.dataset.artist;
			card.innerHTML = '<h4>' + year + '</h4><div>' + name + '</div><div>' + artist + '</div>';
			updateLocalStorage(card.id, 'reveal', true)
		}
		// hide card
		if (e.key === 'Delete') {
			card.style.display = 'none';
			updateLocalStorage(card.id, 'hidden', true)
		}
	})
}

function createCard(id, data) {
	const card = document.createElement('div');
	card.classList.add('card');
	card.setAttribute('id', id);
	card.setAttribute('tabindex', 0);
	card.style.left = data.left;
	card.style.top = data.top;
	card.dataset.year = data.year;
	card.dataset.name = data.name;
	card.dataset.artist = data.artist;

	if (!data.reveal) {
		card.innerText = '----'
	} else {
		card.innerHTML = '<h4>' + data.year + '</h4><div>' + data.name + '</div><div>' + data.artist + '</div>';
	}

	if (data.hidden) {
		card.style.display = 'none';
	}

	const cardWrapper = document.querySelector('#cardWrapper');
	cardWrapper.appendChild(card);
	card.focus();
	addMovement(card);
	handleCard(card);
}

function changeTeamName(teamID, name) {
	let h3 = document.querySelector(`[data-team="${teamID}"]`);
	h3.innerText = name;
	localStorage.setItem(`team-${teamID}`, name);
}

function teamAddRemove(teamID) {
	if (teamID) {
		document.querySelector(`[data-team="${teamID}"]`).parentElement.remove();
		localStorage.removeItem(`team-${teamID}`);
	} else {
		let teams = document.querySelectorAll('[data-team]');
		let newID = teams.length + 1;
		const div = document.createElement('div');
		div.innerHTML = `<h3 data-team="${newID}">Team ${newID}</h3><input type="text" id="team${newID}-bonus" value="3" min="0">`;
		document.querySelector('body').appendChild(div);
	}
}

function updateLocalStorage(card, key, value) {
	let cData = JSON.parse(localStorage.getItem(card));
	cData[key] = value;
	localStorage.setItem(card, JSON.stringify(cData));
}

function hilfe() {
	console.log(`Anzahl der Runden:    ${10} (anpassbar mit (int) "ANZAHL_RUNDEN")\nTeamname ändern:      changeTeamName((int) teamID, (string) name)\nTeam hinzufügen:      teamAddRemove()\nTeam entfernen:       teamAddRemove((int) teamID)\n\nneue Karte:           shift + Leertaste\nKarte aufdecken:      Fokus auf Karte + Leertaste\n\nRegeln anzeigen:      shift + i\nDiese Hilfe anzeigen: 'hilfe()';`);
}
hilfe();