const { generateLetter } = require('../controllers/candidatureController');
test('génère lettre correcte', async () => {
  const req = { body: { entreprise: 'TestCo', infos_entreprise: 'excellente entreprise', cv: 'Mon CV...' } };
  const res = { json: jest.fn() };
  await generateLetter(req, res);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ lettre: expect.stringContaining('TestCo') }));
});
