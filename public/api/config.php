<?php
declare(strict_types=1);

header('Content-Type: application/json');
header('Cache-Control: no-store');

function json_response($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

$secretsFile = __DIR__ . '/secrets.php';
if (!file_exists($secretsFile)) {
    json_response(['error' => 'Server is not configured. Copy api/secrets.example.php to api/secrets.php.'], 500);
}
require_once $secretsFile;

if (!defined('ADMIN_TOKEN')) {
    json_response(['error' => 'Server is not configured. ADMIN_TOKEN is missing.'], 500);
}

const UPLOAD_ROOT = __DIR__ . '/../uploads';
const MANIFEST_FILE = UPLOAD_ROOT . '/manifest.json';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_CATEGORIES = ['general', 'upsc', 'jobs'];
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png'];

function require_admin_token(): void
{
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $token = $headers['X-Admin-Token']
        ?? $headers['x-admin-token']
        ?? ($_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '');

    if (!is_string($token) || $token === '' || !hash_equals(ADMIN_TOKEN, $token)) {
        json_response(['error' => 'Unauthorized.'], 401);
    }
}

function read_manifest(): array
{
    if (!file_exists(MANIFEST_FILE)) {
        return [];
    }
    $data = json_decode((string) file_get_contents(MANIFEST_FILE), true);
    return is_array($data) ? $data : [];
}

function write_manifest(array $files): void
{
    if (!is_dir(UPLOAD_ROOT)) {
        mkdir(UPLOAD_ROOT, 0775, true);
    }
    file_put_contents(MANIFEST_FILE, json_encode(array_values($files), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

function get_pdo(): PDO
{
    $dbSecrets = __DIR__ . '/db_secrets.php';
    if (!file_exists($dbSecrets)) {
        json_response(['error' => 'Server is not configured. Copy api/db_secrets.example.php to api/db_secrets.php.'], 500);
    }
    require_once $dbSecrets;

    return new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT            => 10,
        ]
    );
}

// Validates and trims registration form fields from a decoded JSON body.
// Returns a map with ":"-prefixed keys, ready to pass straight into PDOStatement::execute().
function validate_registration_fields(array $body): array
{
    $raw = [
        'fullName'    => trim((string) ($body['fullName'] ?? '')),
        'email'       => trim((string) ($body['email'] ?? '')),
        'phone'       => trim((string) ($body['phone'] ?? '')),
        'college'     => trim((string) ($body['college'] ?? '')),
        'course'      => trim((string) ($body['course'] ?? '')),
        'yearOfStudy' => trim((string) ($body['yearOfStudy'] ?? '')),
        'city'        => trim((string) ($body['city'] ?? '')),
    ];

    foreach ($raw as $value) {
        if ($value === '') {
            json_response(['error' => 'All fields are required.'], 400);
        }
    }

    if (!preg_match('/^[^@\s]+@[^@\s]+\.[^@\s]+$/', $raw['email'])) {
        json_response(['error' => 'Enter a valid email address.'], 400);
    }

    if (!preg_match('/^[6-9]\d{9}$/', $raw['phone'])) {
        json_response(['error' => 'Enter a valid 10-digit Indian mobile number.'], 400);
    }

    $maxLengths = [
        'fullName' => 150, 'email' => 150, 'phone' => 15,
        'college' => 200, 'course' => 150, 'yearOfStudy' => 50, 'city' => 100,
    ];
    foreach ($maxLengths as $key => $max) {
        if (!preg_match('/^.{1,' . $max . '}$/us', $raw[$key])) {
            json_response(['error' => ucfirst($key) . ' is too long.'], 400);
        }
    }

    $params = [];
    foreach ($raw as $key => $value) {
        $params[':' . $key] = $value;
    }
    return $params;
}
