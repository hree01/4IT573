import test from 'ava'

// První parametr funkce je test je název testu.
// Druhý parametr je funkce se samostatným testem.
//   Tato funkce obrží parametr t, pomocí kterého testujeme hodnoy.
test('true is true', (t) => {
	t.is(true, true)
})