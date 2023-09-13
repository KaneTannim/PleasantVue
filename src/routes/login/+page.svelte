<script>
	import { goto } from '$app/navigation'
	import { parseData } from '$lib/js/parseData.js'
	import { session } from '$lib/stores/session.js'
	import { settings } from '$lib/stores/settings.js'
	import { oldAssignments } from '$lib/stores/oldAssignments.js'
	import Spinner from '$lib/components/Spinner.svelte'
	import { data, testCredentials } from '$lib/js/studentvue-client'

	let username
	let password
	let error
	let loading = false

	async function login() {
		if (!username) {
			error = 'Please enter a username.'
			return
		}
		if (!password) {
			error = 'Please enter a password.'
			return
		}
		loading = true;
		debugger;
		try {
			const credsOk = await testCredentials({
				username, password
			});
			if (!credsOk) {
				throw new Error("Invalid Credentials");
			}
		} catch (e) {
			console.log(e);
			error = 'Invalid login credentials.'
			loading = false;
			$settings.user = undefined;
			return;
		}
		$settings.user = {
				username, password,
		}
		try {
			const resp = await data({
				username, password
			});
			let { student, periods, childList, currentPeriod } = resp;
			$session = {
				student,
				periods,
				childList,
				currentPeriod,
				selectedPeriod: currentPeriod,
				selected: periods[currentPeriod],
				gradebook: periods[currentPeriod]
			}
			parseData($session, $oldAssignments)
			goto('/')
		} catch (e) {
			console.log(e);
			error = 'Error in Fetching Data';
			loading = false;
			return;
		}
	}
</script>

<svelte:head>
	<title>Login - PleasantVue</title>
</svelte:head>

<div class="content">
	<header class="header">
		<!-- <button><i class="bi bi-circle-half"></i></button> -->
		<h1>PleasantVue</h1>
		<a href="/about">About</a>
	</header>
	<form on:submit|preventDefault={login}>
		<h2>Login</h2>
		<p style="text-align: center">PUSD has not directly enabled login without Google yet, so to get access, reset your password <a target="_blank" href="https://ca-pleas-psv.edupoint.com/PXP2_Password_Help.aspx?S=Y">here</a>. Then, use your email address as the username and your password to login here, and you won't need to login with Google again!</p>
		<input type="text" autocorrect="off" autocapitalize="none" placeholder="Username" bind:value={username} />
		<input type="password" autocorrect="off" autocapitalize="none" placeholder="Password" bind:value={password} />
		<div class="error">
			{#if error}
				{error}
			{:else}
				Your login info will not be saved anywhere except your browser.<br />
				You can see all the code on <a rel="noreferrer" target="_blank" href="https://github.com/PleasantVue/PleasantVue">GitHub</a>.
			{/if}
		</div>
		<button type="submit">
			{#if loading}
				<Spinner width={20} border={2} />
			{:else}
				Login
			{/if}
		</button>
	</form>
</div>

<style lang="scss">
	.content {
		width: 100%;
		height: calc(100vh - 40px);
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: min-content min-content;
		gap: 10px;
		
	}
	
	.header {
		@include box;
		padding: 5px;
		// width: 100%;
		margin-inline: 10px;
	}

	.header h1 {
		display: inline;
		padding: 0px;
		margin: 0px;
		margin-left: 20px;
	}

	.header button {
		display: inline;
		float: right;
		margin-right: 20px;
	}

	.header a {
		float: right;
		padding: 0px;
		margin: 0px;
		margin-bottom: 0 !important;
		line-height: 40px;
		margin-right: 30px;
		text-decoration: none;
		font-size: x-large;
		color: var(--accent-color);
		margin-top: 0;
		margin-bottom: $spacing-small;
	}

	form {
		@include box;
		display: flex;
		flex-direction: column;
		margin-inline: auto;
		max-width: 35vw;
	}

	.error {
		margin: 20px 0;
		color: var(--font-color-2);
		font-size: 1em;
		text-align: center;
		min-width: 25vw;
	}

	input {
		margin-top: $spacing-small;
	}

	h2 {
		width: 100%;
		text-align: center;
	}

	button {
		display: flex;
		justify-content: center;
	}

	@media (max-width: $breakpoint-phone) {
		form {
			margin: auto $spacing;
		}
	}

	@media (orientation: portrait) {
		form {
			max-width: none;
		}
	}
</style>
