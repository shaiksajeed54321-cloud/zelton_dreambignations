<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed.'], 405);
}

require_admin_token();

$category = $_POST['category'] ?? '';
if (!in_array($category, ALLOWED_CATEGORIES, true)) {
    json_response(['error' => 'Invalid category.'], 400);
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    json_response(['error' => 'No file uploaded.'], 400);
}

$file = $_FILES['file'];

if ($file['size'] > MAX_FILE_SIZE) {
    json_response(['error' => 'File is too large (max ' . (MAX_FILE_SIZE / 1024 / 1024) . 'MB).'], 400);
}

$originalName = basename($file['name']);
$ext = strtolower((string) pathinfo($originalName, PATHINFO_EXTENSION));
$ext = preg_replace('/[^a-z0-9]/', '', $ext);

if (!in_array($ext, ALLOWED_EXTENSIONS, true)) {
    json_response(['error' => 'Unsupported file type.'], 400);
}

$storedName = bin2hex(random_bytes(16)) . ($ext !== '' ? ".$ext" : '');

$uploadedBy = trim((string) ($_POST['uploadedBy'] ?? ''));
if ($uploadedBy === '') {
    $uploadedBy = 'Admin';
}
$uploadedBy = mb_substr($uploadedBy, 0, 100);

$destDir = UPLOAD_ROOT . '/' . $category;
if (!is_dir($destDir)) {
    mkdir($destDir, 0775, true);
}

if (!move_uploaded_file($file['tmp_name'], $destDir . '/' . $storedName)) {
    json_response(['error' => 'Failed to save file.'], 500);
}

$entry = [
    'id' => bin2hex(random_bytes(8)),
    'name' => $originalName,
    'size' => $file['size'],
    'type' => $file['type'] !== '' ? $file['type'] : 'application/octet-stream',
    'uploadedAt' => gmdate('c'),
    'uploadedBy' => $uploadedBy,
    'status' => 'active',
    'category' => $category,
    'storedName' => $storedName,
    'url' => '/uploads/' . $category . '/' . $storedName,
];

$manifest = read_manifest();
$manifest[] = $entry;
write_manifest($manifest);

json_response($entry, 201);
