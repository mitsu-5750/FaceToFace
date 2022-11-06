'use strict';

let use_face_list = [];
let limit = 1;
let repeat_count = 2;

function init() {
	let face_list;
	find_face_list().then((value) => {
		face_list = value;
		document.getElementById('READ_IMAGE_LIMIT').innerHTML = `使用できる画像の枚数:${value.length}枚`;
		game_start(value, 3);
	});

	document.getElementById('GAME_START_BTN').addEventListener('click', () => {
		game_start(face_list, document.getElementById('USE_CARD_LIMIT').value);
	});
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

function game_start(face_list, limit) {
	try {
		use_face_list = find_use_face_list(face_list, limit);
	} catch (e) {
		alert(e);
		throw e;
	}

	turn();
}

function turn() {
	if (is_all_use_card()) {
		return;
	}

	let use_index;
	while (true) {
		use_index = Math.floor(Math.random() * use_face_list.length);

		if (use_face_list[use_index]['use_count'] == repeat_count) {
			continue;
		}

		document.getElementById('CARD_IMG').src = use_face_list[use_index]['src'];
		use_face_list[use_index]['use_count']++;
		break;
	}
	
}


function is_all_use_card() {
	for (let use_face of use_face_list) {
		if (use_face['use_count'] == repeat_count) {
			continue;
		}

		return false;
	}
	return true;
}


function find_use_face_list(face_list, limit = 0) {
	let use_face_list = [];
	let use_face_index = [];

	if (limit <= 0) {
		throw new Error('ゲームで使用する画像枚数は枚以上にしてください');
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
		use_face_list.push({ 'src': img_src, 'use_count': 0 });
		use_face_index.push(random_index);

		if (loop_count == limit) {
			return use_face_list;
		}

		loop_count++;
	}
}


window.addEventListener('load', init);