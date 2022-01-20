import { login } from 'studentvue.js'

export async function get(request) {
	console.log('get all')
	let client = await login(
		'https://wa-bsd405-psv.edupoint.com/',
		request.locals.user.username,
		request.locals.user.password
	)
	// let student = JSON.parse(await client.getStudentInfo()).StudentInfo
	// let gradebook = JSON.parse(await client.getGradebook()).Gradebook
	const result = await Promise.all([
		client.getStudentInfo().then((value) => JSON.parse(value).StudentInfo),
		client.getGradebook().then((value) => JSON.parse(value).Gradebook)
	])
	return {
		body: {
			student: result[0],
			gradebook: result[1]
		}
	}
}
