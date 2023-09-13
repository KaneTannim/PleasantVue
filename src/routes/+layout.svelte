<script>
	import '../app.scss'
	import { onDestroy, onMount } from 'svelte'
	import { fly } from 'svelte/transition'
	import { fade } from 'svelte/transition'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { parseData } from '$lib/js/parseData.js'
	import { session } from '$lib/stores/session.js'
	import { settings } from '$lib/stores/settings.js'
	import { oldAssignments } from '$lib/stores/oldAssignments.js'
	import Spinner from '$lib/components/Spinner.svelte'
	import { browser } from '$app/environment'
	import * as studentVueClient from "$lib/js/studentvue-client"
	import {Buffer} from 'buffer';
	import EventEmitter from 'events';
	import process from 'process';
	export let data


	

	// sax.js needs these
	window.Buffer = Buffer;
	window.EventEmitter = EventEmitter;
	window.process = process;
	

	let interval;
	let spinning = false;

	debugger;

	function isEmpty(obj) {
		for (const prop in obj) {
			if (Object.hasOwn(obj, prop)) {
			return false;
			}
		}

		return true;
	}

	if ((!($settings?.user) || isEmpty($session)) && new URL(location.href).pathname !== "/login") {
			goto("/login")
	}
	

	onMount(async () => {
		
		if ($settings.theme === 'dark') {
			$settings.theme = 'night'
		}
		if ($settings.user) {
			//console.log('load')
			await load()
			if (!interval) {
				// interval = setInterval(refresh, 10*1000 );
			}
		}
	});

	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
		}
	})

	async function showNotifications() {
		if ($oldAssignments?.length) {
			return;
		}
		for (const assignment of $session.gradebook.assignments) {
			if (assignment?.new === true) {
				// console.log(assignment)
				new Notification(
					`PleasantVue — New Assignment Posted`, {
					body: `${$session.gradebook.Courses[0].Course[assignment.courseIndex].$.Title} — ${assignment.$.Measure}`,
				})
				assignment.new = false;
			}
		}
	}

	async function checkNotificationPermissions() {
		try {
			if (!browser) {
				return;
			}
			if (!("Notification" in window)) return;
			if (Notification.permission === "granted") {
				await showNotifications();
				return;
			} else if (Notification.permission !== "denied") {
				const permission = await Notification.requestPermission();
				if (permission === "granted") {
					await showNotifications();
					return;
				}

			}
		} catch (ignored) {
			// chrome for android requires service worker registration,
			// samsung internet doesn't support,
		}
		return;
	}

	async function load() {
		try {
			const credsOk = await studentVueClient.testCredentials({
				username, password
			});
			if (!credsOk) {
				throw new Error("Invalid Credentials");
			}
		} catch (e) {
			goto('/login');
			return;
		}
		try {
			const resp = await studentVueClient.data({
				username: $session.data.username,
				password: $session.data.password,
			});
			let { student, periods, childList, currentPeriod } = resp;
			$session = {
				user: {
					username, password,
				},
				student,
				periods,
				childList,
				currentPeriod,
				selectedPeriod: currentPeriod,
				selected: periods[currentPeriod],
				gradebook: periods[currentPeriod]
			}
	
			
		} catch {
			return;
		}


		await parseData($session, $oldAssignments);
		await checkNotificationPermissions();
		

		$oldAssignments = $oldAssignments
	}

	$: if ($session.periods) {
		$session.selected = $session.periods[$session.selectedPeriod]
	}

	async function refresh() {
		spinning = true
		await load()
		spinning = false
	}
</script>

<svelte:head>
	<meta name="color-scheme" content={$settings.theme} />
	<link rel="stylesheet" href={`/themes/${$settings.theme}.css`} />
</svelte:head>

