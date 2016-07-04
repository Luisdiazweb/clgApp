<?php

include "vendor/NotORM/NotORM.php";
$pdo = new PDO("mysql:dbname=clg", "root", "");
$db = new NotORM($pdo);

header('content-type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");