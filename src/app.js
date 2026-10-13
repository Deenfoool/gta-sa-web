import { collectFromDirectory, formatBytes, readImgDirectory, summarizeInstall } from './importer.js';
const copy = {
  ru: {
    phase: 'M1 · Проверка игровых файлов', eyebrow: 'НЕОФИЦИАЛЬНЫЙ БРАУЗЕРНЫЙ ПОРТ', heading: 'San Andreas в браузере.',
    lede: 'Первый этап: безопасно проверяем локальную установку оригинальной ПК-версии. Полный игровой движок ещё не подключён.',
    choose: 'Выбрать папку с игрой', fallback: 'Выбрать папку (совместимый режим)',
    privacy: 'Файлы читаются только вашим браузером. Ничего не загружается на сервер, не отправляется в GitHub и не публикуется.',
    preflight: 'Проверка установки', idle: 'Папка ещё не выбрана', instructions: 'Укажите корневую папку GTA San Andreas из вашей собственной установки (не Definitive Edition).',
    notplayable: 'Это диагностическая версия M1, а не готовая игра. Кнопка запуска появится после интеграции и тестирования движка.',
    legal: 'Независимый фанатский проект. Не связан с Rockstar Games или Take-Two.', source: 'Исходный код',
    reading: 'Чтение метаданных…', scanned: (n) => 'Проверено файлов: ' + n, ready: 'Базовые файлы найдены', incomplete: 'Не хватает файлов',
    complete: (n) => 'В папке найдено файлов: ' + n + '. Проверка наличия не гарантирует совместимости версии игры.',
    missing: 'Не найден', found: 'Найден', optional: 'Дополнительно', archive: (n) => 'IMG VER2: ' + n + ' записей',
    outside: (n) => 'Записей за пределами архива: ' + n, sample: 'Примеры', error: 'Ошибка проверки', unsupported: 'Этот браузер не поддерживает выбор папки через системный диалог. Используйте вторую кнопку.'
  },
  en: {
    phase: 'M1 · Game file preflight', eyebrow: 'UNOFFICIAL BROWSER COMPATIBILITY PORT', heading: 'San Andreas in your browser.',
    lede: 'First milestone: inspect your original PC installation locally. The full game engine is not integrated yet.',
    choose: 'Choose game directory', fallback: 'Choose directory (fallback)',
    privacy: 'Files are read only by your browser. Nothing is uploaded to a server, GitHub, or a public website.',
    preflight: 'Installation preflight', idle: 'No folder selected', instructions: 'Select the root GTA San Andreas directory from your own PC installation (not Definitive Edition).',
    notplayable: 'This is an M1 diagnostics build, not a playable game. Launch will be enabled only after engine integration and testing.',
    legal: 'Independent fan project. Not affiliated with Rockstar Games or Take-Two.', source: 'Source code',
    reading: 'Reading metadata…', scanned: (n) => 'Files scanned: ' + n, ready: 'Required files detected', incomplete: 'Files missing',
    complete: (n) => 'Found ' + n + ' files. Presence alone does not establish version compatibility.',
    missing: 'Missing', found: 'Found', optional: 'Optional', archive: (n) => 'IMG VER2: ' + n + ' entries',
    outside: (n) => 'Entries outside archive bounds: ' + n, sample: 'Sample', error: 'Validation error', unsupported: 'Your browser does not support the system directory picker. Use the fallback button.'
  }
};
const $ = (id) => document.getElementById(id);
let lang = localStorage.getItem('sa-web-lang') === 'en' ? 'en' : 'ru';
let lastRecords = null;
function translate() {
  document.documentElement.lang = lang;
  for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = copy[lang][node.dataset.i18n];
  $('locale').textContent = lang === 'ru' ? 'EN' : 'RU';
  if (lastRecords) void inspect(lastRecords);
}
$('locale').addEventListener('click', () => { lang = lang === 'ru' ? 'en' : 'ru'; localStorage.setItem('sa-web-lang', lang); translate(); });
function setStatus(text, kind = '') { $('status').textContent = text; $('status').className = 'status ' + kind; }
async function inspect(records) {
  lastRecords = records;
  const t = copy[lang];
  const result = summarizeInstall(records);
  setStatus(result.valid ? t.ready : t.incomplete, result.valid ? 'success' : 'warning');
  $('summary').textContent = t.complete(result.total);
  $('checks').replaceChildren();
  for (const check of [...result.required, ...result.optional]) {
    const item = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = check.path + ('size' in check && check.found ? ' (' + formatBytes(check.size) + ')' : '');
    const indicator = document.createElement('strong');
    indicator.textContent = check.found ? t.found : ('size' in check ? t.missing : t.optional);
    indicator.className = check.found ? 'yes' : ('size' in check ? 'no' : 'optional');
    item.append(label, indicator); $('checks').append(item);
  }
  const archive = $('archive');
  archive.hidden = true; archive.textContent = '';
  if (result.files.has('models/gta3.img')) {
    try {
      const info = await readImgDirectory(result.files.get('models/gta3.img'));
      const heading = document.createElement('strong'); heading.textContent = t.archive(info.count);
      const detail = document.createElement('p'); detail.textContent = t.outside(info.outOfBounds) + ' · ' + t.sample + ': ' + info.sample.join(', ');
      archive.append(heading, detail); archive.hidden = false;
      if (info.outOfBounds) setStatus(t.error, 'warning');
    } catch (error) {
      archive.textContent = t.error + ': ' + (error instanceof Error ? error.message : String(error)); archive.hidden = false;
      setStatus(t.error, 'warning');
    }
  }
}
async function handleRecords(records) {
  const t = copy[lang]; setStatus(t.reading); $('choose').disabled = true; $('folder').disabled = true;
  try { await inspect(records); }
  catch (error) { setStatus(t.error, 'warning'); $('summary').textContent = error instanceof Error ? error.message : String(error); }
  finally { $('choose').disabled = false; $('folder').disabled = false; }
}
$('choose').addEventListener('click', async () => {
  if (!('showDirectoryPicker' in window)) { $('summary').textContent = copy[lang].unsupported; return; }
  try {
    const root = await window.showDirectoryPicker({ mode: 'read' });
    setStatus(copy[lang].reading);
    await handleRecords(await collectFromDirectory(root, (n) => setStatus(copy[lang].scanned(n))));
  } catch (error) {
    if (error?.name !== 'AbortError') { setStatus(copy[lang].error, 'warning'); $('summary').textContent = error instanceof Error ? error.message : String(error); }
  }
});
$('folder').addEventListener('change', async (event) => {
  const files = [...(event.target.files || [])];
  if (files.length) await handleRecords(files.map(file => ({ path: file.webkitRelativePath || file.name, file })));
  event.target.value = '';
});
translate();