{#if $settings.user || !(new URL(location.href).pathname !== "/login")}
	{#if $session.doneParsing || true}
		<nav
			in:fade={{ duration: 200, delay: 200 }}
			out:fade={{ duration: 200 }}
			data-sveltekit-prefetch
		>
			<div class="nav-item">
				<img class={`logo ${$settings.theme}`} alt="logo" src="/icons/logo.png" />
				<div class="nav-item-title app-title"><strong>PleasantVue</strong></div>
			</div>
			<div class="nav-item">
				<a class:active={$page.url.pathname === '/'} href="/">
					<i class="bi bi-house" />
				</a>
				<a class="nav-item-title" class:active={$page.url.pathname === '/'} href="/"><div>Home</div></a>
			</div>
			<div class="nav-item">
				<a class:active={$page.url.pathname === '/courses'} href="/courses">
					<i class="bi bi-list-ol" />
				</a>
				<a class="nav-item-title" class:active={$page.url.pathname === '/courses'} href="/courses"><div>Courses</div></a>
			</div>
			<div class="nav-item">
				<a class:active={$page.url.pathname === '/assignments'} href="/assignments">
					<i class="bi bi-pen" />
				</a>
				<a class="nav-item-title" class:active={$page.url.pathname === '/assignments'} href="/assignments"><div>Assignments</div></a>
			</div>
			<div class="nav-item">
				<a class:active={$page.url.pathname === '/calendar'} href="/calendar">
					<i class="bi bi-bell" />
				</a>
				<a class="nav-item-title" class:active={$page.url.pathname === '/calendar'} href="/calendar"><div>Calendar</div></a>
			</div>
			<div class="nav-item">
				<a class:active={$page.url.pathname === '/staff'} href="/staff">
					<i class="bi bi-people"></i>
				</a>
				<a class="nav-item-title" class:active={$page.url.pathname === '/staff'} href="/staff"><div>Staff</div></a>
			</div>
			<div class="nav-item">
				<a class:active={$page.url.pathname === '/map'} href="/map">
					<i class="bi bi-map"></i>
				</a>
				<a class="nav-item-title" class:active={$page.url.pathname === '/map'} href="/map"><div>Map</div></a>
			</div>
			<div class="nav-item about">
				<a class:active={$page.url.pathname === '/about'} href="/about">
					<i class="bi bi-info" />
				</a>
				<a class="nav-item-title" class:active={$page.url.pathname === '/about'} href="/about"><div>About</div></a>
			</div>
			<div class="nav-item settings">
				<a class:active={$page.url.pathname === '/settings'} href="/settings">
					<i class="bi bi-gear" />
				</a>
				<a class="nav-item-title" class:active={$page.url.pathname === '/settings'} href="/settings"><div>Settings</div></a>
			</div>
		</nav>
		<main in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>
			{#key data.url}
				<div
					class="transition-container"
					in:fly={{ y: -5, duration: 200, delay: 200 }}
					out:fly|local={{ y: 5, duration: 200 }}
				>
					<slot />
				</div>
			{/key}
		</main>
	{:else}
		<div class="loading-container" out:fade={{ duration: 200 }}>
			<div class="loading">
				<Spinner />
				<div class="spinner-label">Fetching student info...</div>
			</div>
		</div>
	{/if}
{:else}
{#if $page.url.pathname == "/login"}
<main
		class="login-container"
		in:fade={{ duration: 200, delay: 200 }}
		out:fade={{ duration: 200 }}
	>
		<slot />
</main>
{:else}
<main>
	<slot />
</main>
{/if}
{/if}


<style lang="scss">
	nav {
		@include box;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: min-content;
		padding: $spacing-small;
		z-index: 50000;
		
		overflow-x: hidden;
		overflow-y: scroll;
	}

	.logo {
		-webkit-filter: invert(1);
		filter: invert(1);
		width: 30px;
		height: 30px;
		object-fit: cover;
		object-position: 0 0;
		border-radius: 0;
	}

	.logo:hover {
		background: transparent;
	}

	.logo.night {
		-webkit-filter: invert(67%) sepia(41%) saturate(283%) hue-rotate(182deg) brightness(92%) contrast(82%);
		filter: invert(67%) sepia(41%) saturate(283%) hue-rotate(182deg) brightness(92%) contrast(82%);
	}

	.logo.bronze {
		-webkit-filter: invert(1);
		filter: invert(1);
	}

	.logo.glass {
		-webkit-filter: invert(1);
		filter: invert(1);
	}

	.logo.light {
		-webkit-filter: invert(0);
		filter: invert(0);
	}

	.app-title {
		font-size: 1.25rem;
	}

	main {
		width: 100%;
		height: 100%;
		margin-left: $spacing;
		overflow-y: scroll;
	}

	.transition-container {
		width: 100%;
		height: 100%;
	}

	.loading-container {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		width: 100%;
		height: 100%;
	}

	.loading {
		width: max-content;
		margin: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.spinner-label {
		margin-top: $spacing-small;
	}

	img {
		width: 50px;
		height: 50px;
		object-fit: cover;
		object-position: 0 0;
		border-radius: 50px;
	}

	@media (min-width: $breakpoint-phone) {
		.settings {
			margin-top: 10px !important;
		}

		.about {
			margin-top: auto !important;
			margin-bottom: 0 !important;
		}

		nav {
			height: calc(100vh - 40px);
		}
	}

	.nav-item {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		margin-top: 10px;
		margin-bottom: 10px;
		text-align: center;
		width: 175px;
		height: 50px;
		transition: width .5s ease-in-out;
	}
	
	.nav-item-title {
		display: block;
		width: auto;
		overflow: hidden;
		white-space: nowrap;
		transition: width .5s ease-in-out;
		text-decoration: none;
	}
	
	a:not(.nav-item-title),
	button,
	img {
		display: flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		height: 50px;
		width: 50px;
		float: left;
		margin-right: 10px;
		margin-left: 10px;
		text-align: center;
		border-radius: 50%;
		color: var(--font-color);
		background: transparent;
		&:hover {
			background: var(--bg-color-1-5);
		}
		&:active {
			background: var(--bg-color-1);
			i {
				transform: scale(0.9);
			}
		}
		&.active {
			background: var(--bg-color-1);
		}
	}

	i {
		display: inline-block;
		height: 25px;
		font-size: 25px;
		line-height: 25px;
		color: var(--accent-color);
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: $breakpoint-phone) {
		nav {
			flex-direction: row;
			justify-content: space-between;
			width: 100%;
			
			overflow-x: scroll;
			overflow-y: visible;
		}

		a {
			margin: 0 !important;
		}

		img {
			display: none;
		}

		main {
			margin-left: 0;
			margin-bottom: $spacing;
			height: calc(100% - 2 * $spacing - 50px);
		}

		.nav-item {
			width: auto;
			height: unset;
			padding: 0px;
			margin: 0px
		}

		.nav-item-title {
			display: none;
			width: 0;
		}
	}
</style>
