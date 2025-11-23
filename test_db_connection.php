<?php
$host = 'localhost'; // Changed to localhost
$db   = 'realav1';
$user = 'root';
$pass = ''; // Empty password
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "Connected successfully to database '$db' with user '$user' and empty password via localhost.";
} catch (\PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
