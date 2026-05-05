<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=realav1', 'root', '');
    echo "Connected successfully to realav1";
} catch (Exception $e) {
    echo $e->getMessage();
}
