'use strict';

export const VARSION = '1.0';

export function getStorage(key) {
	return JSON.parse(localStorage.getItem(key));
}

export function setStorage(key, json) {
	localStorage.setItem(key, JSON.stringify(json));
}

export function removeStorage(key) {
	localStorage.removeItem(key);
}

export function sleep(time) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, time);
	});
}
