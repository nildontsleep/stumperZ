// End-to-end checks of the built single-file page in Chromium.
// Usage: node tools/e2e/smoke.mjs [path-to-html]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve(process.argv[2] ?? 'dist/stumperz.html');
const shots = path.resolve(process.argv[3] ?? 'e2e-shots');
fs.mkdirSync(shots, { recursive: true });
const exe = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;

// serve over http (IndexedDB and workers behave like on a real host)
import http from 'node:http';
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(fs.readFileSync(file));
}).listen(0);
const url = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch({ executablePath: exe });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)|net::ERR_FAILED/.test(m.text())) errors.push('console: ' + m.text()); });
page.on('requestfailed', (r) => { if (!/fonts\.(googleapis|gstatic)/.test(r.url())) errors.push('request failed: ' + r.url().slice(0, 120)); });
await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());

const step = (s) => console.log('▶ ' + s);
const expect = async (cond, msg) => { if (!(await cond)) throw new Error('ÉCHEC: ' + msg); console.log('  ✓ ' + msg); };

step('dashboard');
await page.goto(url);
await page.getByRole('button', { name: 'Continuer ma révision' }).waitFor();
await expect(page.getByText('On commence par un diagnostic').isVisible(), 'le premier écran propose le diagnostic');
await page.screenshot({ path: `${shots}/01-dashboard.png`, fullPage: true });

step('diagnostic');
await page.getByRole('button', { name: 'Continuer ma révision' }).click();
await page.getByRole('button', { name: 'Commencer' }).click();
let n = 0;
while (n < 25) {
  if (await page.getByText('Dernière étape : écrire du code').isVisible().catch(() => false)) break;
  if (await page.getByText('Résultat du diagnostic').isVisible().catch(() => false)) break;
  // answer: first question "je ne sais pas", others pick the first option or validate order
  const dk = page.getByRole('button', { name: 'Je ne sais pas' });
  if (n % 3 === 0) await dk.click();
  else {
    const opt = page.locator('.options .option').first();
    if (await opt.isVisible().catch(() => false)) {
      await opt.click();
      await page.getByRole('button', { name: 'Valider' }).click();
    } else if (await page.locator('.fill input').isVisible().catch(() => false)) {
      await page.locator('.fill input').fill('x');
      await page.getByRole('button', { name: 'Valider' }).click();
    } else {
      await page.getByRole('button', { name: 'Valider' }).click();
    }
  }
  await page.getByRole('button', { name: 'Suivant' }).click();
  n++;
}
console.log(`  (${n} questions de diagnostic)`);
if (await page.getByText('Dernière étape : écrire du code').isVisible().catch(() => false)) {
  await page.screenshot({ path: `${shots}/02-diag-code.png`, fullPage: true });
  const ed = page.locator('.cm-content').first();
  await ed.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.insertText('int my_strlen(char const *str)\n{\nint i = 0;\nwhile (str[i] != \'\\0\')\ni++;\nreturn i;\n}\n');
  await page.getByRole('button', { name: 'Compiler et tester' }).click();
  await page.getByText(/5 \/ 5 tests réussis/).waitFor({ timeout: 30000 });
  console.log('  ✓ code du diagnostic compilé et testé (5/5)');
  await page.getByRole('button', { name: 'Terminer le diagnostic' }).click();
}
await page.getByText('Résultat du diagnostic').waitFor();
await expect(page.getByText('Point de départ conseillé').isVisible(), 'le diagnostic donne un point de départ');
await expect(page.getByText('Notions fragiles').isVisible(), 'notions fragiles affichées');
await page.screenshot({ path: `${shots}/03-diag-result.png`, fullPage: true });

