<?php
declare(strict_types=1);

// Adds the optional event columns to the `home` table the first time they are needed,
// so no manual SQL has to be run on the server.

function ensure_home_columns(PDO $pdo): void
{
    $wanted = [
        'starttime' => "VARCHAR(5) NOT NULL DEFAULT ''",
        'endtime'   => "VARCHAR(5) NOT NULL DEFAULT ''",
        'venue'     => "VARCHAR(255) NOT NULL DEFAULT ''",
        'address'   => "VARCHAR(500) NOT NULL DEFAULT ''",
        'schedule'  => "MEDIUMTEXT NULL",
        'scheduledate' => "VARCHAR(10) NOT NULL DEFAULT ''",
    ];

    $stmt = $pdo->prepare(
        'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :t'
    );
    $stmt->execute([':t' => 'home']);
    $existing = array_map('strtolower', $stmt->fetchAll(PDO::FETCH_COLUMN));

    foreach ($wanted as $name => $definition) {
        if (!in_array($name, $existing, true)) {
            $pdo->exec("ALTER TABLE home ADD COLUMN `$name` $definition");
        }
    }
}
