<script>
	import { format } from "date-fns";
	import ShareSchedule from '$lib/components/ShareSchedule.svelte'
	import { session } from '$lib/stores/session.js'
	import { settings } from '$lib/stores/settings.js'
	import AssignmentHomepage from "$lib/components/AssignmentHomepage.svelte"

	export const ssr = false;

	let date = new Date()
	let greeting = date.getHours() < 12 ? 'morning' : date.getHours() < 18 ? 'afternoon' : 'evening'
	let shareSchedule;


	let info = $session?.calendar?.[format(new Date(), "M/dd/yyyy")] || {
		events: [],
		noSchool: true,
	};
</script>

<svelte:head>
	<title>PleasantVue</title>
</svelte:head>

<div class="layout" data-sveltekit-prefetch>
	<h1>Good {greeting}, {$session.student.FormattedName[0].split(' ')[0]}!</h1>
	<div class="grid-heading-container">
		<img class={`logo logo-head ${$settings.theme}`} alt="logo" src="/icons/logo.png" />
		<h1>{$session.student.FormattedName[0].split(' ')[0]}</h1>
	</div>
	<div class="events value">
		<h1>Events</h1>
		<div>
			<div class="value-label">
				{#if info.events.length === 0}
				No events today.
				{/if}
				{#each info.events as event}
				<div>&#x2022; {event.Title} {event.Information}</div>
				{/each}
			</div>
			{#if info.noSchool}
			<div class="value-label">No school today.</div>
			{/if}
		</div>
	</div>
	<!-- <div class="average value">
		<h1 style={$session.gradebook.averageStyle}>
			{$session.gradebook.average}
		</h1>
		<div class="value-label">Average grade<br />&nbsp;</div>
	</div> -->
	<div class="week-assignments value">
		<h1>{$session?.gradebook?.week?.length || "0"}</h1>
		<div class="value-label">
			{$session?.gradebook?.week?.length === 1 ? 'Assignment' : 'Assignments'}
			<br />this week
		</div>
	</div>
	<div class="days value">
		<h1>
			{$session?.gradebook?.days | "Unknown"}
		</h1>
		<div class="value-label">
			{$session.days === 1 ? 'School day' : 'School days'} left in
			<br />{$session?.gradebook?.ReportingPeriod?.[0]?.$?.GradePeriod || "This quarter"}
		</div>
	</div>
	<!-- <div class="grades">
		<h2>Schedule</h2>
		<div>
			<button on:click={shareSched}>Share My Schedule</button>
			<div>{ copiedOk }</div>
		</div>
		<table class="grades-table">
			{#each $session.gradebook.Courses[0].Course as course, index}
				<div class="row-link">
					<td class="course-name">{course.$.Title}</td>
					<td class="course-teacher">{course.$.Staff}</td>
					<td class="course-room">{course.$.Room}</td>
					<td class="course-period">{course.$.Period}</td>
				</div>
			{/each}
		</table>
	</div> -->
	<div class="grades">
		<div class="grades-header">
			<a class="link" href="/courses"><h2>Courses</h2></a>
			<button on:click={shareSchedule.show}>Share Schedule</button>
		</div>
		<table class="grades-table">
			{#each ($session?.gradebook?.Courses?.[0]?.Course || []) as course, index}
				<a class="row-link" href={'/course/' + index}>
					<td class="course-name">{course.$.Period === "10" ? "ACCESS" : course.$.Period === "0" ? "A" : course.$.Period} — {course.$.Title} — {course.$.Staff}</td>
					<!-- <td class="course-grade" style={course.style}>{course.scoreString}</td>
					<td class="course-score" style={course.style}>{course.score}</td> -->
					<td class="course-view"><i class="bi bi-eye"></i></td>
				</a>
			{/each}
		</table>
	</div>
	<div class="assignments">
		<div class="assignments-scroll">
			<div class="assignents-header">
				<a class="link" href="/assignments"><h2>Graded Assignments</h2></a>
			{#if $session?.gradebook?.assignments.filter((a) => a.scorePercent >= 0).length > 0}
				<span class="show-all">
					<i on:click={(e) => {
						if (e.target.classList.contains("bi-eye")) {
							document.querySelectorAll(".assignment-score").forEach((el) => {
							if (!(el.querySelector("i").classList.contains("hidden"))) el.click();
							});
							e.target.classList.remove("bi-eye");
							e.target.classList.add("bi-eye-slash");
						} else {
							document.querySelectorAll(".assignment-score").forEach((el) => {
								if (el.querySelector("i").classList.contains("hidden")) el.click();
							});
							e.target.classList.remove("bi-eye-slash");
							e.target.classList.add("bi-eye");
						}
					}} class="bi bi-eye"></i>
				</span>
			{/if}
			</div>
			
			<table class="assignments-table">
				{#each ($session?.gradebook?.assignments || []) as assignment}
					{#if assignment.scorePercent >= 0}
						<AssignmentHomepage assignment={assignment} />
					{/if}
				{/each}
			</table>
		</div>
	</div>
</div>
<ShareSchedule bind:this={shareSchedule} />

<style lang="scss">
	.layout {
		display: grid;
		height: calc(100vh - 40px);
		width: 100%;
		gap: $spacing;
		grid-template-columns: 1fr 1fr 1fr 1fr 2fr;
		grid-template-rows: auto auto 1fr;
	}

	h1 {
		@include nowrap;
		grid-column: 1 / 5;
		margin-bottom: 0px;
	}

	.grid-heading-container {
		display: none;
	}

	.logo-head {
		-webkit-filter: invert(1);
		filter: invert(1);
	}

	.logo-head.night {
		-webkit-filter: invert(67%) sepia(41%) saturate(283%) hue-rotate(182deg) brightness(92%) contrast(82%);
		filter: invert(67%) sepia(41%) saturate(283%) hue-rotate(182deg) brightness(92%) contrast(82%);
	}

	.logo-head.bronze {
		-webkit-filter: invert(1);
		filter: invert(1);
	}

	.logo-head.glass {
		-webkit-filter: invert(1);
		filter: invert(1);
	}

	.logo-head.light {
		-webkit-filter: invert(0);
		filter: invert(0);
	}

	.value {
		@include box;
		text-align: center;
		// aspect-ratio: 1;
		height: 25vh;
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
		font-size: 0.9em;
		padding: 0;
		h1, h2 {
			margin-top: auto;
			margin-bottom: $spacing-small;
		}
		div {
			margin-bottom: auto;
		}
	}

	.events {
		aspect-ratio: unset;
		grid-column: span 2;
		h1 {
			margin-top: auto;
		}

		.value-label:last-child {
			margin-bottom: auto;
		}
	}

	.grades {
		@include box;
		grid-column: 1 / 5;
	}

	.assignments {
		@include box;
		padding: 0;
		grid-column: 5;
		grid-row: 1 / 4;
		overflow: hidden;
	}

	.assignments-scroll {
		height: 100%;
		overflow-y: auto;
		scrollbar-color: var(--bg-color-2-5) transparent;
		padding: $spacing;
		
	}

	.assignments-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.show-all {
		cursor: pointer;
		float: right;
		position: relative;
		top: 10px;
	}

	.grades-header {
		display: flex;
		justify-content: space-between;	
	}

	.grades-table {
		height: calc(100% - 2 * $spacing);
	}

	.row-link {
		display: table-row;
		text-decoration: none;
		border-radius: $roundness-small;
		
		&:hover {
			background: var(--bg-color-1-5);
		}
		&:active {
			background: var(--bg-color-1);
		}

		.course-name {
			width: 85%;
		}

		.course-view {
			width: 30%;
			font-size: large;
			float: right;
			margin-left: auto;
			margin-top: auto;
			margin-bottom: auto;
		}
	}

	td {
		padding: $spacing-small;
		vertical-align: middle;
	}

	.course-period {
		text-align: right;
	}

	.assignments-table {
		table-layout: fixed;
		width: 100%;
	}

	.assignments-table td {
		padding-top: $spacing-small;
		padding-bottom: $spacing-small;
	}

	.assignment-name {
		@include nowrap;
	}

	.assignment-score {
		width: 80px;
		text-align: right;
		padding-left: 0;
	}

	.course-teacher {
		padding: 0;
	}

	// @media (max-height: 650px) {
	// 	.value {
	// 		display: none;
	// 	}
	// 	.grades {
	// 		grid-row: 2/4;
	// 	}
	// }

	@media (max-width: 950px) {
		.layout {
			grid-template-columns: 1fr 1fr 1fr 1.75fr;
		}
		// .week-assignments {
		// 	display: none;
		// }
		h1 {
			grid-column: 1 / 4;
		}
		.assignments {
			grid-column: 4;
		}
		.grades {
			grid-column: 1 / 4;
		}
	}

	@media (max-width: 750px) {
		.layout {
			grid-template-columns: 1fr 1fr 1fr;
		}
		.improvement {
			display: flex;
		}
		.assignments {
			display: none;
		}
		h1 {
			grid-column: 1 / 4;
		}
		.grades {
			grid-column: 1 / 4;
		}
	}

	@media (max-width: $breakpoint-phone) {
		.layout {
			grid-template-columns: 1fr 1fr;
			grid-template-rows: auto auto 1fr;
		}

		.layout > h1 {
			display: none;
		}

		.grid-heading-container {
			display: flex;
			grid-column: 1 / 3;
			margin-bottom: 0;
			align-items: center;
		}

		img {
			width: 50px;
			height: 50px;
			object-fit: cover;
			object-position: 0 0;
			margin-right: $spacing-small;
		}

		h1 {
			margin-top: 0;
		}

		.grades {
			grid-column: 1 / 3;
		}

		.grades-table {
			table-layout: fixed;
			td {
				// @include nowrap;
			}
			.course-teacher {
				width: min-content;
			}
			.course-period {
				width: 75px;
			}
		}

		.course-teacher {
			display: none;
		}
		
		.improvement,
		.assignments {
			display: none;
		}

		@media (max-height: 700px) {
			.value {
				display: none;
			}

			.grades {
				grid-row: 2 / 4;
			}
		}
	}
</style>