step('exercice : échec puis réussite');
await page.getByRole('button', { name: 'Exercices', exact: true }).click();
await page.getByRole('button', { name: /^my_swap/ }).click();
const ed2 = page.locator('.cm-content').first();
await ed2.click();
await page.keyboard.press('Control+A');
await page.keyboard.press('Delete');
await page.keyboard.insertText('void my_swap(int *a, int *b)\n{\nint *tmp = a;\na = b;\nb = tmp;\n}\n');
await page.getByRole('button', { name: 'Compiler et tester' }).click();
await page.getByText(/tests réussis/).waitFor({ timeout: 30000 });
await expect(page.getByText(/^[0-2] \/ 4 tests réussis/).isVisible(), 'un mauvais my_swap échoue aux tests');
await page.screenshot({ path: `${shots}/04-exercise-fail.png`, fullPage: true });
await ed2.click();
await page.keyboard.press('Control+A');
await page.keyboard.press('Delete');
await page.keyboard.insertText('void my_swap(int *a, int *b)\n{\nint tmp = *a;\n*a = *b;\n*b = tmp;\n}\n');
await page.getByRole('button', { name: 'Compiler et tester' }).click();
await page.getByText('4 / 4 tests réussis — code compilé et vérifié.').waitFor({ timeout: 30000 });
console.log('  ✓ my_swap correct : 4/4');
await expect(page.getByText('Réussi seul : ça compte pleinement.').isVisible(), 'réussite autonome reconnue');

step('erreur de compilation lisible');
await ed2.click();
await page.keyboard.press('Control+A');
await page.keyboard.press('Delete');
await page.keyboard.insertText('void my_swap(int *a, int *b)\n{\nint tmp = *a\n*a = *b;\n}\n');
await page.getByRole('button', { name: 'Compiler et tester' }).click();
await page.getByText('Ne compile pas.').waitFor({ timeout: 30000 });
const errText = await page.locator('.panel.bad pre').innerText();
await expect(Promise.resolve(/my_swap\.c\(\d+\)/.test(errText) && !/zz_/.test(errText)), 'message d\'erreur limité au fichier de l\'étudiant : ' + errText.split('\n')[0]);

step('boucle infinie arrêtée');
await ed2.click();
await page.keyboard.press('Control+A');
await page.keyboard.press('Delete');
await page.keyboard.insertText('void my_swap(int *a, int *b)\n{\nwhile (1)\n*a = *b;\n}\n');
await page.getByRole('button', { name: 'Compiler et tester' }).click();
await page.getByText(/tests réussis/).waitFor({ timeout: 60000 });
await expect(page.getByText(/boucle infinie/).first().isVisible(), 'la boucle infinie est arrêtée et signalée');

step('aide graduée');
await page.getByRole('button', { name: '1. Reformulation' }).click();
await expect(page.getByText('Ouvrir une aide fera compter cette tentative comme').isVisible(), 'avertissement avant aide en mode seul');

step('examen');
await page.getByRole('button', { name: 'Mode stumper' }).click();
await page.getByRole('button', { name: 'Commencer ce sujet' }).first().click();
await page.getByRole('button', { name: 'Démarrer' }).click();
await page.locator('.exam-clock').waitFor();
const t1 = await page.locator('.exam-clock').innerText();
await expect(Promise.resolve(/^(1:00:00|59:\d\d)$/.test(t1)), 'chronomètre démarré : ' + t1);
await page.screenshot({ path: `${shots}/05-exam.png`, fullPage: false });
const ed3 = page.locator('.cm-content').first();
await ed3.click();
await page.keyboard.press('Control+A');
await page.keyboard.press('Delete');
await page.keyboard.insertText('#include <unistd.h>\n\nint main(int argc, char **argv)\n{\nint n = 0;\nif (argc != 3 || argv[1][0] != \'-\' || argv[1][1] != \'c\' || argv[1][2] != \'\\0\') {\nwrite(2, "Usage\\n", 6);\nreturn 84;\n}\nwhile (argv[2][n])\nn++;\nchar c;\nif (n >= 10) { c = n / 10 % 10 + \'0\'; if (n >= 100) { char h = n / 100 + \'0\'; write(1, &h, 1); } write(1, &c, 1); }\nc = n % 10 + \'0\';\nwrite(1, &c, 1);\nwrite(1, "\\n", 1);\nreturn 0;\n}\n');
// terminal
await page.getByText('Lancer avec mes propres arguments').click();
await page.locator('.term-line input').fill('-c "hello world"');
await page.getByRole('button', { name: 'Exécuter' }).click();
await page.locator('.term-out pre.io').first().waitFor({ timeout: 30000 });
await expect(page.locator('.term-out pre.io').first().innerText().then((t) => t.trim() === '11$'), 'terminal : ./a.out -c "hello world" → 11$');
step('rechargement pendant l\'examen');
await page.reload();
await page.locator('.exam-clock').waitFor();
await expect(page.locator('.cm-content').first().innerText().then((t) => t.includes('argv[2][n]')), 'le code de l\'examen est restauré après rechargement');
await page.getByRole('button', { name: 'Rendre' }).click();
await page.getByRole('button', { name: 'Confirmer' }).click();
await page.getByText(/Bilan · textool/).waitFor({ timeout: 60000 });
const pts = await page.locator('.kpi-value').first().innerText();
await expect(Promise.resolve(/^(\d+(\.\d)?) \/ 24 points/.test(pts) && !pts.startsWith('0 /')), 'bilan vérifié : ' + pts.split('\n')[0]);
await page.screenshot({ path: `${shots}/06-exam-result.png`, fullPage: true });

