class Util {
	static VARSION = '1.0';

	static get_storage(key) {
		return JSON.parse(localStorage.getItem(key));
	}

	static set_storage(key, json) {
		localStorage.setItem(key, JSON.stringify(json));
	}

	static remove_storage(key) {
		localStorage.removeItem(key);
	}

	static sleep(time) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, time);
		});
	}
}
