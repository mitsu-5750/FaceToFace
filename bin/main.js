'use strict';
let constants, util;

let use_face_list = [];
let player_scores = [];
let turn_limit = 0;
let turn_player = 0;

const OPERATION = document.getElementById('OPERATION');

async function init() {
	await import('./constants.js').then((value) => { constants = value });
	await import('./util.js').then((value) => { util = value });

	let face_list;
	find_face_list().then((value) => {
		face_list = value;
		document.getElementById('READ_IMAGE_LIMIT').innerHTML = `※最大で${value.length}枚使用できます`;
	});

	document.getElementById('GAME_START_BTN').addEventListener('click', () => {
		game_start(face_list, document.getElementById('USE_CARD_LIMIT').value);
	});

	let option_data = util.getStorage(constants.STORAGE_KEY);
	if (!option_data) {
		return;
	}

	document.getElementById('PLAYER_LIMIT').value = option_data['player_limit'];
	document.getElementById('USE_CARD_LIMIT').value = option_data['use_card_limit'];
	document.getElementById('TARN_LIMIT').value = option_data['tarn_limit'];
}


async function find_face_list() {
	let face_list = [];

	let count = 0;
	while (true) {
		let img_src = `face_list/${count}.jpg`;

		let responce = await fetch(img_src);
		if (responce.status == 200) {
			face_list.push(img_src);
			count++;
			continue;
		}

		return face_list;
	}
}

async function game_start(face_list, limit) {
	try {
		use_face_list = find_use_face_list(face_list, limit);
	} catch (e) {
		alert(e);
		throw e;
	}

	for (let i = 1; i <= document.getElementById('PLAYER_LIMIT').value; i++) {
		player_scores.push({ 'name': `プレイヤー${i}`, 'score': 0 });
	}

	let option_obj = {
		'player_limit': document.getElementById('PLAYER_LIMIT').value,
		'use_card_limit': document.getElementById('USE_CARD_LIMIT').value,
		'tarn_limit': document.getElementById('TARN_LIMIT').value,
	}
	util.setStorage(constants.STORAGE_KEY, option_obj);


	turn_limit = document.getElementById('TARN_LIMIT').value;

	document.getElementById('RESERVE').style.display = 'none';
	document.getElementById('GAME').style.display = 'block';
	await util.sleep(10);
	document.getElementById('GAME').style.opacity = 1;

	reserve_turn();
}

function reserve_turn() {
	if (is_all_use_card()) {
		end_game();
		return;
	}

	document.getElementById('CARD_BACK').style.zIndex = 1;
	document.getElementById('CARD_IMG').style.zIndex = 0;

	if (turn_player == turn_limit) {
		turn_player = 0;
	}

	turn_player++;
	document.getElementById('PLAYER_TURN').innerHTML = `プレイヤー${turn_player}のターン`;

	OPERATION.innerHTML = '';

	let turn_button = document.createElement('button');
	turn_button.id = 'TURN_BTN';
	turn_button.innerHTML = `プレイヤー${turn_player}がカードをめくる`;
	OPERATION.appendChild(turn_button);

	turn_button.addEventListener('click', () => {
		turn();
	});
}

function turn() {
	turn_card_anime();

	let use_index;
	while (true) {
		use_index = Math.floor(Math.random() * use_face_list.length);

		if (use_face_list[use_index]['use_count'] == turn_limit) {
			continue;
		}

		document.getElementById('CARD_IMG').src = use_face_list[use_index]['src'];
		use_face_list[use_index]['use_count']++;
		break;
	}

	OPERATION.innerHTML = '';

	if (use_face_list[use_index]['use_count'] == 1) {
		let button = document.createElement('button');
		button.id = 'COMFILM_BTN';
		button.innerHTML = '名前をつけて次に進む';
		OPERATION.appendChild(button);

		button.addEventListener('click', () => {
			reserve_turn();
		});
		return;
	}

	for (let player of player_scores) {
		let button = document.createElement('button');
		button.innerHTML = `${player['name']}が回答`;
		OPERATION.appendChild(button);

		button.addEventListener('click', () => {
			player.score++;
			reserve_turn();
		});
	}

	let pass_button = document.createElement('button');
	pass_button.id = 'PASS_BTN';
	pass_button.innerHTML = 'パスする';
	OPERATION.appendChild(pass_button);
	pass_button.addEventListener('click', () => {
		reserve_turn();
	});
}

function turn_card_anime() {
	let CARD = document.getElementById('CARD');

	CARD.style.transform = 'rotateY(90deg)';

	setTimeout(() => {
		document.getElementById('CARD_BACK').style.zIndex = 0;
		document.getElementById('CARD_IMG').style.zIndex = 1;
		CARD.style.transform = 'rotateY(0deg)';
	}, 300);
}


async function end_game() {
	document.getElementById('GAME').style.display = 'none';
	document.getElementById('RESULT').style.display = 'block';
	await util.sleep(300);
	document.getElementById('RESULT').style.opacity = 1;

	let order_by_scores = player_scores.sort(function (a, b) {
		return (a.score > b.score) ? -1 : 1;
	});

	for (let player of order_by_scores) {
		document.getElementById('RESULT_DATA').insertAdjacentHTML('beforeend', `<p class="players">${player.name}:<br>${player.score}</p>`);
	}

	let players = document.getElementsByClassName('players');
	for (let i = players.length - 1; i >= 0; i--) {
		await util.sleep(1000);
		players[i].style.opacity = 1;
	}
}

function is_all_use_card() {
	for (let use_face of use_face_list) {
		if (use_face['use_count'] == turn_limit) {
			continue;
		}

		return false;
	}
	return true;
}


function find_use_face_list(face_list, limit) {
	let use_face_list = [];
	let use_face_index = [];

	if (limit < 2) {
		throw new Error('ゲームで使用する画像枚数は2枚以上にしてください');
	}

	if (face_list.length < limit) {
		throw new Error('ゲームで使用する画像枚数が使用できる画像枚数を超えています');
	}

	let loop_count = 0;
	while (true) {
		let random_index = Math.floor(Math.random() * face_list.length);
		if (use_face_index.includes(random_index)) {
			continue;
		}

		let img_src = face_list[random_index];
		use_face_list.push({ 'src': img_src, 'use_count': 0, });
		use_face_index.push(random_index);

		loop_count++;

		if (loop_count == limit) {
			return use_face_list;
		}
	}
}

window.addEventListener('load', init);
