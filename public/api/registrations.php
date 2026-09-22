<?php
declare(strict_types=1);

// GET /api/registrations.php  ->  returns every row of the `registrations` table. Admin-only.

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed.'], 405);
}

require_admin_token();

try {
    $pdo = get_pdo();

    $rows = $pdo->query(
        "SELECT id, fullName, email, phone, college, course, yearOfStudy, city,
                DATE_FORMAT(submittedAt, '%Y-%m-%dT%H:%i:%s') AS submittedAt
         FROM registrations ORDER BY submittedAt DESC"
    )->fetchAll();

    foreach ($rows as &$row) {
        $row['id'] = (int) $row['id'];
    }
    unset($row);

    json_response(['success' => true, 'count' => count($rows), 'data' => $rows]);
} catch (PDOException $e) {
    error_log('registrations.php DB error: ' . $e->getMessage());
    json_response(['error' => 'Database error.'], 500);
}
