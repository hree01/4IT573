import test from 'ava'
import { fizzbuzz } from '../src/fizzbuzz.js'

test('fizzbuzz returns 1 for input 1', (t) => {
	t.is(fizzbuzz(1), 1)
})