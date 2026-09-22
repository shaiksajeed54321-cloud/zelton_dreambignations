<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed.'], 405);
}

require_admin_token();

$body = json_decode((string) file_get_contents('php://input'), true);
$id = is_array($body) ? ($body['id'] ?? null) : null;

if (!is_string($id) || $id === '') {
    json_response(['error' => 'Missing file id.'], 400);
}

$manifest = read_manifest();
$index = null;
foreach ($manifest as $i => $entry) {
    if (($entry['id'] ?? null) === $id) {
        $index = $i;
        break;
    }
}

if ($index === null) {
    json_response(['error' => 'File not found.'], 404);
}

$entry = $manifest[$index];
$path = UPLOAD_ROOT . '/' . $entry['category'] . '/' . $entry['storedName'];
if (is_file($path)) {
    unlink($path);
}

array_splice($manifest, $index, 1);
write_manifest($manifest);

json_response(['ok' => true]);
