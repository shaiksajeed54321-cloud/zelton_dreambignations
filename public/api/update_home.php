<?php
declare(strict_types=1);

// POST /api/update_home.php  { "id": 1, "state": "Karnataka", "eventdate": "..." }
// Updates the event details (state, date, start/end time, venue, address) of one row in `home`. Admin-only.

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/home_schema.php';

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

// Optional event details. Times are HH:mm; empty means "use the website default".
$starttime = trim((string) ($body['starttime'] ?? ''));
$endtime = trim((string) ($body['endtime'] ?? ''));
$venue = trim((string) ($body['venue'] ?? ''));
$address = trim((string) ($body['address'] ?? ''));

// The Venue & Time section's own date (YYYY-MM-DD); only changed when sent, empty = follow the event date.
$setVenueDate = array_key_exists('venuedate', $body);
$venuedate = trim((string) ($body['venuedate'] ?? ''));
if ($venuedate !== '' && (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $venuedate) || !strtotime($venuedate))) {
    json_response(['error' => 'Venue date must be in YYYY-MM-DD format.'], 400);
}

foreach ([$starttime, $endtime] as $time) {
    if ($time !== '' && !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $time)) {
        json_response(['error' => 'Times must be in HH:mm format.'], 400);
    }
}
if (!preg_match('/^.{0,255}$/us', $venue) || !preg_match('/^.{0,500}$/us', $address)) {
    json_response(['error' => 'Venue (max 255) or address (max 500) is too long.'], 400);
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

    $stmt = $pdo->prepare(
        'UPDATE home SET state = :state, eventdate = :eventdate, starttime = :starttime,
                endtime = :endtime, venue = :venue, address = :address WHERE id = :id'
    );
    $stmt->execute([
        ':state' => $state, ':eventdate' => $eventdate, ':starttime' => $starttime,
        ':endtime' => $endtime, ':venue' => $venue, ':address' => $address, ':id' => $id,
    ]);

    if ($setVenueDate) {
        $stmt = $pdo->prepare('UPDATE home SET venuedate = :d WHERE id = :id');
        $stmt->execute([':d' => $venuedate, ':id' => $id]);
    }

    // rowCount() is 0 when the values were unchanged, so confirm the row exists by re-reading it.
    $stmt = $pdo->prepare('SELECT * FROM home WHERE id = :id');
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
