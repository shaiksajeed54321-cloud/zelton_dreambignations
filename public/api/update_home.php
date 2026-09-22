<?php
declare(strict_types=1);

// POST /api/update_home.php  { "id": 1, "state": "Karnataka", "eventdate": "..." }
// Updates the `state` and `eventdate` columns of one row in the `home` table. Admin-only.

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed.'], 405);
}

require_admin_token();

$body = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($body)) {
    json_response(['error' => 'Invalid request body.'], 400);
}

$id = $body['id'] ?? null;
$state = $body['state'] ?? null;
$eventdate = $body['eventdate'] ?? null;

if (!is_int($id) || $id < 1) {
    json_response(['error' => 'Missing or invalid id.'], 400);
}

if (!is_string($state) || !is_string($eventdate)) {
    json_response(['error' => 'State and event date are required.'], 400);
}

$state = trim($state);
$eventdate = trim($eventdate);

if ($state === '' || $eventdate === '') {
    json_response(['error' => 'State and event date cannot be empty.'], 400);
}

// Counts characters (not bytes) and rejects invalid UTF-8, without needing the mbstring extension.
if (!preg_match('/^.{1,100}$/us', $state) || !preg_match('/^.{1,100}$/us', $eventdate)) {
    json_response(['error' => 'State and event date must be valid text of at most 100 characters.'], 400);
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

    $stmt = $pdo->prepare('UPDATE home SET state = :state, eventdate = :eventdate WHERE id = :id');
    $stmt->execute([':state' => $state, ':eventdate' => $eventdate, ':id' => $id]);

    // rowCount() is 0 when the values were unchanged, so confirm the row exists by re-reading it.
    $stmt = $pdo->prepare('SELECT id, state, eventdate, punchLine FROM home WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if ($row === false) {
        json_response(['error' => 'Row not found.'], 404);
    }

    $row['id'] = (int) $row['id'];
    json_response(['success' => true, 'data' => $row]);
} catch (PDOException $e) {
    error_log('update_home.php DB error: ' . $e->getMessage());
    json_response(['error' => 'Database error.'], 500);
}
