<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed.'], 405);
}

$category = $_GET['category'] ?? null;
$manifest = read_manifest();

if ($category !== null) {
    $manifest = array_values(array_filter(
        $manifest,
        fn($entry) => ($entry['category'] ?? 'general') === $category
    ));
}

json_response($manifest);