step('persistance après rechargement');
await page.goto(url);
await page.getByRole('button', { name: 'Statistiques' }).click();
await expect(page.getByText(/tentatives seul/).isVisible(), 'statistiques affichées');
const statsText = await page.locator('main').innerText();
await expect(Promise.resolve(/textool \d+ %/.test(statsText)), 'la simulation figure dans les statistiques');
await page.screenshot({ path: `${shots}/07-stats.png`, fullPage: true });

step('export / import');
await page.getByRole('button', { name: 'Paramètres' }).click();
await page.getByRole('button', { name: 'Exporter ma sauvegarde' }).click();
const backup = await page.locator('textarea.backup').first().inputValue();
const parsed = JSON.parse(backup);
await expect(Promise.resolve(parsed.format === 'stumperz-backup' && parsed.state.attempts.length > 5), `export : ${parsed.state.attempts.length} résultats`);
await page.getByRole('button', { name: 'Tout effacer…' }).click();
await page.getByRole('button', { name: 'Oui, tout effacer' }).click();
await page.getByText('Toutes les données ont été effacées.').waitFor();
await page.locator('textarea.backup').last().fill('{"format":"x"}');
await page.getByRole('button', { name: 'Importer ce texte' }).click();
await page.getByText('n\'est pas une sauvegarde StumperZ').waitFor({ timeout: 10000 });
console.log('  ✓ import invalide refusé avec un message clair');
await page.locator('textarea.backup').last().fill(backup);
await page.getByRole('button', { name: 'Importer ce texte' }).click();
await page.getByText(/restaurée : \d+ résultats, 1 simulations/).waitFor({ timeout: 10000 });
console.log('  ✓ import valide restauré');

step('mobile');
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole('button', { name: 'Menu' }).click();
await page.getByRole('button', { name: 'Tableau de bord' }).click();
await page.waitForTimeout(300);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
await expect(Promise.resolve(overflow <= 1), 'pas de défilement horizontal sur mobile (' + overflow + 'px)');
await page.screenshot({ path: `${shots}/08-mobile.png`, fullPage: true });
await page.getByRole('button', { name: 'Menu' }).click();
await page.getByRole('button', { name: 'Exercices', exact: true }).click();
await page.getByRole('button', { name: /^my_strlen/ }).click();
const overflow2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
await expect(Promise.resolve(overflow2 <= 1), 'page exercice sans défilement horizontal sur mobile (' + overflow2 + 'px)');
await page.screenshot({ path: `${shots}/09-mobile-exercise.png`, fullPage: true });

step('thème clair');
await page.setViewportSize({ width: 1280, height: 900 });
await page.getByRole('button', { name: 'Menu' }).isVisible().catch(() => false);
await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
await page.screenshot({ path: `${shots}/10-light.png`, fullPage: false });

console.log(errors.length ? '\nERREURS NAVIGATEUR:\n' + errors.join('\n') : '\nAucune erreur JavaScript.');
await browser.close();
server.close();
process.exit(errors.length ? 1 : 0);
