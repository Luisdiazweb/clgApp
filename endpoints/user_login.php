<?php

header('content-type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
$email = isset($_POST["email"]) ? $_POST["email"] : "";
$pw = isset($_POST["password"]) ? $_POST["password"] : "";
$real = md5("adiel@dccolorweb.com-adiel123");
$to_check = md5($email . "-". $pw);

$json = [
	"error" => 0,
	"message" => "Logueado correctamente",
	"user" => [
		"email" => $email,
		"password" => $pw
	],
	"_tokenizer" => [
		"_r" => $real,
		"_r_f" => "adiel@dccolorweb.com-adiel123",
		"_g" => $to_check,
		"_g_f" => $email . "-". $pw,
		"_f" => $_POST
	]
];

if ( $real == $to_check ) {
	echo json_encode($json);
} else {
	$json["error"] = 1;
	$json["message"] = "Crendenciales invalidas";
	$json["user"] = [];

	echo json_encode($json);
}