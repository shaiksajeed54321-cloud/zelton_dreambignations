<?php
declare(strict_types=1);

// POST /api/update_registration.php  { id, fullName, email, phone, college, course, yearOfStudy, city }
// Updates one row of the `registrations` table. Admin-only.

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
if (!is_int($id) || $id < 1) {
    json_response(['error' => 'Missing or invalid id.'], 400);
}

$fields = validate_registration_fields($body);

try {
    $pdo = get_pdo();

    $stmt = $pdo->prepare(
        'UPDATE registrations
         SET fullName = :fullName, email = :email, phone = :phone, college = :college,
             course = :course, yearOfStudy = :yearOfStudy, city = :city
         WHERE id = :id'
    );
    $stmt->execute($fields + [':id' => $id]);

    $stmt = $pdo->prepare(
        "SELECT id, fullName, email, phone, college, course, yearOfStudy, city,
                DATE_FORMAT(submittedAt, '%Y-%m-%dT%H:%i:%s') AS submittedAt
         FROM registrations WHERE id = :id"
    );
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if ($row === false) {
        json_response(['error' => 'Row not found.'], 404);
    }

    $row['id'] = (int) $row['id'];
    json_response(['success' => true, 'data' => $row]);
} catch (PDOException $e) {
    error_log('update_registration.php DB error: ' . $e->getMessage());
    json_response(['error' => 'Database error.'], 500);
}
