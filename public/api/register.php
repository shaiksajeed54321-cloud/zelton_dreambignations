<?php
declare(strict_types=1);

// POST /api/register.php  { fullName, email, phone, college, course, yearOfStudy, city }
// Public endpoint: inserts a new row into the `registrations` table.

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed.'], 405);
}

$body = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($body)) {
    json_response(['error' => 'Invalid request body.'], 400);
}

$fields = validate_registration_fields($body);

try {
    $pdo = get_pdo();

    $stmt = $pdo->prepare(
        'INSERT INTO registrations (fullName, email, phone, college, course, yearOfStudy, city)
         VALUES (:fullName, :email, :phone, :college, :course, :yearOfStudy, :city)'
    );
    $stmt->execute($fields);

    $id = (int) $pdo->lastInsertId();

    $stmt = $pdo->prepare(
        "SELECT id, fullName, email, phone, college, course, yearOfStudy, city,
                DATE_FORMAT(submittedAt, '%Y-%m-%dT%H:%i:%s') AS submittedAt
         FROM registrations WHERE id = :id"
    );
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    $row['id'] = (int) $row['id'];

    json_response(['success' => true, 'data' => $row], 201);
} catch (PDOException $e) {
    error_log('register.php DB error: ' . $e->getMessage());
    json_response(['error' => 'Database error.'], 500);
}
