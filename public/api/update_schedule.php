<?php
declare(strict_types=1);

// POST /api/update_schedule.php  { "schedule": [ { "time": "09:30 AM", "title": "...", "description": ["..."] } ] }
//                            or  { "date": "2026-11-28" }
// Saves the "Check The Schedule" list and/or the schedule's own date (independent of the home page event date).
// Either key may be sent alone; null (or "" for date) resets it to the website default. Admin-only.

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/home_schema.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed.'], 405);
}

require_admin_token();

$body = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($body) || (!array_key_exists('schedule', $body) && !array_key_exists('date', $body))) {
    json_response(['error' => 'Invalid request body.'], 400);
}

$setSchedule = array_key_exists('schedule', $body);
$setDate = array_key_exists('date', $body);

$date = '';
if ($setDate && $body['date'] !== null) {
    $date = trim((string) $body['date']);
    if ($date !== '' && (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !strtotime($date))) {
        json_response(['error' => 'Date must be in YYYY-MM-DD format.'], 400);
    }
}

$clean = null;
if ($setSchedule && $body['schedule'] !== null) {
    if (!is_array($body['schedule']) || count($body['schedule']) > 100) {
        json_response(['error' => 'Schedule must be a list of at most 100 items.'], 400);
    }

    $clean = [];
    foreach ($body['schedule'] as $item) {
        if (!is_array($item)) {
            json_response(['error' => 'Invalid schedule item.'], 400);
        }
        $time = trim((string) ($item['time'] ?? ''));
        $title = trim((string) ($item['title'] ?? ''));
        if ($time === '' || $title === '') {
            json_response(['error' => 'Every schedule item needs a time and a title.'], 400);
        }
        if (!preg_match('/^.{1,30}$/us', $time) || !preg_match('/^.{1,300}$/us', $title)) {
            json_response(['error' => 'Time (max 30) or title (max 300) is too long.'], 400);
        }

        $lines = [];
        foreach ((is_array($item['description'] ?? null) ? $item['description'] : []) as $line) {
            $line = trim((string) $line);
            if ($line === '') {
                continue;
            }
            if (!preg_match('/^.{1,1000}$/us', $line)) {
                json_response(['error' => 'Each detail line can be at most 1000 characters.'], 400);
            }
            $lines[] = $line;
        }

        $entry = ['time' => $time, 'title' => $title];
        if ($lines) {
            $entry['description'] = $lines;
        }
        $clean[] = $entry;
    }
}

$dbSecrets = __DIR__ . '/db_secrets.php';
if (!file_exists($dbSecrets)) {
    json_response(['error' => 'Server is not configured. Copy api/db_secrets.example.php to api/db_secrets.php.'], 500);
}
require_once $dbSecrets;

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

    $id = $pdo->query('SELECT id FROM home ORDER BY id LIMIT 1')->fetchColumn();
    if ($id === false) {
        json_response(['error' => 'No home row found.'], 404);
    }

    if ($setSchedule) {
        $stmt = $pdo->prepare('UPDATE home SET schedule = :schedule WHERE id = :id');
        $stmt->execute([
            ':schedule' => $clean === null ? null : json_encode($clean, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ':id' => $id,
        ]);
    }
    if ($setDate) {
        $stmt = $pdo->prepare('UPDATE home SET scheduledate = :d WHERE id = :id');
        $stmt->execute([':d' => $date, ':id' => $id]);
    }

    json_response(['success' => true, 'data' => $clean, 'date' => $date === '' ? null : $date]);
} catch (PDOException $e) {
    error_log('update_schedule.php DB error: ' . $e->getMessage());
    json_response(['error' => 'Database error.'], 500);
}
