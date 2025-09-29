let ANZAHL_RUNDEN = 10;

//load cards from local storage
document.addEventListener("DOMContentLoaded", () => {
	let cards = [];
	let keys = Object.keys(localStorage);
	let i = keys.length;

    while ( i-- ) {
		let obj = new Object()
		obj.id = keys[i]
		obj.data = localStorage.getItem(keys[i])
        cards.push(obj);
    }
	cards.forEach(card => {
		card = createCard(card.id, JSON.parse(card.data))
	})
})

window.addEventListener('keydown', async e => {
	console.log(e)
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
		let teams = document.querySelectorAll('h3').length;
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

function updateLocalStorage(card, key, value) {
	let cData = JSON.parse(localStorage.getItem(card));
	cData[key] = value;
	localStorage.setItem(card, JSON.stringify(cData));
}

function hilfe() {
	console.log(`Anzahl der Runden:    ${10} (anpassbar mit ANZAHL_RUNDEN);\nneue Karte:           shift + Leertaste;\nRegeln anzeigen:      shift + i;\nDiese Hilfe anzeigen: 'hilfe()';`);
}
hilfe();