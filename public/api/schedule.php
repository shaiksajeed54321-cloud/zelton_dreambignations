<?php
declare(strict_types=1);

// GET /api/schedule.php  ->  { "success": true, "data": [ { time, title, description[] }, ... ] | null, "date": "YYYY-MM-DD" | null }
// `null` means the admin has not saved one, so the website uses its default. `date` is the schedule's own date,
// independent of the home page event date.

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

require_once __DIR__ . '/home_schema.php';

$secretsFile = __DIR__ . '/db_secrets.php';
if (!file_exists($secretsFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Server is not configured. Copy api/db_secrets.example.php to api/db_secrets.php.']);
    exit;
}
require_once $secretsFile;

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT            => 10,
        ]
    );

    ensure_home_columns($pdo);

    $row = $pdo->query('SELECT schedule, scheduledate FROM home ORDER BY id LIMIT 1')->fetch();
    $raw = $row['schedule'] ?? null;
    $items = is_string($raw) && $raw !== '' ? json_decode($raw, true) : null;
    $date = is_string($row['scheduledate'] ?? null) && $row['scheduledate'] !== '' ? $row['scheduledate'] : null;

    echo json_encode(
        ['success' => true, 'data' => is_array($items) ? $items : null, 'date' => $date],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
} catch (PDOException $e) {
    http_response_code(500);
    error_log('schedule.php DB error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error']);
}
