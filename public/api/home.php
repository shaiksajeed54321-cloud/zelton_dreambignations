<?php
declare(strict_types=1);

// GET /api/home.php  ->  returns every row of the `home` table as JSON.

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

    $rows = $pdo->query('SELECT id, state, eventdate, punchLine FROM home ORDER BY id')->fetchAll();

    foreach ($rows as &$row) {
        $row['id'] = (int) $row['id'];
    }
    unset($row);

    echo json_encode(
        ['success' => true, 'count' => count($rows), 'data' => $rows],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT
    );
} catch (PDOException $e) {
    http_response_code(500);
    error_log('home.php DB error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error']);
}
