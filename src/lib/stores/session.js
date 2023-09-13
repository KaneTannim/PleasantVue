import { writable } from 'svelte/store'
import { browser } from '$app/environment'

const initial = browser ? (JSON.parse(window.sessionStorage.getItem('session')) || {}) : {}
console.group("initial")
console.log(initial);
console.groupEnd();

export const session = writable(initial)

session.subscribe((value) => {
	if (browser) {
		window.sessionStorage.setItem('session', JSON.stringify(value))
	}
})